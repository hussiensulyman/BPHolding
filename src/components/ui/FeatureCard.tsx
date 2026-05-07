import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  Icon,
  title,
  description,
  className = "",
}: FeatureCardProps) {
  return (
    <div className={`service-card group ${className}`}>
      <div className="service-icon-bg">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 className="text-start mb-2 text-lg font-bold text-[var(--color-primary)]">
        {title}
      </h3>
      <p className="text-start text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
