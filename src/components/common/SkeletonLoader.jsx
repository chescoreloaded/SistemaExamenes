import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Skeleton base animado
 */
function Skeleton({ className = '', width, height, rounded = 'rounded' }) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 ${rounded} ${className}`}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

/**
 * Skeleton para QuestionCard
 */
export function QuestionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton width="120px" height="24px" rounded="rounded-lg" />
        <Skeleton width="80px" height="20px" rounded="rounded-full" />
      </div>

      {/* Question */}
      <div className="mb-8 space-y-3">
        <Skeleton width="100%" height="28px" />
        <Skeleton width="80%" height="28px" />
      </div>

      {/* Options */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} width="100%" height="56px" rounded="rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para Navigator
 */
export function NavigatorSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-700">
      <Skeleton width="100%" height="32px" className="mb-4" rounded="rounded-lg" />
      
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} width="48px" height="48px" rounded="rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para LevelProgressBar
 */
export function LevelProgressBarSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton width="64px" height="64px" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton width="120px" height="24px" />
          <Skeleton width="80px" height="16px" />
        </div>
        <div className="space-y-2">
          <Skeleton width="60px" height="20px" />
          <Skeleton width="80px" height="32px" />
        </div>
      </div>
      
      <Skeleton width="100%" height="24px" rounded="rounded-full" />
    </div>
  );
}

/**
 * Skeleton para StreakDisplay
 */
export function StreakDisplaySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton width="100px" height="20px" />
          <Skeleton width="80px" height="16px" />
        </div>
        <Skeleton width="60px" height="60px" rounded="rounded-full" />
      </div>
      
      <Skeleton width="100%" height="80px" rounded="rounded-2xl" />
    </div>
  );
}

/**
 * Skeleton para AchievementCard
 */
export function AchievementCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <Skeleton width="80px" height="80px" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton width="140px" height="24px" />
          <Skeleton width="100%" height="16px" />
          <Skeleton width="80%" height="16px" />
          <div className="flex gap-2 mt-3">
            <Skeleton width="60px" height="24px" rounded="rounded-full" />
            <Skeleton width="60px" height="24px" rounded="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de items
 */
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Skeleton width="48px" height="48px" rounded="rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height="20px" />
              <Skeleton width="40%" height="16px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para tabla
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="20px" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height="16px" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para página completa de examen
 */
export function ExamPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-6 space-y-4">
          <Skeleton width="100%" height="60px" rounded="rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <LevelProgressBarSkeleton />
            </div>
            <StreakDisplaySkeleton />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
          <div className="space-y-6">
            <QuestionCardSkeleton />
            <Skeleton width="100%" height="60px" rounded="rounded-xl" />
          </div>
          
          <aside>
            <NavigatorSkeleton />
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton genérico
 */
export function GenericSkeleton({ 
  type = 'text', 
  lines = 1,
  className = '' 
}) {
  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            width={i === lines - 1 ? '80%' : '100%'} 
            height="16px" 
          />
        ))}
      </div>
    );
  }

  if (type === 'title') {
    return <Skeleton width="200px" height="32px" className={className} />;
  }

  if (type === 'button') {
    return <Skeleton width="120px" height="40px" rounded="rounded-lg" className={className} />;
  }

  if (type === 'avatar') {
    return <Skeleton width="48px" height="48px" rounded="rounded-full" className={className} />;
  }

  if (type === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
        <Skeleton width="60%" height="24px" className="mb-4" />
        <div className="space-y-2">
          <Skeleton width="100%" height="16px" />
          <Skeleton width="90%" height="16px" />
          <Skeleton width="80%" height="16px" />
        </div>
      </div>
    );
  }

  return <Skeleton className={className} />;
}

Skeleton.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  rounded: PropTypes.string
};

ListSkeleton.propTypes = {
  count: PropTypes.number
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number
};

GenericSkeleton.propTypes = {
  type: PropTypes.oneOf(['text', 'title', 'button', 'avatar', 'card']),
  lines: PropTypes.number,
  className: PropTypes.string
};

export default Skeleton;
