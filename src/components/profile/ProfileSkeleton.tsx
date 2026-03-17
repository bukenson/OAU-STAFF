import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
    {/* Header */}
    <div className="bg-primary rounded-t-xl py-4 px-6 text-center">
      <Skeleton className="h-6 w-48 mx-auto bg-primary-foreground/20" />
      <Skeleton className="h-4 w-64 mx-auto mt-2 bg-primary-foreground/20" />
    </div>

    <div className="bg-card border border-border border-t-0 rounded-b-xl p-6 sm:p-8 space-y-6">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Photo */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-28 w-28 rounded-full" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Basic info fields */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}

      {/* Array fields */}
      {[1, 2, 3].map((i) => (
        <div key={`arr-${i}`} className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-40" />
        </div>
      ))}

      {/* Rich text areas */}
      {[1, 2, 3].map((i) => (
        <div key={`rt-${i}`} className="space-y-2">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-32 w-full" />
        </div>
      ))}

      {/* Submit button */}
      <Skeleton className="h-11 w-full" />
    </div>
  </div>
);

export default ProfileSkeleton;
