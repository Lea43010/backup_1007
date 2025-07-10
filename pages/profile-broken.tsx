import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ArrowLeft, User, Shield, Server, Eye, EyeOff, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  privacyConsent?: boolean;
  sftpHost?: string;
  sftpPort?: number;
  sftpUsername?: string;
  sftpPassword?: string;
  sftpPath?: string;
  emailNotificationsEnabled?: boolean;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showSftpPassword, setShowSftpPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    privacyConsent: false,
    sftpHost: "",
    sftpPort: 22,
    sftpUsername: "",
    sftpPassword: "",
    sftpPath: "/",
    emailNotificationsEnabled: true,
  });

  // Update profile data when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        privacyConsent: (user as any)?.privacyConsent || false,
        sftpHost: (user as any)?.sftpHost || "",
        sftpPort: (user as any)?.sftpPort || 22,
        sftpUsername: (user as any)?.sftpUsername || "",
        sftpPassword: (user as any)?.sftpPassword || "",
        sftpPath: (user as any)?.sftpPath || "/",
        emailNotificationsEnabled: (user as any)?.emailNotificationsEnabled ?? true,
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      return await apiRequest(`/api/profile`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Profil-Aktualisierung ist fehlgeschlagen.",
        variant: "destructive",
      });
    },
  });

  const testSftpMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/profile/test-sftp`, "POST");
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

  const handleInputChange = (field: keyof ProfileUpdateData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleTestSftp = () => {
    testSftpMutation.mutate();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "Administrator";
      case "manager": return "Manager";
      default: return "Benutzer";
    }
  };

  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Profil wird geladen...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-gray-100">Mein Profil</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Persönliche Einstellungen verwalten
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Persönliche Informationen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Persönliche Informationen</span>
            </CardTitle>
            <CardDescription>
              Ihre Kontaktdaten und Benutzerinformationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {(user as any)?.profileImageUrl && (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="Profilbild"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </h3>
                  <Badge className={getRoleBadgeColor((user as any)?.role || "user")}>
                    {getRoleDisplayName((user as any)?.role || "user")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{(user as any)?.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Mitglied seit {new Date((user as any)?.createdAt || '').toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Ihr Vorname"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Ihr Nachname"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Berechtigungen und Datenschutz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Berechtigungen & Datenschutz</span>
            </CardTitle>
            <CardDescription>
              Ihre Rolle und Datenschutzeinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Datenschutzerklärung</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Zustimmung zur Verarbeitung personenbezogener Daten
                </p>
              </div>
              <Switch
                checked={profileData.privacyConsent}
                onCheckedChange={(checked) => handleInputChange('privacyConsent', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label className="text-sm font-medium">E-Mail-Benachrichtigungen</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Erhalten Sie Updates zu Ihren Projekten
                </p>
              </div>
              <Switch
                checked={profileData.emailNotificationsEnabled}
                onCheckedChange={(checked) => handleInputChange('emailNotificationsEnabled', checked)}
              />
            </div>

            {/* Admin Access - only visible for admin users */}
            {(user as any)?.role === 'admin' && (
              <>
                <Separator />
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <Label className="text-sm font-medium text-red-800 dark:text-red-200">Administrationsbereich</Label>
                    <p className="text-xs text-red-600 dark:text-red-300">
                      Zugriff auf Systemverwaltung und erweiterte Einstellungen
                    </p>
                  </div>
                  <Link href="/admin">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30">
                      <Settings className="h-4 w-4 mr-2" />
                      Administration
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SFTP-Konfiguration - nur für Manager und Admins */}
        {((user as any)?.role === 'manager' || (user as any)?.role === 'admin') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>SFTP-Server Konfiguration</span>
                <Badge variant="outline" className="ml-auto">
                  {(user as any)?.role === 'admin' ? 'Administrator' : 'Manager'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Verbindung zu Ihrem persönlichen Dokumenten-Server für erweiterte Dateiverwaltung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SFTP Setup Guide für Manager/Admin */}
              {!profileData.sftpHost && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">SFTP-Server einrichten</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Als {(user as any)?.role === 'admin' ? 'Administrator' : 'Manager'} haben Sie Zugriff auf erweiterte Dateiverwaltung. 
                    Konfigurieren Sie Ihren SFTP-Server für automatische Backups und Dateisynchronisation.
                  </p>
                  <div className="space-y-2 text-xs text-blue-700">
                    <p><strong>Empfohlene Anbieter:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Strato: ftp.strato.de</li>
                      <li>1&1 IONOS: sftp.example.com</li>
                      <li>Hetzner: your-server.hetzner.de</li>
                      <li>Eigener Server: ihre-domain.de</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* SFTP-Anleitung und Hilfe */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">📚 SFTP-Server Anleitung & Bedienung</h4>
                
                {/* Schnellstart für Einsteiger */}
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h5 className="font-medium text-yellow-900 mb-2">⚡ Schnellstart (5 Minuten)</h5>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-yellow-800">
                    <li>SFTP-Zugangsdaten von Ihrem Hosting-Anbieter besorgen</li>
                    <li>Unten alle Felder ausfüllen (Server, Port, Benutzername, Passwort)</li>
                    <li>"Verbindung testen" klicken - grüne Meldung = Erfolg</li>
                    <li>"SFTP-Manager öffnen" klicken und sofort loslegen</li>
                  </ol>
                </div>
                
                <div className="space-y-4 text-sm text-green-800">
                  <div>
                    <h5 className="font-medium mb-2">1. SFTP-Zugangsdaten erhalten</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Bei Ihrem Hosting-Anbieter ein SFTP-Konto einrichten</li>
                      <li>Server-Adresse, Benutzername und Passwort notieren</li>
                      <li>Standard-Port ist meist 22 (SFTP) oder 21 (FTP)</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">2. Konfiguration testen</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Alle Felder ausfüllen und "Verbindung testen" klicken</li>
                      <li>Bei Erfolg erscheint eine grüne Bestätigung</li>
                      <li>Bei Fehlern die Zugangsdaten beim Anbieter prüfen</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">3. SFTP-Manager verwenden</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Nach erfolgreicher Konfiguration "SFTP-Manager öffnen"</li>
                      <li>Dateien durchsuchen, hochladen und herunterladen</li>
                      <li>Ordner erstellen und Dateien organisieren</li>
                      <li>Automatische Backups Ihrer Projektdaten</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">4. SFTP-Manager Bedienung</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li><strong>Ordner navigieren:</strong> Klicken Sie auf Ordnernamen zum Öffnen</li>
                      <li><strong>Dateien hochladen:</strong> "Dateien hochladen" Button oder Drag & Drop</li>
                      <li><strong>Dateien herunterladen:</strong> Download-Symbol neben Dateiname</li>
                      <li><strong>Dateien löschen:</strong> Papierkorb-Symbol (Vorsicht: Endgültig!)</li>
                      <li><strong>Ordner erstellen:</strong> "Neuer Ordner" Button in der Toolbar</li>
                      <li><strong>Pfad ändern:</strong> Breadcrumb-Navigation oder Pfad-Eingabe</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">5. Automatische Funktionen</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li><strong>Projekt-Backups:</strong> Täglich um 2:00 Uhr (wenn konfiguriert)</li>
                      <li><strong>Dokumenten-Sync:</strong> Neue Uploads werden automatisch gesichert</li>
                      <li><strong>Versionierung:</strong> Überschriebene Dateien werden 30 Tage aufbewahrt</li>
                      <li><strong>Komprimierung:</strong> Große Dateien werden automatisch komprimiert</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">6. Sicherheitshinweise</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>Verwenden Sie starke Passwörter (min. 12 Zeichen)</li>
                      <li>Ändern Sie Zugangsdaten alle 3-6 Monate</li>
                      <li>Nur vertrauenswürdige Netzwerke verwenden</li>
                      <li>Sensible Daten zusätzlich verschlüsseln</li>
                      <li>Bei Problemen IT-Support kontaktieren</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">7. Häufige Probleme & Lösungen</h5>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li><strong>Verbindung fehlgeschlagen:</strong> Zugangsdaten und Port prüfen</li>
                      <li><strong>Upload nicht möglich:</strong> Dateigröße-Limit (max. 100MB) beachten</li>
                      <li><strong>Ordner nicht sichtbar:</strong> Berechtigungen beim Anbieter prüfen</li>
                      <li><strong>Langsame Übertragung:</strong> Internetverbindung und Server-Auslastung</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sftpHost">Server-Adresse *</Label>
                  <Input
                    id="sftpHost"
                    value={profileData.sftpHost}
                    onChange={(e) => handleInputChange('sftpHost', e.target.value)}
                    placeholder="sftp.ihr-anbieter.de"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    SFTP-Server Ihres Hosting-Anbieters
                  </p>
                </div>
                <div>
                  <Label htmlFor="sftpPort">Port</Label>
                  <Input
                    id="sftpPort"
                    type="number"
                    value={profileData.sftpPort}
                    onChange={(e) => handleInputChange('sftpPort', parseInt(e.target.value) || 22)}
                    placeholder="22"
                  />
                </div>
                <div>
                  <Label htmlFor="sftpUsername">Benutzername</Label>
                  <Input
                    id="sftpUsername"
                    value={profileData.sftpUsername}
                    onChange={(e) => handleInputChange('sftpUsername', e.target.value)}
                    placeholder="ihr-benutzername"
                  />
                </div>
                <div>
                  <Label htmlFor="sftpPassword">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="sftpPassword"
                      type={showSftpPassword ? "text" : "password"}
                      value={profileData.sftpPassword}
                      onChange={(e) => handleInputChange('sftpPassword', e.target.value)}
                      placeholder="ihr-passwort"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSftpPassword(!showSftpPassword)}
                    >
                      {showSftpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="sftpPath">Verzeichnispfad</Label>
                <Input
                  id="sftpPath"
                  value={profileData.sftpPath}
                  onChange={(e) => handleInputChange('sftpPath', e.target.value)}
                  placeholder="/dokumente"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleTestSftp}
                  disabled={testSftpMutation.isPending || !profileData.sftpHost}
                >
                  {testSftpMutation.isPending ? "Teste..." : "Verbindung testen"}
                </Button>
                <Link href="/sftp">
                  <Button 
                    variant="default"
                    disabled={!profileData.sftpHost}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    SFTP-Manager öffnen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aktionen */}
        <div className="flex justify-between">
          <Button 
            variant="destructive" 
            onClick={() => window.location.href = "/api/logout"}
          >
            Abmelden
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Speichere..." : "Änderungen speichern"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}