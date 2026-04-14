const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-4">
    <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    <div className="space-y-3 w-full max-w-md">
      <div className="h-4 bg-muted/40 rounded-full w-3/4 mx-auto animate-pulse" />
      <div className="h-3 bg-muted/30 rounded-full w-1/2 mx-auto animate-pulse" />
    </div>
  </div>
);

export default PageSkeleton;
