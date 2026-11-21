import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ApiError } from '../../core/api/http';
import { useSession } from '../../core/session/sessionStore';
import { authApi } from '../../features/auth/api';
import { Button, ErrorText, Label, Screen, TextField, Title } from '../../shared/ui';

const Schema = z.object({
  documentId: z.string().regex(/^\d{8,12}$/, 'Documento inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(64),
});

export default function Login() {
  const router = useRouter();
  const status = useSession((s) => s.status);
  const [documentId, setDocumentId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  // Sesión previa con biometría: el refresh token en Keychain/Keystore exige Face ID/huella.
  useEffect(() => {
    if (status === 'locked') {
      authApi.unlockWithBiometrics().then((ok) => {
        if (!ok) useSession.getState().signOut();
      });
    }
  }, [status]);

  const submit = async () => {
    const parsed = Schema.safeParse({ documentId, password });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setError(undefined);
    setLoading(true);
    try {
      const challenge = await authApi.login(parsed.data.documentId, parsed.data.password);
      setPassword(''); // no retener la clave en memoria más de lo necesario
      router.push({
        pathname: '/otp',
        params: { challengeId: challenge.challengeId, destination: challenge.destination },
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Title>Bienvenido a tu Banca Móvil</Title>
      <Label muted>Ingresa con tu documento y clave digital.</Label>
      <TextField
        label="Número de documento"
        value={documentId}
        onChangeText={(v) => setDocumentId(v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={12}
        autoComplete="username"
        textContentType="username"
        error={errors.documentId}
      />
      <TextField
        label="Clave digital"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        maxLength={64}
        autoComplete="current-password"
        textContentType="password"
        contextMenuHidden // sin copiar/pegar sobre el campo de clave
        error={errors.password}
      />
      <ErrorText>{error}</ErrorText>
      <Button title="Ingresar" onPress={submit} loading={loading} disabled={!documentId || !password} />
    </Screen>
  );
}
