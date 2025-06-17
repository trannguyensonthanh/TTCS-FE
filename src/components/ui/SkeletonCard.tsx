// src/components/ui/SkeletonCard.tsx (Ví dụ)
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export const SkeletonCard = () => (
  <Card className="overflow-hidden h-full flex flex-col">
    <Skeleton className="aspect-video w-full" />
    <CardHeader className="p-4 pb-2">
      <Skeleton className="h-6 w-3/4 mb-1.5" />
      <Skeleton className="h-3 w-1/2" />
    </CardHeader>
    <CardContent className="p-4 pt-1 space-y-2 flex-grow">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <CardFooter className="p-4 pt-2">
      <Skeleton className="h-9 w-full" />
    </CardFooter>
  </Card>
);
