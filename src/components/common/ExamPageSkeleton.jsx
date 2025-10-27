/**
 * Skeleton loader para la página de examen
 */
export function ExamPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>

            {/* Center */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="space-y-2">
                <div className="w-20 h-5 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
                <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg" />
              <div className="w-20 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
          {/* Question area */}
          <main className="space-y-6">
            {/* Question card skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-indigo-100 dark:border-indigo-900/50">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-6 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <div className="w-20 h-6 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="w-16 h-6 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Question text */}
              <div className="space-y-3 mb-8">
                <div className="w-full h-6 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="w-4/5 h-6 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>

              {/* Options */}
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Navigation controls skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                <div className="w-32 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          </main>

          {/* Sidebar skeleton */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Navigator skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700">
                <div className="w-32 h-5 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Stats skeleton */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-700">
                <div className="w-28 h-5 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ExamPageSkeleton;
