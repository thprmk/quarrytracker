export default function ProjectCardSkeleton() {
    return (
      <div className="bg-card p-5 rounded-lg border animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-muted p-3 rounded-md h-12 w-12"></div>
          <div className="h-4 w-10 bg-muted rounded"></div>
        </div>
        <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-muted rounded"></div>
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-1.5"></div>
        </div>
      </div>
    );
  }