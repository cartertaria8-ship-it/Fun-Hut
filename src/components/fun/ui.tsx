import { cva, type VariantProps } from "class-variance-authority";
import { Star } from "lucide-react";
import { forwardRef } from "react";
import funnyImg from "@/assets/funny.png";
import { cn } from "@/lib/utils";

export const bigButton = cva(
  "chunky inline-flex select-none items-center justify-center gap-3 rounded-[1.75rem] font-display font-bold disabled:opacity-50",
  {
    variants: {
      variant: {
        sun: "bg-sun-gradient text-primary-foreground",
        go: "bg-success text-primary-foreground",
        soft: "bg-card text-ink",
        ghost: "bg-paper/60 text-ink",
      },
      size: {
        xl: "min-h-20 px-10 text-[clamp(1.5rem,4vmin,2.25rem)]",
        lg: "min-h-16 px-7 text-xl",
        md: "min-h-14 px-5 text-lg",
        icon: "size-14 shrink-0",
      },
    },
    defaultVariants: { variant: "sun", size: "lg" },
  },
);

export const BigButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof bigButton>
>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} type="button" className={cn(bigButton({ variant, size }), className)} {...props} />
));
BigButton.displayName = "BigButton";

export function Funny({ className, bob = true }: { className?: string; bob?: boolean }) {
  return (
    <img
      src={funnyImg}
      alt="Funny, the Fun Hut mascot"
      width={1024}
      height={1024}
      draggable={false}
      className={cn("pointer-events-none select-none drop-shadow-xl", bob && "animate-bob", className)}
    />
  );
}

export function StarPill({ count, className }: { count: number; className?: string }) {
  return (
    <div className={cn("chunky flex h-14 items-center gap-2 rounded-full bg-card pl-2 pr-5 font-display text-2xl font-bold text-ink", className)}>
      <span className="flex size-10 items-center justify-center rounded-full bg-star">
        <Star className="size-6 fill-paper text-paper" />
      </span>
      {count}
    </div>
  );
}

export function Stars({ value, max = 3, className }: { value: number; max?: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} className={cn("size-5", i < value ? "fill-star text-star" : "fill-muted text-muted-foreground/40")} />
      ))}
    </div>
  );
}

export function ProgressBar({ percent, className, barClass = "bg-success" }: { percent: number; className?: string; barClass?: string }) {
  return (
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-paper/70", className)}>
      <div className={cn("h-full rounded-full transition-all", barClass)} style={{ width: `${percent}%` }} />
    </div>
  );
}
