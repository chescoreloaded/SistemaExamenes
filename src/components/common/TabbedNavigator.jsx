import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils'; // Asumiendo shadcn/ui

/**
 * Componente reutilizable para mostrar un navegador y estadísticas en pestañas.
 * @param {React.Node} navigatorSlot - El componente del navegador (ej. QuestionNavigator)
 * @param {React.Node} statsSlot - El componente de estadísticas
 */
export default function TabbedNavigator({ navigatorSlot, statsSlot }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('navigator'); // 'navigator' o 'stats'

  const tabs = [
    { id: 'navigator', label: t('common.navigator', 'Navegador'), icon: '🗂️' },
    { id: 'stats', label: t('common.stats', 'Estadísticas'), icon: '📊' },
  ];

  const TabButton = ({ tab }) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-all',
        activeTab === tab.id
          ? 'bg-indigo-500 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
      aria-selected={activeTab === tab.id}
      role="tab"
    >
      {tab.icon}
      <span>{tab.label}</span>
    </button>
  );

  return (
    <div className="w-full">
      {/* Controles de Pestañas */}
      <div
        className="flex mb-4 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-900"
        role="tablist"
      >
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}
      </div>

      {/* Contenido de la Pestaña */}
      <div role="tabpanel">
        {activeTab === 'navigator' && <div>{navigatorSlot}</div>}
        {activeTab === 'stats' && <div>{statsSlot}</div>}
      </div>
    </div>
  );
}