'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
    />
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border bg-card text-card-foreground shadow-lg">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function DishCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border bg-card text-card-foreground shadow">
      <Skeleton className="h-32 w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function RestaurantGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
    </div>
  );
}

export function DishGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <DishCardSkeleton key={i} />
        ))}
    </div>
  );
}
