import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  Server, 
  Folder, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  FolderPlus, 
  Home,
  ArrowLeft,
  RefreshCw,
  HardDrive,
  Calendar,
  Eye
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";

interface SftpFile {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: Date;
  permissions: string;
}

interface SftpListResponse {
  path: string;
  files: SftpFile[];
}

export default function SftpManager() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentPath, setCurrentPath] = useState('/');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // Redirect if not authenticated or not manager/admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Nicht autorisiert",
        description: "Sie müssen sich anmelden um fortzufahren.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && user && (user as any).role === 'user') {
      toast({
        title: "Zugriff verweigert",
        description: "SFTP-Zugriff erfordert Manager- oder Admin-Berechtigung.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  // Fetch SFTP files
  const { data: sftpData, isLoading: isLoadingFiles, refetch } = useQuery<SftpListResponse>({
    queryKey: ['/api/sftp/files', currentPath],
    enabled: !!user && (user as any).role !== 'user',
    retry: false,
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { fileName: string; path: string; fileSize: number }) => {
      return await apiRequest('/api/sftp/upload', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Upload erfolgreich",
        description: "Datei wurde erfolgreich hochgeladen.",
      });
      setSelectedFile(null);
      setShowUploadForm(false);
      refetch();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Nicht autorisiert",
          description: "Sie sind abgemeldet. Melden Sie sich erneut an...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload fehlgeschlagen",
        description: "Datei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      return await apiRequest(`/api/sftp/files/${fileName}?path=${encodeURIComponent(currentPath)}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Datei gelöscht",
        description: "Datei wurde erfolgreich gelöscht.",
      });
      refetch();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Nicht autorisiert",
          description: "Sie sind abgemeldet. Melden Sie sich erneut an...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Löschung fehlgeschlagen",
        description: "Datei konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (data: { folderName: string; path: string }) => {
      return await apiRequest('/api/sftp/create-folder', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Ordner erstellt",
        description: "Ordner wurde erfolgreich erstellt.",
      });
      setNewFolderName('');
      setShowCreateFolder(false);
      refetch();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Nicht autorisiert",
          description: "Sie sind abgemeldet. Melden Sie sich erneut an...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erstellung fehlgeschlagen",
        description: "Ordner konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.pop();
    setCurrentPath(pathParts.length === 0 ? '/' : `/${pathParts.join('/')}`);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    uploadMutation.mutate({
      fileName: selectedFile.name,
      path: currentPath,
      fileSize: selectedFile.size
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    createFolderMutation.mutate({
      folderName: newFolderName.trim(),
      path: currentPath
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Lade SFTP-Manager...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader>
        <h1 className="text-xl font-semibold text-gray-900">SFTP-Manager</h1>
      </PageHeader>

      <div className="p-4 space-y-6">
        {/* Server Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-green-600" />
              <span>Server-Verbindung</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Server:</p>
                <p className="text-gray-600">{(user as any)?.sftpHost || 'Nicht konfiguriert'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Benutzer:</p>
                <p className="text-gray-600">{(user as any)?.sftpUsername || 'Nicht konfiguriert'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Aktueller Pfad:</p>
                <p className="text-gray-600 font-mono">{currentPath}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Datei-Browser</span>
                <Badge variant="outline">{sftpData?.files?.length || 0} Einträge</Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPath('/')}
                  disabled={currentPath === '/'}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Root
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateUp}
                  disabled={currentPath === '/'}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Zurück
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoadingFiles}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Datei hochladen
                </Button>
                
                <Button
                  onClick={() => setShowCreateFolder(!showCreateFolder)}
                  variant="outline"
                  size="sm"
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  Ordner erstellen
                </Button>
              </div>

              {/* Upload Form */}
              {showUploadForm && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Datei auswählen:</label>
                        <Input
                          type="file"
                          onChange={handleFileSelect}
                          className="bg-white"
                        />
                      </div>
                      
                      {selectedFile && (
                        <div className="p-2 bg-white rounded border text-sm">
                          <p><strong>Datei:</strong> {selectedFile.name}</p>
                          <p><strong>Größe:</strong> {formatFileSize(selectedFile.size)}</p>
                          <p><strong>Ziel:</strong> {currentPath}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpload}
                          disabled={!selectedFile || uploadMutation.isPending}
                          size="sm"
                        >
                          {uploadMutation.isPending ? 'Lade hoch...' : 'Hochladen'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowUploadForm(false);
                            setSelectedFile(null);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Create Folder Form */}
              {showCreateFolder && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Ordnername:</label>
                        <Input
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Neuer Ordner"
                          className="bg-white"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCreateFolder}
                          disabled={!newFolderName.trim() || createFolderMutation.isPending}
                          size="sm"
                        >
                          {createFolderMutation.isPending ? 'Erstelle...' : 'Erstellen'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowCreateFolder(false);
                            setNewFolderName('');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* File Listing */}
              {isLoadingFiles ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-green-600" />
                  <p className="text-gray-600">Lade Dateien...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sftpData?.files?.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {file.type === 'directory' ? (
                          <Folder className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {file.type === 'directory' ? (
                              <button
                                onClick={() => navigateToFolder(file.name)}
                                className="font-medium text-blue-600 hover:text-blue-800 truncate"
                              >
                                {file.name}
                              </button>
                            ) : (
                              <span className="font-medium text-gray-900 truncate">{file.name}</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {file.permissions}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <HardDrive className="h-3 w-3 mr-1" />
                              {formatFileSize(file.size)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(file.modified)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {file.type === 'file' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Download",
                                description: `Download von ${file.name} wird gestartet...`,
                              });
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Sind Sie sicher, dass Sie "${file.name}" löschen möchten?`)) {
                                deleteMutation.mutate(file.name);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {sftpData?.files?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Folder className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Dieser Ordner ist leer</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPath('/projects')}
                className="justify-start"
              >
                <Folder className="h-4 w-4 mr-1" />
                Projekte
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPath('/documents')}
                className="justify-start"
              >
                <FileText className="h-4 w-4 mr-1" />
                Dokumente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPath('/backup')}
                className="justify-start"
              >
                <HardDrive className="h-4 w-4 mr-1" />
                Backup
              </Button>
              <Link to="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Einstellungen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}