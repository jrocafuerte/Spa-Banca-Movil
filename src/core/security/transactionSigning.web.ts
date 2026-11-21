/**
 * SOLO para desarrollo/revisión visual en navegador. Sin almacenamiento protegido
 * por biometría no hay firma de dispositivo: `sign` devuelve undefined y el BFF
 * la rechazará donde la política la exija (producción).
 */
export const transactionSigning = {
  async enroll(): Promise<string> {
    throw new Error('Firma de dispositivo no disponible en web');
  },
  async sign(_intentHash: string, _amount: number, _currency: string): Promise<string | undefined> {
    return undefined;
  },
  async clear(): Promise<void> {},
};
