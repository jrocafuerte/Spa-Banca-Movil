import { useLocalSearchParams } from 'expo-router';
import { formatMoney, useMovements } from '../../../features/position/api';
import { Card, ErrorText, Label, Row, Screen } from '../../../shared/ui';

export default function Movements() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, isLoading } = useMovements(id);
  return (
    <Screen>
      {isLoading && <Label muted>Cargando movimientos…</Label>}
      {error ? <ErrorText>{(error as Error).message}</ErrorText> : null}
      {data?.items.map((m) => (
        <Card key={m.id}>
          <Row
            left={m.description}
            sub={new Date(m.date).toLocaleDateString('es')}
            right={formatMoney(m.amount, m.currency)}
          />
        </Card>
      ))}
    </Screen>
  );
}
