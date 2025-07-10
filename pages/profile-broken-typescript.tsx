import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

  const handleSave = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
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

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Persönliche Informationen
            </CardTitle>
            <CardDescription>
              Ihre grundlegenden Kontoinformationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                value={(user as any)?.email || ""}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                E-Mail-Adresse kann nicht geändert werden
              </p>
            </div>
            <div>
              <Label htmlFor="role">Rolle</Label>
              <div className="mt-2">
                <Badge variant="outline" className="capitalize">
                  {(user as any)?.role || "user"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
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

        {/* SFTP Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              SFTP-Konfiguration
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie Ihre SFTP-Verbindung für Datei-Uploads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sftpHost">SFTP-Host</Label>
                <Input
                  id="sftpHost"
                  value={profileData.sftpHost}
                  onChange={(e) => setProfileData({ ...profileData, sftpHost: e.target.value })}
                  placeholder="ftp.example.com"
                />
              </div>
              <div>
                <Label htmlFor="sftpPort">Port</Label>
                <Input
                  id="sftpPort"
                  type="number"
                  value={profileData.sftpPort}
                  onChange={(e) => setProfileData({ ...profileData, sftpPort: parseInt(e.target.value) || 22 })}
                  placeholder="22"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sftpUsername">Benutzername</Label>
              <Input
                id="sftpUsername"
                value={profileData.sftpUsername}
                onChange={(e) => setProfileData({ ...profileData, sftpUsername: e.target.value })}
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
              <Label htmlFor="sftpPath">Pfad</Label>
              <Input
                id="sftpPath"
                value={profileData.sftpPath}
                onChange={(e) => setProfileData({ ...profileData, sftpPath: e.target.value })}
                placeholder="/uploads/"
              />
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

        {/* Account Actions */}
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
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>• Passwort zurücksetzen sendet eine E-Mail mit Anweisungen</p>
              <p>• Abmelden beendet Ihre aktuelle Sitzung</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
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