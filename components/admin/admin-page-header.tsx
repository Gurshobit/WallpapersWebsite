import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1
          className="font-bold text-[26px] tracking-[-0.5px]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <div className="text-[13px] mt-0.5" style={{ color: "var(--dim)" }}>
            {subtitle}
          </div>
        )}
      </div>
      {actions}
    </div>
  );
}
