import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ApiError, newIdempotencyKey } from '../../../core/api/http';
import { isProduction } from '../../../core/config';
import { transactionSigning } from '../../../core/security/transactionSigning';
import { type AmountType, type CardPaymentResult, cardPaymentsApi } from '../../../features/card-payments/api';
import { formatMoney, positionKeys, usePosition } from '../../../features/position/api';
import { formatDate } from '../../../shared/format';
import { Button, Card, Chip, ErrorText, Inline, Label, Row, Screen, TextField, Title } from '../../../shared/ui';

export default function CardPayment() {
  const params = useLocalSearchParams<{ cardId?: string }>();
  const qc = useQueryClient();
  const { data } = usePosition();
  const [cardId, setCardId] = useState(params.cardId);
  const [fromId, setFromId] = useState<string>();
  const [amountTypeChoice, setAmountType] = useState<AmountType>();
  const [other, setOther] = useState('');
  const [result, setResult] = useState<CardPaymentResult>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const idemKey = useRef(newIdempotencyKey());

  const card = data?.cards.find((c) => c.id === (cardId ?? data.cards[0]?.id));
  const from = data?.accounts.find((a) => a.id === (fromId ?? data.accounts[0]?.id));
  if (!data || !card || !from)
    return (
      <Screen>
        <Label muted>Cargando…</Label>
      </Screen>
    );

  // Opción por defecto: mínimo si hay pago mínimo pendiente; si no, el total.
  const amountType: AmountType = amountTypeChoice ?? (card.minimumPayment > 0 ? 'MINIMUM' : 'TOTAL');
  const nothingDue = card.statementBalance <= 0;
  const amount =
    amountType === 'MINIMUM'
      ? card.minimumPayment
      : amountType === 'TOTAL'
        ? card.statementBalance
        : Number(other.replace(',', '.'));

  const pay = async () => {
    setError(undefined);
    if (!(amount > 0)) return setError('Ingresa un monto válido');
    // La firma cubre Idempotency-Key + monto + moneda: el BFF rechaza cualquier alteración.
    const signature = await transactionSigning.sign(idemKey.current, amount, card.currency);
    if (!signature && isProduction) return setError('Necesitamos confirmar tu identidad');
    setLoading(true);
    try {
      const r = await cardPaymentsApi.pay(
        {
          cardId: card.id,
          fromAccountId: from.id,
          amountType,
          amount: amountType === 'OTHER' ? amount : undefined,
          signature,
        },
        idemKey.current,
      );
      setResult(r);
      idemKey.current = newIdempotencyKey();
      await qc.invalidateQueries({ queryKey: positionKeys.all });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Screen>
        <Title>¡Pago realizado!</Title>
        <Card>
          <Row left="Tarjeta" right={result.card} />
          <Row left="Monto" right={formatMoney(result.amount, result.currency)} />
          <Row left="Operación" right={result.operationId.slice(0, 8).toUpperCase()} />
        </Card>
        <Button title="Listo" onPress={() => setResult(undefined)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Label muted>Tarjeta</Label>
      {data.cards.map((c) => (
        <Card key={c.id} onPress={() => setCardId(c.id)} selected={card.id === c.id}>
          <Row
            left={`${c.brand} ${c.panMasked}`}
            sub={`Vence ${formatDate(c.dueDate)}`}
            right={formatMoney(c.statementBalance, c.currency)}
          />
        </Card>
      ))}
      <Label muted>¿Cuánto deseas pagar?</Label>
      <Inline wrap>
        {card.minimumPayment > 0 && (
          <Chip
            label={`Mínimo ${formatMoney(card.minimumPayment, card.currency)}`}
            selected={amountType === 'MINIMUM'}
            onPress={() => setAmountType('MINIMUM')}
          />
        )}
        {card.statementBalance > 0 && (
          <Chip
            label={`Total ${formatMoney(card.statementBalance, card.currency)}`}
            selected={amountType === 'TOTAL'}
            onPress={() => setAmountType('TOTAL')}
          />
        )}
        <Chip label="Otro monto" selected={amountType === 'OTHER'} onPress={() => setAmountType('OTHER')} />
      </Inline>
      {amountType === 'OTHER' && (
        <TextField
          label="Monto"
          value={other}
          onChangeText={(v) => setOther(v.replace(/[^\d.,]/g, ''))}
          keyboardType="decimal-pad"
        />
      )}
      <Label muted>Cuenta de cargo</Label>
      {data.accounts.map((a) => (
        <Card key={a.id} onPress={() => setFromId(a.id)} selected={from.id === a.id}>
          <Row
            left={`${a.type === 'SAVINGS' ? 'Ahorros' : 'Corriente'} ${a.numberMasked}`}
            right={formatMoney(a.availableBalance, a.currency)}
          />
        </Card>
      ))}
      <ErrorText>{error}</ErrorText>
      {nothingDue && <Label muted>Tu tarjeta no tiene deuda pendiente.</Label>}
      <Button
        title={amount > 0 ? `Pagar ${formatMoney(amount, card.currency)}` : 'Pagar'}
        onPress={pay}
        loading={loading}
        disabled={nothingDue || !(amount > 0)}
      />
    </Screen>
  );
}
