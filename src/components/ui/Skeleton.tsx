import { cn } from "../../lib/utils";

type SkeletonProps = { className?: string };

const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse rounded-xl bg-white/10 dark:bg-white/5",
      className
    )}
  />
);

/** Full home-page skeleton matching the real layout */
export const HomeSkeleton = () => (
  <div className="relative z-10 gap-3 grid mx-auto p-3 max-w-2xl">
    {/* Direction card */}
    <div className="bg-white/10 backdrop-blur-md border border-white/20 dark:bg-black/30 dark:border-white/10 shadow-lg p-4 rounded-2xl">
      <div className="flex justify-center gap-4 mb-4">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-8 h-6" />
        <Skeleton className="w-24 h-6" />
      </div>
      {/* Timetable rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between mb-3 px-4">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-20 h-8" />
        </div>
      ))}
      <Skeleton className="mx-auto w-1/2 h-10" />
    </div>
    {/* Map card */}
    <div className="bg-white/10 backdrop-blur-md border border-white/20 dark:bg-black/30 dark:border-white/10 shadow-lg p-2 rounded-2xl">
      <Skeleton className="w-full h-48" />
    </div>
    {/* Station buttons */}
    <div className="bg-white/10 backdrop-blur-md border border-white/20 dark:bg-black/30 dark:border-white/10 shadow-lg p-2 rounded-2xl">
      <div className="gap-3 grid grid-cols-3">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    </div>
    {/* Discount button */}
    <Skeleton className="rounded-full w-full h-14" />
  </div>
);

export default Skeleton;
// updated: Skeleton¤Î¥¢¥Ë¥á©`¥·¥ç¥óÕ{Õû
