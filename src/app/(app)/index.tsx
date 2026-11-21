import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '../../core/session/sessionStore';
import { authApi } from '../../features/auth/api';
import { formatMoney, usePosition } from '../../features/position/api';
import { Button, Card, ErrorText, Label, Row, Title } from '../../shared/ui';
import { spacing, useTheme } from '../../shared/ui/theme';

/** Posición consolidada: cuentas, tarjetas y préstamos en una sola vista. */
export default function PositionScreen() {
  const t = useTheme();
  const router = useRouter();
  const name = useSession((s) => s.customerName);
  const { data, isLoading, error, refetch, isRefetching } = usePosition();

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={{ padding: spacing(4), gap: spacing(3) }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
    >
      <Title>Hola{name ? `, ${name}` : ''}</Title>
      {error ? <ErrorText>{(error as Error).message}</ErrorText> : null}
      {isLoading && <Label muted>Cargando tu posición…</Label>}

      {data && (
        <>
          <Card>
            <Label muted>Saldo disponible total</Label>
            {Object.entries(data.totals).map(([cur, v]) => (
              <Title key={cur}>{formatMoney(v ?? 0, cur as never)}</Title>
            ))}
          </Card>

          <Label muted>CUENTAS</Label>
          {data.accounts.map((a) => (
            <Card
              key={a.id}
              onPress={() => router.push({ pathname: '/accounts/[id]', params: { id: a.id } })}
              accessibilityLabel={`Cuenta ${a.numberMasked}`}
            >
              <Row
                left={`${a.type === 'SAVINGS' ? 'Ahorros' : 'Corriente'} ${a.numberMasked}`}
                sub="Disponible"
                right={formatMoney(a.availableBalance, a.currency)}
              />
            </Card>
          ))}

          <Label muted>TARJETAS DE CRÉDITO</Label>
          {data.cards.map((c) => (
            <Card
              key={c.id}
              onPress={() => router.push({ pathname: '/payments/card', params: { cardId: c.id } })}
              accessibilityLabel={`Tarjeta ${c.panMasked}`}
            >
              <Row
                left={`${c.brand} ${c.panMasked}`}
                sub={`Vence ${c.dueDate}`}
                right={formatMoney(c.statementBalance, c.currency)}
              />
              <Row left="Disponible" right={formatMoney(c.availableCredit, c.currency)} />
            </Card>
          ))}

          {data.loans.length > 0 && <Label muted>PRÉSTAMOS</Label>}
          {data.loans.map((l) => (
            <Card key={l.id}>
              <Row
                left={l.product}
                sub={`Próxima cuota ${l.nextDueDate}`}
                right={formatMoney(l.nextInstallment, l.currency)}
              />
              <Row left="Saldo capital" right={formatMoney(l.outstandingPrincipal, l.currency)} />
            </Card>
          ))}
        </>
      )}
      <View style={{ height: spacing(2) }} />
      <Button title="Cerrar sesión" variant="secondary" onPress={() => authApi.logout()} />
    </ScrollView>
  );
}
