import { useRouter } from 'expo-router';
import { useSession } from '../../../core/session/sessionStore';
import { authApi } from '../../../features/auth/api';
import { formatMoney, usePosition } from '../../../features/position/api';
import { formatDate } from '../../../shared/format';
import { Button, Card, ErrorText, Label, Row, Screen, Spacer, Title } from '../../../shared/ui';

/** Posición consolidada: cuentas, tarjetas y préstamos en una sola vista. */
export default function PositionScreen() {
  const router = useRouter();
  const name = useSession((s) => s.customerName);
  const { data, isLoading, error, refetch, isRefetching } = usePosition();

  return (
    <Screen refreshing={isRefetching} onRefresh={() => void refetch()}>
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
                icon="account"
                chevron
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
                icon="card"
                left={`${c.brand} ${c.panMasked}`}
                sub={`Vence ${formatDate(c.dueDate)}`}
                right={formatMoney(c.statementBalance, c.currency)}
              />
              <Row left="Disponible" right={formatMoney(c.availableCredit, c.currency)} />
            </Card>
          ))}

          {data.loans.length > 0 && <Label muted>PRÉSTAMOS</Label>}
          {data.loans.map((l) => (
            <Card key={l.id}>
              <Row
                icon="loan"
                left={l.product}
                sub={`Próxima cuota ${formatDate(l.nextDueDate)}`}
                right={formatMoney(l.nextInstallment, l.currency)}
              />
              <Row left="Saldo capital" right={formatMoney(l.outstandingPrincipal, l.currency)} />
            </Card>
          ))}
        </>
      )}
      <Spacer />
      <Button title="Cerrar sesión" variant="secondary" onPress={() => authApi.logout()} />
    </Screen>
  );
}
