import { BRIDGE_VERSION, type NativeToWeb, type WebEnvelope, parseWebMessage } from './protocol';

export interface BridgeDeps {
  trustedOrigins: string[];
  /** Inyecta el mensaje en el WebView (window.__BANCA_BRIDGE__.receive). */
  post(script: string): void;
  newId(): string;
  setHeader(title: string, canGoBack: boolean): void;
  /** Hoja de confirmación nativa + biometría. true = el usuario aprobó. */
  confirmPayment(p: { amount: number; currency: string; billerName: string; reference: string }): Promise<boolean>;
  requestStepUpToken(p: { intentHash: string; amount: number; currency: string }): Promise<string>;
  share(text: string): Promise<void>;
  haptic(style: 'light' | 'success' | 'warning' | 'error'): void;
  close(reason: 'done' | 'cancel'): void;
  openNative(route: 'position' | 'transfers'): void;
  onSessionExpired(): void;
  onReady(): void;
  log?(event: string, data?: Record<string, unknown>): void;
}

export function originOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

/**
 * Serializa un mensaje nativo → web como un literal JS seguro. Se usa doble
 * JSON.stringify para que el contenido nunca se interprete como código
 * (evita inyección de JS a través de datos).
 */
export function toInjectedScript(envelope: object): string {
  const json = JSON.stringify(JSON.stringify(envelope));
  return `window.__BANCA_BRIDGE__ && window.__BANCA_BRIDGE__.receive(${json}); true;`;
}

/**
 * Lado nativo del puente. Cada mensaje del WebView se valida por:
 * 1) origen de la página que lo emite (allowlist), 2) esquema Zod,
 * 3) reglas de negocio (p. ej. un único step-up en curso).
 */
export function createNativeBridge(deps: BridgeDeps) {
  let stepUpInFlight = false;

  const send = (message: NativeToWeb, replyTo?: string) =>
    deps.post(
      toInjectedScript({
        v: BRIDGE_VERSION,
        id: deps.newId(),
        ts: Date.now(),
        source: 'banca-app',
        replyTo,
        ...message,
      }),
    );

  async function handleStepUp(msg: Extract<WebEnvelope, { type: 'REQUEST_STEP_UP' }>) {
    if (stepUpInFlight) return;
    stepUpInFlight = true;
    try {
      const approved = await deps.confirmPayment(msg.payload);
      if (!approved) {
        send({ type: 'STEP_UP_RESULT', payload: { status: 'cancelled' } }, msg.id);
        return;
      }
      const stepUpToken = await deps.requestStepUpToken(msg.payload);
      send({ type: 'STEP_UP_RESULT', payload: { status: 'approved', stepUpToken } }, msg.id);
    } catch {
      send(
        { type: 'STEP_UP_RESULT', payload: { status: 'failed', reason: 'No pudimos autorizar la operación' } },
        msg.id,
      );
    } finally {
      stepUpInFlight = false;
    }
  }

  return {
    send,
    /** Handler para `onMessage` del WebView. */
    async onMessage(data: string, pageUrl: string | undefined): Promise<void> {
      const origin = originOf(pageUrl);
      if (!origin || !deps.trustedOrigins.includes(origin)) {
        deps.log?.('bridge.rejected.origin', { origin });
        return;
      }
      const msg = parseWebMessage(data);
      if (!msg) {
        deps.log?.('bridge.rejected.schema');
        return;
      }
      switch (msg.type) {
        case 'READY':
          return deps.onReady();
        case 'SET_HEADER':
          return deps.setHeader(msg.payload.title, msg.payload.canGoBack);
        case 'REQUEST_STEP_UP':
          return handleStepUp(msg);
        case 'SHARE_RECEIPT':
          return deps.share(msg.payload.text);
        case 'HAPTIC':
          return deps.haptic(msg.payload.style);
        case 'SESSION_EXPIRED':
          return deps.onSessionExpired();
        case 'CLOSE':
          return deps.close(msg.payload.reason);
        case 'OPEN_NATIVE':
          return deps.openNative(msg.payload.route);
      }
    },
  };
}

export type NativeBridge = ReturnType<typeof createNativeBridge>;
