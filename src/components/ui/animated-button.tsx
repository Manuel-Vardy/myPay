import { cn } from "@/lib/utils";
import Link from "next/link";

interface AnimatedButtonProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export const Component = ({ 
  href = "#", 
  children = "Button", 
  className,
  variant = "primary" 
}: AnimatedButtonProps) => {
  const variants = {
    primary: "bg-[color:var(--trite-ink)] text-white hover:bg-black/90",
    outline: "border border-[color:var(--trite-ink)] text-[color:var(--trite-ink)] hover:bg-[color:var(--trite-ink)] hover:text-white",
    ghost: "text-[color:var(--trite-ink)] hover:bg-black/5",
  };

  return (
    <Link 
      href={href} 
      className={cn(
        "relative inline-flex items-center justify-center px-4 py-1.5 overflow-hidden text-sm font-semibold transition-all rounded-full group",
        variants[variant],
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
      </span>
      
      {/* Subtle modern animation overlay */}
      {variant !== "ghost" && (
        <span className="absolute inset-0 block h-full w-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </Link>
  );
};
