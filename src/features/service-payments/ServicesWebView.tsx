import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import { type ComponentType, type Ref, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, BackHandler, Platform, Share, useColorScheme } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import Constants from 'expo-constants';
import { config, isProduction, trustedWebOrigins } from '../../core/config';
import { transactionSigning } from '../../core/security/transactionSigning';
import { useSession } from '../../core/session/sessionStore';
import { Button, ErrorText, HeaderButton, Loading, Screen, useTheme } from '../../shared/ui';
import { formatMoney } from '../position/api';
import { servicePaymentsApi } from './api';
import { type NativeBridge, createNativeBridge, originOf } from './bridge/nativeBridge';

/** Los tipos publicados declaran WebView sin ref; se expone el handle imperativo que usamos. */
interface WebViewHandle {
  injectJavaScript(script: string): void;
  reload(): void;
}
const SecureWebView = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

/**
 * Host nativo del micro frontend de Pago de Servicios.
 * - Sesión: handoff token de un solo uso enviado por POST (no en la URL).
 * - Navegación restringida a los orígenes confiables; enlaces externos bloqueados.
 * - Cabecera, botón atrás, hápticos, compartir y confirmación biométrica son NATIVOS.
 */
export function ServicesWebView() {
  const navigation = useNavigation();
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = useTheme();
  const ref = useRef<WebViewHandle>(null);
  const [handoff, setHandoff] = useState<string>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  // 1) Obtener handoff token de un solo uso (60 s).
  const retry = useCallback(() => {
    setError(undefined);
    setHandoff(undefined);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    servicePaymentsApi
      .handoff()
      .then((r) => !cancelled && setHandoff(r.handoffToken))
      .catch(() => !cancelled && setError('No pudimos abrir Pago de servicios.'));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const bridgeRef = useRef<NativeBridge | null>(null);

  // 2) Puente nativo: se recrea si cambian navegación o tema.
  useEffect(() => {
    const bridge: NativeBridge = createNativeBridge({
      trustedOrigins: trustedWebOrigins,
      post: (script) => ref.current?.injectJavaScript(script),
      newId: () => Crypto.randomUUID(),
      setHeader: (title, canGoBack) => navigation.setOptions({ title, headerBackVisible: canGoBack }),
      confirmPayment: async ({ amount, currency, billerName, reference }) => {
        const accepted = await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Confirmar pago',
            `${billerName}\nReferencia ${reference}\n\n${formatMoney(amount, currency as never)}`,
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Pagar', onPress: () => resolve(true) },
            ],
          ),
        );
        return accepted;
      },
      requestStepUpToken: async (p) => {
        // La firma lee la clave protegida por biometría: el SO muestra Face ID / huella aquí.
        const signature = await transactionSigning.sign(p.intentHash, p.amount, p.currency);
        if (!signature && isProduction) throw new Error('Biometría requerida');
        return (await servicePaymentsApi.stepUp({ ...p, signature })).stepUpToken;
      },
      share: async (text) => {
        await Share.share({ message: text });
      },
      haptic: (style) => {
        if (style === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType[
              style === 'success' ? 'Success' : style === 'warning' ? 'Warning' : 'Error'
            ],
          );
      },
      close: () => router.back(),
      openNative: (route) => router.replace(route === 'position' ? '/' : '/transfers'),
      onSessionExpired: () => {
        Alert.alert('Sesión expirada', 'Vuelve a intentarlo.', [{ text: 'OK', onPress: () => router.back() }]);
      },
      onReady: () =>
        bridge.send({
          type: 'INIT',
          payload: {
            locale: 'es',
            theme: scheme === 'dark' ? 'dark' : 'light',
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
            appVersion: Constants.expoConfig?.version ?? '0.0.0',
          },
        }),
      log: (event, data) => {
        if (!isProduction) console.warn(event, data);
      },
    });
    bridgeRef.current = bridge;
    return () => {
      bridgeRef.current = null;
    };
  }, [navigation, router, scheme]);

  // Botón atrás nativo (header y hardware Android) → el micro frontend decide.
  const onBack = useCallback(() => {
    bridgeRef.current?.send({ type: 'BACK_PRESSED' });
    return true;
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderButton label="Atrás" glyph="‹" onPress={onBack} />,
    });
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [navigation, onBack]);

  // Estado de la app → el web oculta datos sensibles en segundo plano.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) =>
      bridgeRef.current?.send({ type: 'APP_STATE', payload: { state: s === 'active' ? 'active' : 'background' } }),
    );
    return () => sub.remove();
  }, []);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    useSession.getState().touch();
    void bridgeRef.current?.onMessage(e.nativeEvent.data, e.nativeEvent.url);
  }, []);

  /** Solo se permite navegar dentro de los orígenes confiables. */
  const onShouldStartLoad = useCallback((req: ShouldStartLoadRequest) => {
    const origin = originOf(req.url);
    return !!origin && trustedWebOrigins.includes(origin);
  }, []);

  if (error) {
    return (
      <Screen>
        <ErrorText>{error}</ErrorText>
        <Button title="Reintentar" onPress={retry} />
      </Screen>
    );
  }
  if (!handoff) {
    return <Loading />;
  }

  // Hallazgos de mobsfscan revisados y aceptados (ver .mobsf y docs/SECURITY.md §WebView):
  // - JS habilitado: requerido por el micro frontend; mitigado con allowlist de orígenes + CSP estricta.
  // - onMessage: se valida origen + schema Zod en createNativeBridge().onMessage.
  // - URI dinámica: proviene de configuración firmada en el binario, no de entrada del usuario.
  return (
    <SecureWebView
      ref={ref}
      source={{
        uri: `${config.recaudosUrl}/session/start`,
        method: 'POST',
        body: `handoff=${encodeURIComponent(handoff)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }}
      originWhitelist={trustedWebOrigins}
      onShouldStartLoadWithRequest={onShouldStartLoad}
      onMessage={onMessage}
      onContentProcessDidTerminate={() => ref.current?.reload()}
      onRenderProcessGone={retry}
      onHttpError={(e) => e.nativeEvent.statusCode >= 500 && setError('El servicio no está disponible.')}
      onError={() => setError('No pudimos cargar Pago de servicios.')}
      // ---- Endurecimiento del WebView (MASVS-PLATFORM) ----
      javaScriptEnabled
      incognito // cookies/almacenamiento solo en memoria; se descartan al cerrar
      cacheEnabled={false}
      sharedCookiesEnabled={false}
      thirdPartyCookiesEnabled={false}
      allowFileAccess={false}
      allowFileAccessFromFileURLs={false}
      allowUniversalAccessFromFileURLs={false}
      mixedContentMode="never"
      setSupportMultipleWindows={false}
      javaScriptCanOpenWindowsAutomatically={false}
      allowsLinkPreview={false}
      geolocationEnabled={false}
      mediaPlaybackRequiresUserAction
      webviewDebuggingEnabled={!isProduction}
      textZoom={100}
      overScrollMode="never"
      bounces={false}
      pullToRefreshEnabled={false}
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      // Fondo con el token del tema: evita el destello blanco mientras carga el micro frontend
      style={{ flex: 1, backgroundColor: theme.color.background }}
    />
  );
}
