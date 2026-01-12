import { Cloud, Users } from "lucide-react";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 36, text: "text-3xl" },
  };

  const colors = {
    light: "text-primary-foreground",
    dark: "text-foreground",
  };

  return (
    <div className={`flex items-center gap-2 ${colors[variant]}`}>
      <div className="relative">
        <Cloud
          size={sizes[size].icon}
          className="text-primary fill-primary/20"
        />
        <Users
          size={sizes[size].icon * 0.5}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
        />
      </div>
      <span className={`font-display font-bold ${sizes[size].text}`}>
        Cloud<span className="text-primary">HR</span>
      </span>
    </div>
  );
}
