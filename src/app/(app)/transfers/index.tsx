import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { ApiError, newIdempotencyKey } from '../../../core/api/http';
import { transactionSigning } from '../../../core/security/transactionSigning';
import { isProduction } from '../../../core/config';
import { formatMoney, positionKeys, usePosition } from '../../../features/position/api';
import {
  type PreparedTransfer,
  type TransferForm,
  TransferFormSchema,
  type TransferResult,
  transfersApi,
} from '../../../features/transfers/api';
import { Button, Card, Chip, ErrorText, Label, Row, Screen, TextField, Title } from '../../../shared/ui';
import { spacing } from '../../../shared/ui/theme';

type Kind = TransferForm['type'];
const KINDS: { id: Kind; label: string }[] = [
  { id: 'OWN', label: 'Entre mis cuentas' },
  { id: 'THIRD_PARTY', label: 'A terceros' },
  { id: 'INTERBANK', label: 'Otros bancos' },
];

export default function Transfers() {
  const qc = useQueryClient();
  const { data: position } = usePosition();
  const [type, setType] = useState<Kind>('OWN');
  const [fromAccountId, setFrom] = useState<string>();
  const [toAccountNumber, setTo] = useState('');
  const [bankCode, setBank] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prepared, setPrepared] = useState<PreparedTransfer>();
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState<TransferResult>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const idemKey = useRef<string>(undefined);

  const accounts = position?.accounts ?? [];
  const from = accounts.find((a) => a.id === (fromAccountId ?? accounts[0]?.id));

  const reset = () => {
    setPrepared(undefined);
    setResult(undefined);
    setOtp('');
    setAmount('');
    setTo('');
    setDescription('');
  };

  const prepare = async () => {
    const parsed = TransferFormSchema.safeParse({
      type,
      fromAccountId: from?.id,
      toAccountNumber,
      bankCode: type === 'INTERBANK' ? bankCode : undefined,
      amount: amount.replace(',', '.'),
      currency: from?.currency ?? 'USD',
      description,
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setError(undefined);
    setLoading(true);
    try {
      setPrepared(await transfersApi.prepare(parsed.data));
      idemKey.current = newIdempotencyKey(); // una clave por operación confirmada
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos preparar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!prepared) return;
    setError(undefined);
    // Firma con la clave protegida por biometría (el SO pide Face ID / huella). El BFF la verifica.
    const signature = await transactionSigning.sign(
      prepared.transferId,
      prepared.summary.amount,
      prepared.summary.currency,
    );
    if (!signature && isProduction) {
      setError('Necesitamos confirmar tu identidad para continuar');
      return;
    }
    setLoading(true);
    try {
      const r = await transfersApi.confirm(
        prepared.transferId,
        { otp: prepared.otpRequired ? otp : undefined, signature },
        idemKey.current,
      );
      setResult(r);
      await qc.invalidateQueries({ queryKey: positionKeys.all });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos completar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  if (result && prepared) {
    return (
      <Screen>
        <Title>¡Transferencia realizada!</Title>
        <Card>
          <Row left="Monto" right={formatMoney(prepared.summary.amount, prepared.summary.currency)} />
          <Row left="Destino" right={prepared.summary.to} />
          <Row left="Operación" right={result.operationId.slice(0, 8).toUpperCase()} />
          <Row left="Fecha" right={new Date(result.executedAt).toLocaleString('es')} />
        </Card>
        <Button title="Nueva transferencia" onPress={reset} />
      </Screen>
    );
  }

  if (prepared) {
    const s = prepared.summary;
    return (
      <Screen>
        <Title>Confirma tu transferencia</Title>
        <Card>
          <Row left="Desde" right={s.from} />
          <Row left="Hacia" sub={s.beneficiary} right={s.to} />
          <Row left="Monto" right={formatMoney(s.amount, s.currency)} />
          <Row left="Comisión" right={formatMoney(s.fee, s.currency)} />
        </Card>
        {prepared.otpRequired && (
          <TextField
            label="Código enviado a tu celular"
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
          />
        )}
        <ErrorText>{error}</ErrorText>
        <Button
          title="Confirmar"
          onPress={confirm}
          loading={loading}
          disabled={prepared.otpRequired && otp.length !== 6}
        />
        <Button title="Cancelar" variant="secondary" onPress={() => setPrepared(undefined)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) }}>
        {KINDS.map((k) => (
          <Chip key={k.id} label={k.label} selected={type === k.id} onPress={() => setType(k.id)} />
        ))}
      </View>
      <Label muted>Cuenta de origen</Label>
      {accounts.map((a) => (
        <Card
          key={a.id}
          onPress={() => setFrom(a.id)}
          style={from?.id === a.id ? { borderColor: '#0B5FFF', borderWidth: 2 } : undefined}
        >
          <Row
            left={`${a.type === 'SAVINGS' ? 'Ahorros' : 'Corriente'} ${a.numberMasked}`}
            right={formatMoney(a.availableBalance, a.currency)}
          />
        </Card>
      ))}
      <ErrorText>{errors.fromAccountId}</ErrorText>
      <TextField
        label="Cuenta destino"
        value={toAccountNumber}
        onChangeText={(v) => setTo(v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={20}
        error={errors.toAccountNumber}
      />
      {type === 'INTERBANK' && (
        <TextField
          label="Código del banco"
          value={bankCode}
          onChangeText={(v) => setBank(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={4}
          error={errors.bankCode}
        />
      )}
      <TextField
        label="Monto"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/[^\d.,]/g, ''))}
        keyboardType="decimal-pad"
        error={errors.amount}
      />
      <TextField
        label="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        maxLength={60}
        error={errors.description}
      />
      <ErrorText>{error}</ErrorText>
      <Button title="Continuar" onPress={prepare} loading={loading} />
    </Screen>
  );
}
