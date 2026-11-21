import { type BridgeDeps, createNativeBridge, toInjectedScript } from './nativeBridge';

const ORIGIN = 'https://recaudos.banco.example';
const HASH = 'a'.repeat(64);

function setup(overrides: Partial<BridgeDeps> = {}) {
  const posted: string[] = [];
  let n = 0;
  const deps: BridgeDeps = {
    trustedOrigins: [ORIGIN],
    post: (s) => posted.push(s),
    newId: () => `id-0000000${n++}`,
    setHeader: jest.fn(),
    confirmPayment: jest.fn().mockResolvedValue(true),
    requestStepUpToken: jest.fn().mockResolvedValue('x'.repeat(40)),
    share: jest.fn().mockResolvedValue(undefined),
    haptic: jest.fn(),
    close: jest.fn(),
    openNative: jest.fn(),
    onSessionExpired: jest.fn(),
    onReady: jest.fn(),
    ...overrides,
  };
  const bridge = createNativeBridge(deps);
  const decode = (i: number) => JSON.parse(JSON.parse(posted[i]!.match(/receive\((.*)\); true;$/)![1]!));
  return { deps, bridge, posted, decode };
}

const msg = (type: string, payload?: unknown) =>
  JSON.stringify({ v: 1, id: 'web-00000001', ts: Date.now(), source: 'recaudos-web', type, payload });

describe('native bridge', () => {
  it('ignora mensajes de orígenes no confiables', async () => {
    const { bridge, deps } = setup();
    await bridge.onMessage(msg('CLOSE', { reason: 'done' }), 'https://evil.example/page');
    expect(deps.close).not.toHaveBeenCalled();
  });

  it('ignora mensajes que no cumplen el contrato', async () => {
    const { bridge, deps } = setup();
    await bridge.onMessage(msg('OPEN_NATIVE', { route: 'settings' }), `${ORIGIN}/`);
    expect(deps.openNative).not.toHaveBeenCalled();
  });

  it('step-up aprobado devuelve el token como respuesta al mensaje', async () => {
    const { bridge, deps, decode } = setup();
    await bridge.onMessage(
      msg('REQUEST_STEP_UP', { intentHash: HASH, amount: 76, currency: 'USD', billerName: 'Luz', reference: '123456' }),
      `${ORIGIN}/billers/blr-001`,
    );
    expect(deps.confirmPayment).toHaveBeenCalled();
    expect(deps.requestStepUpToken).toHaveBeenCalledWith(expect.objectContaining({ intentHash: HASH, amount: 76 }));
    const reply = decode(0);
    expect(reply).toMatchObject({ type: 'STEP_UP_RESULT', replyTo: 'web-00000001', payload: { status: 'approved' } });
  });

  it('si el usuario cancela la biometría no se solicita token', async () => {
    const { bridge, deps, decode } = setup({ confirmPayment: jest.fn().mockResolvedValue(false) });
    await bridge.onMessage(
      msg('REQUEST_STEP_UP', { intentHash: HASH, amount: 10, currency: 'USD', billerName: 'Luz', reference: '123456' }),
      `${ORIGIN}/`,
    );
    expect(deps.requestStepUpToken).not.toHaveBeenCalled();
    expect(decode(0).payload.status).toBe('cancelled');
  });

  it('el script inyectado no permite romper el literal (inyección JS)', () => {
    const payload = { text: '"); alert(1); ("</script>' };
    const script = toInjectedScript(payload);
    const arg = script.match(/receive\((.*)\); true;$/)![1]!;
    // El argumento es UN único literal de string JS (sin cortes) …
    expect(arg).toMatch(/^"(?:[^"\\]|\\.)*"$/);
    // … que al decodificarse reproduce exactamente los datos originales.
    expect(JSON.parse(JSON.parse(arg))).toEqual(payload);
  });
});
