import { cn } from "@/lib/utils";
import Link from "next/link";

interface AnimatedButtonProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  outline?: boolean;
}

export const Component = ({ 
  href = "#", 
  children = "Animation Button", 
  className,
  outline = true 
}: AnimatedButtonProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Link 
        href={href} 
        className={cn(
          "relative inline-flex items-center justify-start px-6 py-2 overflow-hidden font-medium transition-all bg-white rounded-full hover:bg-white group",
          outline ? "outline outline-1 outline-black" : ""
        )}
      >
        <span className="w-48 h-48 rounded-full rotate-[-40deg] bg-black absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
        <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
          {children}
        </span>
      </Link>
    </div>
  );
};
