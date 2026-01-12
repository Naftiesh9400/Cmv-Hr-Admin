import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "primary" | "accent";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const variants = {
    default: {
      bg: "bg-card",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    },
    success: {
      bg: "bg-card",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    warning: {
      bg: "bg-card",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    primary: {
      bg: "bg-card",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    accent: {
      bg: "bg-card",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
  };

  const styles = variants[variant];

  return (
    <div
      className={cn(
        "rounded-xl p-6 shadow-card border transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        styles.bg,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.iconBg)}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
