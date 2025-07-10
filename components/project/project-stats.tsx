import { Card, CardContent } from "../../components/ui/card";
import { ReactNode } from "react";

interface ProjectStatsProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}

export function ProjectStats({ title, value, icon, color }: ProjectStatsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
