import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { X, Settings, RotateCcw, Zap, Target, Circle, Camera as CameraIcon, Save, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { Project } from "../../shared/schema";

export default function Camera() {
  const [, setLocation] = useLocation();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [captureMode, setCaptureMode] = useState<"photo" | "video" | "panorama">("photo");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [photoDescription, setPhotoDescription] = useState("");
  const [gpsLocation, setGpsLocation] = useState<{lat: number; lng: number} | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Projekte laden
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Foto speichern Mutation
  const savePhotoMutation = useMutation({
    mutationFn: async (data: {
      projectId: number;
      description: string;
      imageData: string;
      latitude?: number;
      longitude?: number;
    }) => {
      return await apiRequest("/api/photos", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Foto gespeichert",
        description: "Das Foto wurde erfolgreich zum Projekt hinzugefügt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      setCapturedPhoto(null);
      setShowSaveDialog(false);
      setPhotoDescription("");
      setSelectedProject("");
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Speichern",
        description: "Das Foto konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });

  // Kamera initialisieren
  useEffect(() => {
    startCamera();
    getCurrentLocation();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Rückkamera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Kamera-Zugriff fehlgeschlagen:", error);
      toast({
        title: "Kamera-Fehler",
        description: "Zugriff auf die Kamera fehlgeschlagen. Bitte Berechtigungen prüfen.",
        variant: "destructive",
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("GPS-Fehler:", error);
        }
      );
    }
  };

  const goBack = () => {
    setLocation("/");
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Canvas-Größe an Video anpassen
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Aktuelles Video-Frame auf Canvas zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Flash-Effekt
    const flashDiv = document.createElement('div');
    flashDiv.className = 'fixed inset-0 bg-white z-50 opacity-0 pointer-events-none';
    document.body.appendChild(flashDiv);
    
    flashDiv.style.opacity = '0.8';
    setTimeout(() => {
      flashDiv.style.opacity = '0';
      setTimeout(() => document.body.removeChild(flashDiv), 200);
    }, 100);

    // Foto als Base64-String speichern
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    setShowSaveDialog(true);
  };

  const savePhoto = () => {
    if (!capturedPhoto || !selectedProject) return;

    const projectId = parseInt(selectedProject);
    
    savePhotoMutation.mutate({
      projectId,
      description: photoDescription,
      imageData: capturedPhoto,
      latitude: gpsLocation?.lat,
      longitude: gpsLocation?.lng,
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 text-white z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-white" onClick={goBack}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Foto aufnehmen</h1>
            <Button variant="ghost" size="sm" className="text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="relative h-screen bg-black">
        {/* Echte Kamera-Ansicht */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Verstecktes Canvas für Foto-Aufnahme */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Camera UI Overlay */}
          <div className="absolute inset-0">
            {/* GPS Indicator */}
            <div className="absolute top-20 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
              <span className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${gpsLocation ? 'bg-green-400' : 'bg-red-400'}`}></div>
                GPS: {gpsLocation 
                  ? `${gpsLocation.lat.toFixed(3)}°N, ${gpsLocation.lng.toFixed(3)}°E`
                  : 'Wird ermittelt...'
                }
              </span>
            </div>
            
            {/* Project Context */}
            <div className="absolute top-20 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
              Aktuelles Projekt
            </div>
            
            {/* Center Grid */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg width="200" height="200" className="text-white opacity-30">
                <line x1="0" y1="66" x2="200" y2="66" stroke="currentColor" strokeWidth="1"/>
                <line x1="0" y1="133" x2="200" y2="133" stroke="currentColor" strokeWidth="1"/>
                <line x1="66" y1="0" x2="66" y2="200" stroke="currentColor" strokeWidth="1"/>
                <line x1="133" y1="0" x2="133" y2="200" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Camera Controls */}
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="flex items-center justify-between">
            {/* Gallery Thumbnail */}
            <div className="w-12 h-12 bg-gray-300 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
                alt="Last photo thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Capture Button */}
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-400 flex items-center justify-center">
                <Circle className="h-8 w-8 text-gray-600" />
              </div>
            </button>
            
            {/* Camera Switch */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-12 h-12 bg-black/50 text-white hover:bg-black/70"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Photo Modes */}
          <div className="flex justify-center space-x-6 mt-6">
            {["video", "photo", "panorama"].map((mode) => (
              <button
                key={mode}
                onClick={() => setCaptureMode(mode as any)}
                className={`text-sm capitalize ${
                  captureMode === mode 
                    ? "text-white font-semibold" 
                    : "text-white/50"
                }`}
              >
                {mode === "video" ? "Video" : mode === "photo" ? "Foto" : "Panorama"}
              </button>
            ))}
          </div>
        </div>

        {/* Flash and Focus Controls */}
        <div className="absolute top-24 left-4 space-y-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-black/50 text-white hover:bg-black/70"
            onClick={() => setIsFlashOn(!isFlashOn)}
          >
            <Zap className={`h-5 w-5 ${isFlashOn ? "text-yellow-400" : "text-white"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-black/50 text-white hover:bg-black/70"
          >
            <Target className="h-5 w-5" />
          </Button>
        </div>

        {/* Capture Information */}
        <div className="absolute bottom-32 left-4 right-4">
          <Card className="bg-black/50 border-0">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-white text-xs">
                <span>Automatisches Geo-Tagging</span>
                <Badge variant="secondary" className="bg-green-500 text-white">
                  GPS aktiv
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Foto-Speicher Dialog */}
      {showSaveDialog && capturedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Foto speichern</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setCapturedPhoto(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Foto-Vorschau */}
            <div className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img 
                  src={capturedPhoto} 
                  alt="Aufgenommenes Foto" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Projekt auswählen */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-select">Projekt auswählen *</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Projekt auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name} (#{project.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Beschreibung */}
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Input
                    id="description"
                    placeholder="Was ist auf dem Foto zu sehen?"
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                  />
                </div>

                {/* GPS-Info */}
                {gpsLocation && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      GPS: {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="p-4 border-t bg-gray-50 flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setCapturedPhoto(null);
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={savePhoto}
                disabled={!selectedProject || savePhotoMutation.isPending}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {savePhotoMutation.isPending ? "Speichert..." : "Speichern"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
