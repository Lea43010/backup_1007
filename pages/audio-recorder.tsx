import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { 
  X, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Save, 
  MapPin, 
  Clock,
  FileAudio,
  Trash2,
  Download
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { Project } from "../../shared/schema";

interface AudioRecording {
  id?: number;
  projectId: number;
  fileName: string;
  filePath: string;
  duration: number;
  description: string;
  transcription?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
  recordedAt: Date;
  recordedBy: string;
}

export default function AudioRecorder() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [description, setDescription] = useState("");
  const [transcription, setTranscription] = useState("");
  const [gpsLocation, setGpsLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Projekte laden
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Bestehende Audio-Aufnahmen laden
  const { data: recordings = [] } = useQuery<AudioRecording[]>({
    queryKey: ["/api/audio-records"],
  });

  // Audio-Aufnahme speichern
  const saveRecordingMutation = useMutation({
    mutationFn: async (data: {
      projectId: number;
      description: string;
      audioData: string;
      duration: number;
      transcription?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      return await apiRequest("/api/audio-records", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Audio-Aufnahme gespeichert",
        description: "Die Aufnahme wurde erfolgreich zum Projekt hinzugefügt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/audio-records"] });
      resetRecording();
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Speichern",
        description: "Die Audio-Aufnahme konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });

  // Audio transkribieren
  const transcribeMutation = useMutation({
    mutationFn: async (audioData: string) => {
      return await apiRequest("/api/audio/transcribe", "POST", { audioData });
    },
    onSuccess: (data: any) => {
      setTranscription(data.transcription);
      setIsTranscribing(false);
    },
    onError: (error) => {
      toast({
        title: "Transkription fehlgeschlagen",
        description: "Die Spracherkennung konnte nicht durchgeführt werden.",
        variant: "destructive",
      });
      setIsTranscribing(false);
    },
  });

  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stream beenden
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000); // Alle 1000ms Daten sammeln
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      
      // Timer starten
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Mikrofon-Zugriff fehlgeschlagen:", error);
      toast({
        title: "Mikrofon-Fehler",
        description: "Zugriff auf das Mikrofon fehlgeschlagen. Bitte Berechtigungen prüfen.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setDescription("");
    setTranscription("");
    setSelectedProject("");
    setIsRecording(false);
    setIsPaused(false);
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    
    // Audio Blob zu Base64 konvertieren
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      transcribeMutation.mutate(base64Data);
    };
    reader.readAsDataURL(audioBlob);
  };

  const saveRecording = () => {
    if (!audioBlob || !selectedProject) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      
      saveRecordingMutation.mutate({
        projectId: parseInt(selectedProject),
        description,
        audioData: base64Data,
        duration,
        transcription: transcription || undefined,
        latitude: gpsLocation?.lat,
        longitude: gpsLocation?.lng,
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold text-gray-900">Audio-Aufnahme</h1>
            <div className="w-8" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* GPS Status */}
        {gpsLocation && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-green-500" />
                <span>GPS: {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Recorder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileAudio className="h-5 w-5" />
              <span>Sprachaufnahme</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recording Controls */}
            <div className="text-center space-y-4">
              {/* Timer Display */}
              <div className="text-3xl font-mono text-gray-700">
                {formatTime(duration)}
              </div>
              
              {/* Recording Status */}
              {isRecording && (
                <Badge variant={isPaused ? "secondary" : "destructive"} className="animate-pulse">
                  {isPaused ? "Pausiert" : "Aufnahme läuft"}
                </Badge>
              )}
              
              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                {!isRecording && !audioBlob && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
                  >
                    <Mic className="h-6 w-6 text-white" />
                  </Button>
                )}
                
                {isRecording && (
                  <>
                    <Button
                      onClick={pauseRecording}
                      size="lg"
                      variant="outline"
                      className="w-16 h-16 rounded-full"
                    >
                      {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                    </Button>
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      className="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-800"
                    >
                      <Square className="h-6 w-6 text-white" />
                    </Button>
                  </>
                )}
                
                {audioBlob && (
                  <Button
                    onClick={resetRecording}
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full"
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                )}
              </div>
            </div>

            {/* Audio Playback */}
            {audioUrl && (
              <div className="space-y-4">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/webm" />
                  Ihr Browser unterstützt das Audio-Element nicht.
                </audio>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={transcribeAudio}
                    disabled={isTranscribing}
                    variant="outline"
                    className="flex-1"
                  >
                    {isTranscribing ? "Transkribiere..." : "Sprache zu Text"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recording Details */}
        {audioBlob && (
          <Card>
            <CardHeader>
              <CardTitle>Aufnahme-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Input
                  id="description"
                  placeholder="Kurze Beschreibung der Aufnahme..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {transcription && (
                <div>
                  <Label htmlFor="transcription">Transkription</Label>
                  <Textarea
                    id="transcription"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    rows={4}
                    placeholder="Automatisch generierte Transkription..."
                  />
                </div>
              )}

              <Button
                onClick={saveRecording}
                disabled={!selectedProject || saveRecordingMutation.isPending}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveRecordingMutation.isPending ? "Speichert..." : "Aufnahme speichern"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Recordings */}
        {recordings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aufnahmen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recordings.slice(0, 5).map((recording) => (
                  <div key={recording.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{recording.description || 'Unbenannte Aufnahme'}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(recording.duration)}</span>
                        <span>•</span>
                        <span>{new Date(recording.recordedAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}