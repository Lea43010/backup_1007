import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { 
  ArrowLeft, 
  MoreVertical, 
  Camera, 
  Mic, 
  FileText,
  MapPin, 
  Calendar,
  Euro,
  Building2,
  User,
  Edit,
  Share,
  Download,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import type { Project } from "../../shared/schema";

export default function ProjectDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  // PDF Export Mutation
  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${id}/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('PDF export failed');
      }
      
      return await response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name || 'Projekt'}_Details.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF exportiert",
        description: "Das PDF wurde erfolgreich heruntergeladen.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler beim Export",
        description: "Das PDF konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const handlePdfExport = () => {
    exportPdfMutation.mutate();
  };

  const handleShare = () => {
    const shareData = {
      title: `Projekt: ${project?.name}`,
      text: `Schauen Sie sich die Details zu diesem Bauprojekt an: ${project?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      // Native Share API (mobile)
      navigator.share(shareData).catch(() => {
        // Fallback to manual sharing
        fallbackShare();
      });
    } else {
      // Fallback for desktop
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const projectUrl = window.location.href;
    const projectText = `Projekt: ${project?.name}\nDetails: ${projectUrl}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(projectText).then(() => {
      toast({
        title: "Link kopiert",
        description: "Der Projektlink wurde in die Zwischenablage kopiert.",
      });
    }).catch(() => {
      // Manual sharing options
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(projectText)}`;
      const emailUrl = `mailto:?subject=${encodeURIComponent(`Projekt: ${project?.name}`)}&body=${encodeURIComponent(projectText)}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Projektdetails...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projekt nicht gefunden</h2>
          <p className="text-gray-600 mb-4">Das angeforderte Projekt existiert nicht.</p>
          <Link href="/projects">
            <Button>Zurück zu Projekten</Button>
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-500 text-white sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="text-white hover:bg-green-600">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold truncate">{project.name}</h1>
                <p className="text-xs opacity-80">
                  {project.latitude && project.longitude && "München, Bayern"}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation(`/projects/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Projekt bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Projekt teilen
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handlePdfExport}
                  disabled={exportPdfMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportPdfMutation.isPending ? "Exportiere..." : "Als PDF exportieren"}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Projekt löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20">
        {/* Project Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Projektstatus</h2>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Startdatum</p>
                <p className="font-semibold text-gray-900">
                  {project.startDate 
                    ? new Date(project.startDate).toLocaleDateString('de-DE')
                    : "Nicht festgelegt"
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Enddatum</p>
                <p className="font-semibold text-gray-900">
                  {project.endDate 
                    ? new Date(project.endDate).toLocaleDateString('de-DE')
                    : "Nicht festgelegt"
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Budget</p>
                <p className="font-semibold text-gray-900">
                  {project.budget ? `€${Number(project.budget).toLocaleString()}` : "Nicht festgelegt"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Auftraggeber</p>
                <p className="font-semibold text-gray-900">
                  {project.customerId ? "Kunde zugewiesen" : "Kein Kunde"}
                </p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Gesamtfortschritt</span>
                <span>{project.completionPercentage || 0}%</span>
              </div>
              <Progress value={project.completionPercentage || 0} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Project Description */}
        {project.description && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Projektbeschreibung</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link href="/camera">
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-gray-900 text-xs">Foto hinzufügen</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/audio-recorder">
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-gray-900 text-xs">Audio-Notiz</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/documents">
            <Card className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-gray-900 text-xs">Dokumente</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Aktuelle Aktivitäten</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <strong>Projektleiter</strong> hat das Projekt erstellt
                  </p>
                  <p className="text-xs text-gray-600">
                    {project.createdAt 
                      ? new Date(project.createdAt).toLocaleDateString('de-DE')
                      : "Kürzlich"
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        {(project.latitude && project.longitude) && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Standort</h3>
                <Link href={`/maps?address=${encodeURIComponent(project.address || `${project.name} - Projektstandort`)}&lat=${project.latitude}&lng=${project.longitude}`}>
                  <Button variant="link" className="text-green-600 text-sm font-medium p-0">
                    Karte öffnen
                  </Button>
                </Link>
              </div>
              
              {/* Map placeholder */}
              <div className="relative h-40 bg-gray-300 rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                  alt="Aerial view of construction site" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3">
                    <MapPin className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  GPS: {Number(project.latitude).toFixed(4)}°N, {Number(project.longitude).toFixed(4)}°E
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
