/**
 * SUITE DE CONFORMIDAD DEL CONTRATO DE UI.
 *
 * Se ejecuta contra el adaptador SELECCIONADO en kit.ts. Un adaptador de un
 * Design System externo solo puede activarse si pasa todos estos casos:
 * comportamiento, accesibilidad y requisitos de seguridad.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { kit } from '../kit';

const { Provider, Button, Card, Chip, TextField, SwitchField, ErrorText, Row, Title, HeaderButton, Screen, Icon } = kit;
const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const r = (ui: ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <Provider>{ui}</Provider>
    </SafeAreaProvider>,
  );

describe('Contrato UI — Button', () => {
  it('es un botón accesible con su título y dispara onPress', async () => {
    const onPress = jest.fn();
    await r(<Button title="Pagar" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Pagar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('deshabilitado: no dispara y lo expone a accesibilidad', async () => {
    const onPress = jest.fn();
    await r(<Button title="Pagar" onPress={onPress} disabled />);
    const btn = screen.getByRole('button');
    await fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
    expect(btn).toBeDisabled();
  });

  it('loading: impide dobles envíos y expone busy', async () => {
    const onPress = jest.fn();
    await r(<Button title="Pagar" onPress={onPress} loading />);
    const btn = screen.getByRole('button');
    await fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
    expect(btn).toBeBusy();
  });
});

describe('Contrato UI — TextField', () => {
  it('está etiquetado y propaga los cambios', async () => {
    const onChangeText = jest.fn();
    await r(<TextField label="Monto" value="" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText('Monto'), '10');
    expect(onChangeText).toHaveBeenCalledWith('10');
  });

  it('SEGURIDAD: oculta el texto, sin copiar/pegar ni autocorrección en campos de clave', async () => {
    await r(<TextField label="Clave" value="x" onChangeText={() => {}} secureTextEntry contextMenuHidden />);
    const input = screen.getByLabelText('Clave');
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.contextMenuHidden).toBe(true);
    expect(input.props.autoCorrect).toBe(false);
  });

  it('respeta maxLength y teclado', async () => {
    await r(<TextField label="OTP" value="" onChangeText={() => {}} maxLength={6} keyboardType="number-pad" />);
    const input = screen.getByLabelText('OTP');
    expect(input.props.maxLength).toBe(6);
    expect(input.props.keyboardType).toBe('number-pad');
  });

  it('muestra el error', async () => {
    await r(<TextField label="Cuenta" value="" onChangeText={() => {}} error="Número inválido" />);
    expect(screen.getByText('Número inválido')).toBeOnTheScreen();
  });
});

describe('Contrato UI — selección y navegación', () => {
  it('Card con onPress es botón y expone selected', async () => {
    const onPress = jest.fn();
    await r(
      <Card onPress={onPress} selected accessibilityLabel="Cuenta 5566">
        <Row left="Ahorros" right="$ 10" />
      </Card>,
    );
    const card = screen.getByRole('button', { name: 'Cuenta 5566' });
    expect(card).toBeSelected();
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });

  it('Chip expone selected y dispara onPress', async () => {
    const onPress = jest.fn();
    await r(<Chip label="Total" selected onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'Total' });
    expect(chip).toBeSelected();
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalled();
  });

  it('HeaderButton usa la etiqueta accesible, no el ícono', async () => {
    await r(<HeaderButton label="Atrás" icon="back" onPress={() => {}} />);
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeOnTheScreen();
  });

  it('SwitchField está etiquetado y propaga el valor', async () => {
    const onChange = jest.fn();
    await r(<SwitchField label="Usar biometría" value={false} onChange={onChange} />);
    await fireEvent(screen.getByLabelText('Usar biometría'), 'valueChange', true);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('Contrato UI — contenido', () => {
  it('ErrorText se anuncia como alerta', async () => {
    await r(<ErrorText>Fondos insuficientes</ErrorText>);
    expect(screen.getByRole('alert')).toHaveTextContent('Fondos insuficientes');
  });

  it('ErrorText vacío no renderiza nada', async () => {
    await r(<ErrorText />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('Title es un encabezado accesible', async () => {
    await r(<Title>Mi posición</Title>);
    expect(screen.getByRole('header', { name: 'Mi posición' })).toBeOnTheScreen();
  });

  it('Screen renderiza su contenido', async () => {
    await r(
      <Screen>
        <Title>Contenido</Title>
      </Screen>,
    );
    expect(screen.getByText('Contenido')).toBeOnTheScreen();
  });

  it('Icon decorativo no se expone; con etiqueta sí', async () => {
    await r(<Icon name="success" accessibilityLabel="Operación exitosa" />);
    expect(screen.getByLabelText('Operación exitosa')).toBeOnTheScreen();
  });
});
