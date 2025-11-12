import { Logo } from '@/components/common/Logo';
import { HeaderControls } from '@/components/layout/HeaderControls';

/**
 * Cabecera unificada para modos inmersivos (Examen, Estudio, Resultados).
 * Proporciona un slot izquierdo (default: Logo) y uno derecho (default: HeaderControls + children).
 * @param {Object} props
 * @param {React.ReactNode} [props.leftSlot] - Reemplaza el Logo (ej. Breadcrumbs).
 * @param {React.ReactNode} [props.children] - Botones o elementos extra para la derecha (ej. Botón de Salir).
 */
export default function ImmersiveHeader({ leftSlot, children }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Slot Izquierdo: Logo o Breadcrumbs */}
          {/* ✅ ARREGLO DE LAYOUT (Problema 3) 
              min-w-0 es crucial para permitir que el flex-item se encoja
          */}
          <div className="flex-1 min-w-0">
            {leftSlot || <Logo />}
          </div>

          {/* Slot Derecho: Controles + Botones de Acción (Children) */}
          <div className="flex-shrink-0 flex items-center gap-2 md:gap-4 ml-2">
            <HeaderControls className="scale-90 sm:scale-100" />
            {children && (
              <>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />
                <div className="flex items-center gap-2">
                  {children}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
