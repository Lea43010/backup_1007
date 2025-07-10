import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { Calendar, Euro, ChevronRight, Users } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "../../shared/schema";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "planning": return "bg-orange-500";
      case "completed": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Aktiv";
      case "planning": return "Planung";
      case "completed": return "Abgeschlossen";
      case "cancelled": return "Abgebrochen";
      default: return "Unbekannt";
    }
  };

  return (
    <Card className="project-card hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{project.name}</h3>
            <p className="text-xs text-gray-500">Projekt-ID: {project.id}</p>
          </div>
          <Badge className={`${getStatusColor(project.status)} text-white text-xs px-2 py-1`}>
            {getStatusLabel(project.status)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>{project.completionPercentage || 0}%</span>
            <Progress value={project.completionPercentage || 0} className="h-1 w-12" />
          </div>
          <Link href={`/projects/${project.id}`}>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronRight className="h-3 w-3 text-green-600" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
