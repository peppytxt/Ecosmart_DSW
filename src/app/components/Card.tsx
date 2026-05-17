import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'default';
}

export function StatCard({ title, value, icon: Icon, trend, color = 'default' }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-[#4caf50] text-white',
    accent: 'bg-[#81c784] text-white',
    default: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold">{value}</h3>
          {trend && (
            <p className={`mt-2 text-sm ${trend.isPositive ? 'text-[#4caf50]' : 'text-destructive'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`rounded-xl border bg-card shadow-sm ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b p-6">
          <div>
            {title && <h3 className="font-semibold">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
