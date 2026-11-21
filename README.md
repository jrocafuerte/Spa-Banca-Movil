# spa-banca-movil

App nativa (iOS/Android) de Banca Móvil — **React Native + Expo** (Continuous Native Generation, Expo Router, TypeScript estricto).

- 📐 Arquitectura de toda la solución (4 repos): [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- 🔐 Seguridad (MASVS, amenazas, controles): [`docs/SECURITY.md`](docs/SECURITY.md)

## Módulos

| Módulo | Ruta | Backend |
|---|---|---|
| Autenticación (login, OTP, biometría, logout) | `src/app/(auth)`, `src/features/auth` | mse-banca-movil |
| Posición consolidada y movimientos | `src/app/(app)/index.tsx`, `accounts/[id]` | mse-banca-movil |
| Transferencias (propias, terceros, interbancarias) | `src/app/(app)/transfers` | mse-banca-movil |
| Pago de tarjetas | `src/app/(app)/payments/card.tsx` | mse-banca-movil |
| Pago de servicios (**micro frontend en WebView**) | `src/features/service-payments` | spa-recaudos + mse-recaudos |

## Desarrollo

```bash
cp .env.example .env            # solo URLs públicas
npm ci
npx expo run:android            # development build (módulos nativos: pinning, jail-monkey, webview)
npm test                        # Jest
npm run lint && npm run typecheck
```

Usuario demo (BFF en memoria): documento `12345678`, clave `Demo#2026`, OTP `123456`.

> `ios/` y `android/` se generan con `npx expo prebuild`; no se editan a mano. La configuración nativa vive en `app.config.ts`.

## Contrato del puente

`src/features/service-payments/bridge/protocol.ts` es idéntico al de `spa-recaudos`. Si cambia, actualizar ambos repos y `contracts/bridge-protocol.sha256`:

```bash
sha256sum src/features/service-payments/bridge/protocol.ts > contracts/bridge-protocol.sha256
```
