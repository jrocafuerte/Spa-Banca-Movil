# Seguridad — Banca Móvil

Marco: **OWASP MASVS v2 / MASTG** (app), **OWASP ASVS 4.0** nivel 2–3 y **OWASP API Security Top 10 2023** (BFFs), **PCI DSS 4.0** (datos de tarjeta), normativa local de banca digital (autenticación reforzada, MFA).

## 1. Modelo de amenazas (STRIDE resumido)

| Amenaza | Ejemplo | Mitigación implementada |
|---|---|---|
| **S**poofing | Robo de credenciales / token | MFA obligatorio, tokens ES256 de 5 min ligados a dispositivo (`did`) y sesión (`sid`), refresh rotativo con detección de reutilización |
| **T**ampering | Cambiar monto o destino en tránsito o en el WebView | Flujos *prepare/confirm* e *intent*; montos fijados en servidor; step-up con `txn`=hash y `amt`; firma HMAC del dispositivo sobre la operación; SSL pinning |
| **R**epudiation | "Yo no hice ese pago" | Firma criptográfica con clave liberada por biometría (`amr: hwk`), `X-Request-Id`, logs de auditoría por operación |
| **I**nformation disclosure | PAN, saldos en logs, capturas, backups | PAN enmascarado en el BFF, logs sin PII (regla Semgrep), `FLAG_SECURE`/bloqueo de capturas, difuminado en app switcher, `allowBackup=false`, `no-store` |
| **D**enial of service | Fuerza bruta de login/OTP | Rate limiting por endpoint, bloqueo temporal tras 5 fallos, OTP de 3 intentos, límites de payload (16 KB) |
| **E**levation of privilege | Ver cuentas ajenas (BOLA), mass assignment | Autorización por objeto en cada endpoint, schemas `strictObject`, guard global deny-by-default |

## 2. Controles por requisito MASVS (app)

| MASVS | Control | Implementación |
|---|---|---|
| STORAGE-1/2 | Datos sensibles solo en almacenamiento seguro | `expo-secure-store` con `WHEN_UNLOCKED_THIS_DEVICE_ONLY`; access token solo en memoria; caché de React Query purgada al bloquear |
| CRYPTO-1/2 | Criptografía estándar, aleatoriedad segura | `expo-crypto` (CSPRNG, SHA-256), HMAC-SHA256 RFC 2104 con vectores RFC 4231 en tests |
| AUTH-1/2/3 | Autenticación en servidor, biometría ligada a criptografía | Biometría desbloquea items del Keychain/Keystore (refresh token y clave de firma); **no** se usa el booleano de `authenticateAsync` para autorizar operaciones |
| NETWORK-1/2 | TLS y pinning | ATS / sin cleartext fuera de dev; `react-native-ssl-public-key-pinning` (2 pines por dominio, expiración) |
| PLATFORM-1/2/3 | IPC/WebView seguros, UI | WebView endurecido (§4); `SYSTEM_ALERT_WINDOW` bloqueado; campos de clave sin menú contextual |
| CODE-1/4 | Dependencias y validación de entradas | SCA en CI, Dependabot; Zod en cliente (UX) y servidor (autoritativo) |
| RESILIENCE-1/2/4 | Integridad del entorno | `jail-monkey` (root/jailbreak/hooking/debugger) — bloqueante en producción; roadmap: Play Integrity / App Attest + RASP |
| PRIVACY-1 | Minimización | `deviceId` aleatorio (no IMEI/IDFA); privacy manifest sin tracking |

## 3. Controles API (OWASP API Top 10 2023)

| Riesgo | Control |
|---|---|
| API1 BOLA | Verificación de propiedad en movimientos, cuentas origen, tarjetas, intents y comprobantes (tests e2e) |
| API2 Broken Authentication | MFA, ES256, `typ`/`aud`/`iss`/`exp` validados, `algorithms` fijados (regla Semgrep), JWKS, device binding |
| API3 BOPLA | `strictObject` rechaza propiedades extra; respuestas con DTOs explícitos (sin `ownerId`, PAN completo, etc.) |
| API4 Resource consumption | Throttler global + por endpoint, `limit` máximo en paginación, body ≤ 16 KB, timeouts |
| API5 Function level authz | Guard global deny-by-default; `@Public()` explícito y revisable |
| API6 Sensitive business flows | Idempotency-Key obligatoria; prepare/confirm; OTP por umbral; firma de dispositivo |
| API7 SSRF | El proxy de Next solo reenvía rutas de una allowlist; URLs de upstream solo desde configuración |
| API8 Misconfiguration | Helmet, HSTS, CSP, `x-powered-by` off, errores RFC 9457 sin stack, config validada al arranque (fail-fast) |
| API9 Inventory | `openapi.yaml` versionado por BFF, usado también por el DAST |
| API10 Unsafe consumption | Respuestas del core/agregador tratadas como no confiables (tipadas y validadas en adaptadores productivos) |

## 4. WebView (micro frontend de recaudos)

- `originWhitelist` + `onShouldStartLoadWithRequest` ⇒ solo el origen de recaudos; enlaces externos bloqueados.
- `incognito`, `cacheEnabled=false`, sin cookies compartidas ni de terceros.
- `allowFileAccess*`/`allowUniversalAccessFromFileURLs` = false, `mixedContentMode="never"`, `setSupportMultipleWindows=false`.
- `webviewDebuggingEnabled` solo fuera de producción.
- El handoff token va en el **cuerpo de un POST** (no en URL / historial / logs) y es de un solo uso (60 s).
- Cada mensaje del puente se valida por **origen** y **schema**; las respuestas se correlacionan por `replyTo`; un solo step-up en curso.
- Hallazgos de mobsfscan aceptados y justificados en [`../.mobsf`](../.mobsf): JS habilitado (requerido), `onMessage` (validado por delegación), URI dinámica (constante de configuración).

## 5. Gestión de secretos

- Nada secreto en el binario ni en `EXPO_PUBLIC_*` / `NEXT_PUBLIC_*` (reglas Semgrep + verificación del bundle en CI).
- BFFs: clave privada ES256 y `INTERNAL_CLIENT_SECRET` desde Vault/KMS; validación al arranque (no inician sin ellas en producción).
- Rotación: nuevo `kid` publicado en el JWKS antes de firmar con él; `mse-recaudos` cachea el JWKS (10 min) y reintenta por `kid` desconocido.

## 6. Pipeline de seguridad

Ver tabla en [ARCHITECTURE.md §7](ARCHITECTURE.md#7-devsecops-pipeline-por-repositorio). Umbrales: 0 vulnerabilidades HIGH/CRITICAL corregibles, 0 secretos, 0 alertas ZAP High, quality gate de SonarQube en verde, MobSF score ≥ 60 y 0 hallazgos high.

**DAST móvil** (fuera de CI, antes de cada release mayor): pruebas MASTG con Frida/objection (bypass de pinning/root, hooking de biometría — debe fallar gracias a la firma criptográfica), análisis dinámico MobSF, revisión de tráfico con proxy, y pentest independiente.

## 7. Reporte de vulnerabilidades

Reportar a `seguridad@banco.example` (PGP disponible). No abrir issues públicos con detalles explotables.
