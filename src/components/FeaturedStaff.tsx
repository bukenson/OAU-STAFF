import { Link } from "react-router-dom";
import StaffCard from "./StaffCard";
import { useStaff } from "@/hooks/useStaff";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const FeaturedStaff = () => {
  const { data: staff, isLoading } = useStaff();
  const featured = (staff ?? []).slice(0, 8);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <section id="staff" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">
            Our People
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Featured Staff
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {featured.map((s, i) => (
                <CarouselItem
                  key={s.name + i}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4"
                >
                  <StaffCard staff={s} index={i} featured />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:inline-flex -left-5 bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground" />
            <CarouselNext className="hidden md:inline-flex -right-5 bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground" />
          </Carousel>
        )}

        <div className="text-center mt-10">
          <Link
            to="/staff"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            View All Staff →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedStaff;
