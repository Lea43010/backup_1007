import { ReactNode } from "react";

interface PageHeaderProps {
  children: ReactNode;
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3">
        {children}
      </div>
    </header>
  );
}
