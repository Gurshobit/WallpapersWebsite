import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-[30px] py-[26px] pb-[50px]"
      style={{ animation: "fadeUp .35s ease both" }}
    >
      {children}
    </div>
  );
}
