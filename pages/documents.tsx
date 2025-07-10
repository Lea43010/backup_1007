import { useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { PageHeader } from "../components/layout/page-header";
import { MobileNav } from "../components/layout/mobile-nav";
import { useToast } from "../hooks/use-toast";
import { 
  FileText, 
  Upload, 
  Search,
  Image,
  Music,
  FileArchive,
  Download,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Eye,
  Edit,
  Calendar,
  Folder,
  Grid3X3,
  List,
  Plus,
  FolderPlus
} from "lucide-react";
import { useLocation } from "wouter";

interface UserDocument {
  id: string;
  name: string;
  type: "image" | "audio" | "pdf" | "document" | "archive";
  size: string;
  uploadDate: string;
  projectId?: number;
  projectName?: string;
  category: "photos" | "audio" | "plans" | "documents" | "other";
  url?: string;
  thumbnail?: string;
}

// Benutzerdokumente - wird später durch echte API-Daten ersetzt
const userDocuments: UserDocument[] = [];

export default function Documents() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTab, setSelectedTab] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Filter documents based on search term and category
  const filteredDocuments = userDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.projectName && doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesTab = selectedTab === "all" || doc.category === selectedTab;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const categories = ["all", "photos", "audio", "plans", "documents", "other"];

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Upload gestartet",
        description: `${files.length} Datei(en) werden hochgeladen...`,
      });
      
      // Hier würde die tatsächliche Upload-Logik implementiert
      setTimeout(() => {
        toast({
          title: "Upload erfolgreich",
          description: "Alle Dateien wurden erfolgreich hochgeladen.",
        });
      }, 2000);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-5 w-5" />;
      case "audio": return <Music className="h-5 w-5" />;
      case "pdf":
      case "document": return <FileText className="h-5 w-5" />;
      case "archive": return <FileArchive className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image": return "bg-green-100 text-green-800";
      case "audio": return "bg-purple-100 text-purple-800";
      case "pdf": return "bg-red-100 text-red-800";
      case "document": return "bg-blue-100 text-blue-800";
      case "archive": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader 
        title="Meine Dokumente" 
        subtitle="Fotos, Baupläne, Sprachaufnahmen und Dateien verwalten"
        onBack={() => setLocation('/dashboard')}
      />
      
      <div className="container mx-auto px-4 py-6">
        
        {/* Upload Area */}
        <Card className="mb-6 border-dashed border-2 border-blue-300 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dateien hochladen
              </h3>
              <p className="text-gray-600 mb-4">
                Fotos, Baupläne, Sprachaufnahmen oder andere Dokumente hinzufügen
              </p>
              <div className="flex justify-center space-x-3">
                <Button onClick={handleFileUpload} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Dateien auswählen</span>
                </Button>
                <Button variant="outline" disabled>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Neuer Ordner
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-3">
                Unterstützte Formate: Bilder, Audio, PDF, Office-Dokumente, Archive
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Categories */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="plans">Baupläne</TabsTrigger>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="other">Sonstige</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and View Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Dateien durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Storage Info */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">SFTP-Speicher</p>
                <p className="text-xs text-gray-600">Server: 128.140.82.20</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">0 MB von 1 GB belegt</p>
                <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                  <div className="w-0 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Display */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm line-clamp-1" title={doc.name}>
                          {doc.name}
                        </CardTitle>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {doc.thumbnail && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={doc.thumbnail} 
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="secondary" className={getTypeColor(doc.type)}>
                        {doc.type.toUpperCase()}
                      </Badge>
                      <span className="text-gray-500">{doc.size}</span>
                    </div>
                    
                    {doc.projectName && (
                      <p className="text-xs text-blue-600 truncate">
                        📁 {doc.projectName}
                      </p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(doc.uploadDate).toLocaleDateString('de-DE')}
                    </div>
                    
                    <div className="flex space-x-1 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        Öffnen
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                {filteredDocuments.map((doc, index) => (
                  <div 
                    key={doc.id} 
                    className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                      index !== filteredDocuments.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{doc.size}</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString('de-DE')}</span>
                          {doc.projectName && (
                            <span className="text-blue-600">📁 {doc.projectName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getTypeColor(doc.type)}>
                        {doc.type.toUpperCase()}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredDocuments.length === 0 && (
          <Card className="p-8 text-center">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Dokumente gefunden
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedTab !== "all" 
                ? "Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie."
                : "Laden Sie Ihre ersten Dateien hoch, um loszulegen."
              }
            </p>
            <Button onClick={handleFileUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Erste Datei hochladen
            </Button>
          </Card>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{userDocuments.length}</p>
                <p className="text-xs text-gray-600">Gesamt</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Image className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userDocuments.filter(d => d.type === "image").length}
                </p>
                <p className="text-xs text-gray-600">Fotos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userDocuments.filter(d => d.type === "audio").length}
                </p>
                <p className="text-xs text-gray-600">Audio</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {userDocuments.filter(d => d.type === "pdf" || d.type === "document").length}
                </p>
                <p className="text-xs text-gray-600">Dokumente</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}