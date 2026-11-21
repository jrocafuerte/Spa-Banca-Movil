import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { ApiError } from '../../core/api/http';
import { biometricsAvailable } from '../../core/security/biometrics';
import { authApi } from '../../features/auth/api';
import { Button, ErrorText, Label, Screen, TextField } from '../../shared/ui';

export default function Otp() {
  const { challengeId, destination } = useLocalSearchParams<{ challengeId: string; destination: string }>();
  const [otp, setOtp] = useState('');
  const [bio, setBio] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    biometricsAvailable().then((ok) => {
      setBioAvailable(ok);
      setBio(ok);
    });
  }, []);

  const submit = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await authApi.verifyOtp(challengeId, otp, bio);
      // El layout raíz redirige automáticamente al área privada (Stack.Protected).
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Código inválido');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Label>Ingresa el código de 6 dígitos que enviamos al {destination}.</Label>
      <TextField
        label="Código de verificación"
        value={otp}
        onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
      />
      {bioAvailable && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Label>Usar biometría para próximos ingresos</Label>
          <Switch value={bio} onValueChange={setBio} accessibilityLabel="Usar biometría" />
        </View>
      )}
      <ErrorText>{error}</ErrorText>
      <Button title="Verificar" onPress={submit} loading={loading} disabled={otp.length !== 6} />
    </Screen>
  );
}
