import { useRouter } from 'expo-router';
import { Card, Label, Row, Screen } from '../../../shared/ui';

export default function PaymentsHome() {
  const router = useRouter();
  return (
    <Screen>
      <Card onPress={() => router.push('/payments/card')} accessibilityLabel="Pagar tarjeta de crédito">
        <Row left="Tarjetas de crédito" sub="Paga el mínimo, el total u otro monto" right="›" />
      </Card>
      <Card onPress={() => router.push('/payments/services')} accessibilityLabel="Pagar servicios">
        <Row left="Servicios" sub="Luz, agua, telefonía, educación y más" right="›" />
      </Card>
      <Label muted>Más opciones de pago estarán disponibles pronto.</Label>
    </Screen>
  );
}
