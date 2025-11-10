import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { HeaderControls } from './HeaderControls';

/**
 * PageHeader - Header estándar para páginas principales
 */
export function PageHeader({ 
  title, 
  subtitle, 
  languageReadOnly = true,
  extraControls, // Botones adicionales (ej: Exportar PDF, Home)
  className = '' 
}) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 ${className}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Título y Subtítulo */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3 transition-colors">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 transition-colors">
              {subtitle}
            </p>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Controles estándar unificados */}
          <HeaderControls languageReadOnly={languageReadOnly} />
          
          {/* Controles específicos de la página */}
          {extraControls && (
            <>
               <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block"></div>
               {extraControls}
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  languageReadOnly: PropTypes.bool,
  extraControls: PropTypes.node,
  className: PropTypes.string
};

export default PageHeader;