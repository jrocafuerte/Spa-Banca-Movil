/**
 * SELECCIÓN DEL ADAPTADOR DE UI — único punto a cambiar para usar otro Design System.
 *
 *   import { bancoKit } from './adapters/banco';
 *   export const kit: UiKit = bancoKit;
 *
 * La suite src/shared/ui/__tests__/contract.test.tsx valida el adaptador seleccionado.
 */
import type { UiKit } from './contract';
import { defaultKit } from './adapters/default';

export const kit: UiKit = defaultKit;
