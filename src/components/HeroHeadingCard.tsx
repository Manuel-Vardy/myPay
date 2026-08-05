import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HeroHeadingCardProps {
  label: string;
  title: ReactNode;
  className?: string;
}

export default function HeroHeadingCard({
  label,
  title,
  className,
}: HeroHeadingCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md overflow-hidden sm:max-w-lg border-b-2 border-b-white",
        className
      )}
    >
      <div className="absolute inset-0 bg-white" aria-hidden />
      <div
        className="absolute inset-0 bg-[#22c55e]"
        style={{ clipPath: "polygon(0 0, 78% 0, 64% 100%, 0 100%)" }}
        aria-hidden
      />
      <svg
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polygon points="73,0 75.5,0 61.5,100 59,100" fill="#4ade80" />
        <polygon points="75.5,0 78,0 64,100 61.5,100" fill="#86efac" />
        <polygon points="78,0 80.5,0 66.5,100 64,100" fill="#bbf7d0" />
        <polygon points="80.5,0 83,0 69,100 66.5,100" fill="#dcfce7" />
        <polygon points="83,0 85.5,0 71.5,100 69,100" fill="#ecfdf5" />
        <polygon points="85.5,0 88,0 74,100 71.5,100" fill="#f0fdf4" />
        <polygon points="88,0 91,0 77,100 74,100" fill="#f7fef9" />
      </svg>
      <div className="relative z-10 flex min-h-[120px] flex-col justify-center px-6 py-6 sm:min-h-[140px] sm:px-8 sm:py-8">
        <p className="mb-1.5 text-sm font-medium text-white/90 sm:text-base">
          {label}
        </p>
        <h3 className="text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">
          {title}
        </h3>
      </div>
    </div>
  );
}
