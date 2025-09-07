export function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 w-full max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="aspect-video w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}