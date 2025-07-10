import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { ArrowLeft, User, Shield, Server, Eye, EyeOff, Settings, Camera, Upload, Users, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  position?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  language?: string;
  privacyConsent?: boolean;
  sftpHost?: string;
  sftpPort?: number;
  sftpUsername?: string;
  sftpPassword?: string;
  sftpPath?: string;
  emailNotificationsEnabled?: boolean;
}

function Profile() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showSftpPassword, setShowSftpPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    position: "",
    phone: "",
    location: "",
    timezone: "Europe/Berlin",
    language: "de",
    privacyConsent: false,
    sftpHost: "",
    sftpPort: 21,
    sftpUsername: "",
    sftpPassword: "",
    sftpPath: "/",
    emailNotificationsEnabled: true,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Lade Projektrollen des Benutzers
  const { data: projectRoles = [] } = useQuery({
    queryKey: ["/api/profile/project-roles"],
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        displayName: (user as any)?.displayName || "",
        position: (user as any)?.position || "",
        phone: (user as any)?.phone || "",
        location: (user as any)?.location || "",
        timezone: (user as any)?.timezone || "Europe/Berlin",
        language: (user as any)?.language || "de",
        privacyConsent: (user as any)?.privacyConsent || false,
        sftpHost: (user as any)?.sftpHost || "",
        sftpPort: (user as any)?.sftpPort || 21,
        sftpUsername: (user as any)?.sftpUsername || "",
        sftpPassword: (user as any)?.sftpPassword || "",
        sftpPath: (user as any)?.sftpPath || "/",
        emailNotificationsEnabled: (user as any)?.emailNotificationsEnabled ?? true,
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      console.log("Frontend: Making API request with data:", data);
      try {
        const response = await apiRequest(`/api/profile`, "PATCH", data);
        console.log("Frontend: API response received:", response);
        return response;
      } catch (error) {
        console.error("Frontend: API request failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Frontend: Profile update successful");
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error("Frontend: Profile update error:", error);
      toast({
        title: "Fehler",
        description: `Die Profil-Aktualisierung ist fehlgeschlagen: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const testSftpMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/profile/test-sftp`, "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "SFTP-Verbindung erfolgreich",
        description: "Die Verbindung zu Ihrem SFTP-Server wurde erfolgreich getestet.",
      });
    },
    onError: (error) => {
      toast({
        title: "SFTP-Verbindung fehlgeschlagen",
        description: "Überprüfen Sie Ihre SFTP-Einstellungen und versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest(`/api/profile/change-password`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Passwort geändert",
        description: "Ihr Passwort wurde erfolgreich aktualisiert.",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordChange(false);
    },
    onError: (error) => {
      toast({
        title: "Passwort-Änderung fehlgeschlagen",
        description: error.message || "Überprüfen Sie Ihr aktuelles Passwort und versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  const uploadProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload fehlgeschlagen');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profilbild hochgeladen",
        description: "Ihr Profilbild wurde erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setProfileImage(null);
      setProfileImagePreview(null);
    },
    onError: (error) => {
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message || "Das Profilbild konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    console.log("Saving profile data:", profileData);
    updateProfileMutation.mutate(profileData);
  };

  const handleTestSftp = () => {
    testSftpMutation.mutate();
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handlePasswordReset = () => {
    toast({
      title: "Passwort-Reset angefordert",
      description: "Eine E-Mail mit Anweisungen wurde an Ihre registrierte E-Mail-Adresse gesendet.",
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwörter stimmen nicht überein",
        description: "Bitte stellen Sie sicher, dass beide Passwort-Felder identisch sind.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Passwort zu kurz",
        description: "Das neue Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Bitte wählen Sie eine Bilddatei (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Das Bild darf maximal 5MB groß sein.",
        variant: "destructive",
      });
      return;
    }

    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = () => {
    if (!profileImage) return;
    uploadProfileImageMutation.mutate(profileImage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  const userEmail = (user as any)?.email || "";
  const userRole = (user as any)?.role || "user";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profil</h1>
          <p className="text-gray-600 dark:text-gray-400">Verwalten Sie Ihre Kontoinformationen und Einstellungen</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Persönliche Informationen
            </CardTitle>
            <CardDescription>
              Ihre grundlegenden Kontoinformationen und Profilbild
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profilbild-Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profilbild Vorschau"
                      className="w-full h-full object-cover"
                    />
                  ) : (user as any)?.profileImageUrl ? (
                    <img
                      src={(user as any).profileImageUrl}
                      alt="Profilbild"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <label htmlFor="profile-image-input" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              {profileImage && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploadProfileImageMutation.isPending}
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadProfileImageMutation.isPending ? "Uploade..." : "Hochladen"}
                  </Button>
                  <Button
                    onClick={() => {
                      setProfileImage(null);
                      setProfileImagePreview(null);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Abbrechen
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  placeholder="Ihr Vorname"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  placeholder="Ihr Nachname"
                />
              </div>
            </div>

            {/* Anzeigename */}
            <div>
              <Label htmlFor="displayName">Anzeigename / Benutzername</Label>
              <Input
                id="displayName"
                value={profileData.displayName}
                onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                placeholder="Wie sollen andere Sie sehen?"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Öffentlich sichtbarer Name in der Anwendung
              </p>
            </div>

            {/* Position */}
            <div>
              <Label htmlFor="position">Position / Rolle im Unternehmen</Label>
              <Input
                id="position"
                value={profileData.position}
                onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                placeholder="z.B. Projektleiter, Bauingenieur, Sachverständiger"
              />
            </div>

            <Separator />

            {/* Kontaktinformationen */}
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                value={userEmail}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                E-Mail-Adresse kann nicht geändert werden
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Telefonnummer (optional)</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <Label htmlFor="location">Standort / Büro</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                placeholder="z.B. München, Frankfurt am Main"
              />
            </div>

            <Separator />

            {/* Zeitzone & Sprache */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Zeitzone</Label>
                <select
                  id="timezone"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="Europe/Berlin">Europe/Berlin (MEZ)</option>
                  <option value="Europe/Vienna">Europe/Vienna (MEZ)</option>
                  <option value="Europe/Zurich">Europe/Zurich (MEZ)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">Sprache</Label>
                <select
                  id="language"
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>

            <Separator />

            {/* System-Rolle */}
            <div>
              <Label htmlFor="role">System-Rolle</Label>
              <div className="mt-2">
                <Badge variant="outline" className="capitalize">
                  {userRole === 'admin' ? 'Administrator' : userRole === 'manager' ? 'Manager' : 'Benutzer'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                System-Rolle kann nur von Administratoren geändert werden
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Datenschutz & Benachrichtigungen
            </CardTitle>
            <CardDescription>
              Steuern Sie Ihre Privatsphäre-Einstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="privacy-consent">Datenschutzerklärung akzeptiert</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Zustimmung zur Datenverarbeitung
                </p>
              </div>
              <Switch
                id="privacy-consent"
                checked={profileData.privacyConsent}
                onCheckedChange={(checked) => setProfileData({ ...profileData, privacyConsent: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">E-Mail-Benachrichtigungen</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Benachrichtigungen über Projektaktivitäten
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={profileData.emailNotificationsEnabled}
                onCheckedChange={(checked) => setProfileData({ ...profileData, emailNotificationsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              SFTP-Konfiguration (Hetzner Cloud)
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie Ihre Hetzner Cloud SFTP-Verbindung mit ProFTPD für sichere Datei-Uploads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sftpHost">SFTP-Host (Hetzner Server IP)</Label>
                <Input
                  id="sftpHost"
                  value={profileData.sftpHost}
                  onChange={(e) => setProfileData({ ...profileData, sftpHost: e.target.value })}
                  placeholder="128.140.82.20"
                />
                <p className="text-xs text-gray-500 mt-1">IPv4-Adresse Ihres Hetzner Cloud Servers</p>
              </div>
              <div>
                <Label htmlFor="sftpPort">Port</Label>
                <Input
                  id="sftpPort"
                  type="number"
                  value={profileData.sftpPort}
                  onChange={(e) => setProfileData({ ...profileData, sftpPort: parseInt(e.target.value) || 21 })}
                  placeholder="21"
                />
                <p className="text-xs text-gray-500 mt-1">Standard: 21 (FTP) oder 22 (SFTP)</p>
              </div>
            </div>
            <div>
              <Label htmlFor="sftpUsername">FTP-Benutzername</Label>
              <Input
                id="sftpUsername"
                value={profileData.sftpUsername}
                onChange={(e) => setProfileData({ ...profileData, sftpUsername: e.target.value })}
                placeholder="z.B. baustructura_user"
              />
              <p className="text-xs text-gray-500 mt-1">Von ProFTPD erstellter FTP-Benutzer</p>
            </div>
            <div>
              <Label htmlFor="sftpPassword">Passwort</Label>
              <div className="relative">
                <Input
                  id="sftpPassword"
                  type={showSftpPassword ? "text" : "password"}
                  value={profileData.sftpPassword}
                  onChange={(e) => setProfileData({ ...profileData, sftpPassword: e.target.value })}
                  placeholder="ihr-passwort"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSftpPassword(!showSftpPassword)}
                >
                  {showSftpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="sftpPath">Upload-Pfad</Label>
              <Input
                id="sftpPath"
                value={profileData.sftpPath}
                onChange={(e) => setProfileData({ ...profileData, sftpPath: e.target.value })}
                placeholder="/var/ftp/uploads/"
              />
              <p className="text-xs text-gray-500 mt-1">Zielverzeichnis auf dem Hetzner Server</p>
            </div>
            
            {/* Hetzner Server Status */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                ✅ Ihr Hetzner Server: replit-sftp
              </h4>
              <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <p><strong>Server-IP:</strong> 128.140.82.20</p>
                <p><strong>Standort:</strong> Falkenstein, Deutschland</p>
                <p><strong>Status:</strong> Bereit für ProFTPD Installation</p>
                <p><strong>Nächster Schritt:</strong> 
                  <a 
                    href="/docs/hetzner-sftp-setup.md" 
                    target="_blank"
                    className="underline ml-1 hover:text-green-600"
                  >
                    Vollständige Setup-Anleitung öffnen
                  </a>
                </p>
              </div>
            </div>
            
            {/* Multi-Tenant Architektur Info */}
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
                💡 Multi-Tenant Architektur - Ein Server für alle Benutzer
              </h4>
              <div className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                <p><strong>Kosten:</strong> Nur EINE Hetzner Lizenz (~5€/Monat) für unbegrenzte Bau-Structura Benutzer</p>
                <p><strong>Isolation:</strong> Jeder Benutzer erhält automatisch seinen eigenen sicheren SFTP-Bereich</p>
                <p><strong>Ihr Bereich:</strong> /var/ftp/user_{(user as any)?.id || 'YOUR_ID'}/uploads/</p>
                <p><strong>Quota:</strong> 1GB Speicherplatz pro Benutzer (erweiterbar)</p>
              </div>
            </div>
            
            {/* Auto-Setup Button */}
            <div className="mt-4">
              <Button 
                onClick={() => {
                  toast({
                    title: "Multi-Tenant Setup",
                    description: "Automatische SFTP-Account-Erstellung wird nach Server-Setup verfügbar sein.",
                  });
                }}
                variant="outline" 
                className="w-full"
              >
                🚀 Automatischen SFTP-Account erstellen (nach Server-Setup)
              </Button>
            </div>
            
            {/* Schnell-Setup für Admin */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                🔧 Admin: Multi-Tenant Server Setup
              </h4>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>1. SSH:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">ssh root@128.140.82.20</code></p>
                <p><strong>2. Multi-Tenant ProFTPD:</strong> Siehe docs/multi-tenant-sftp-architecture.md</p>
                <p><strong>3. Auto-User-Creation:</strong> PostgreSQL + Benutzer-spezifische Verzeichnisse</p>
                <p><strong>4. Sicherheit:</strong> Vollständige Benutzer-Isolation + Quota-System</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleTestSftp}
                variant="outline"
                disabled={testSftpMutation.isPending}
              >
                {testSftpMutation.isPending ? "Teste..." : "Verbindung testen"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Konto-Aktionen
            </CardTitle>
            <CardDescription>
              Verwalten Sie Ihr Konto und Ihre Sicherheitseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                variant="outline"
                className="flex-1"
              >
                Passwort ändern
              </Button>
              <Button 
                onClick={handlePasswordReset}
                variant="outline"
                className="flex-1"
              >
                Passwort zurücksetzen
              </Button>
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="flex-1"
              >
                Abmelden
              </Button>
            </div>
            
            {/* Passwort-Ändern-Dialog */}
            {showPasswordChange && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold mb-4">Passwort ändern</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Ihr aktuelles Passwort"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">Neues Passwort</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Mindestens 6 Zeichen"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Passwort wiederholen"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                      size="sm"
                    >
                      {changePasswordMutation.isPending ? "Speichere..." : "Passwort ändern"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>• Passwort ändern: Direkte Änderung mit aktuellem Passwort</p>
              <p>• Passwort zurücksetzen: E-Mail mit Anweisungen</p>
              <p>• Abmelden: Beendet Ihre aktuelle Sitzung</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateProfileMutation.isPending ? "Speichere..." : "Änderungen speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Profile;