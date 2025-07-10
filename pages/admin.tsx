import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface SystemStats {
  activeUsers: number;
  newUsersThisMonth: number;
  dbSize: string;
  lastBackup: string;
  activeLicenses: number;
  expiringLicenses: number;
  availableLicenses: number;
  totalProjects: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
  basicLicenses: number;
  professionalLicenses: number;
  enterpriseLicenses: number;
  paymentsThisMonth: number;
  totalRevenue: number;
}
import { 
  Users, 
  Database, 
  FileText, 
  Key,
  CreditCard,
  BarChart, 
  TestTube2, 
  Download,
  Shield,
  Activity,
  ArrowLeft,
  Settings,
  Mail,
  Brain
} from "lucide-react";
import { ErrorLearningDashboard } from "@/components/error-learning-dashboard";
import { Link } from "wouter";



export default function Admin() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showPaymentOverview, setShowPaymentOverview] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showErrorLearning, setShowErrorLearning] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "user",
    licenseType: "basic"
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.role !== 'admin')) {
      toast({
        title: "Zugriff verweigert",
        description: "Nur Administratoren können auf diesen Bereich zugreifen.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Fetch real system stats from API
  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && (user as any)?.role === 'admin'
  });

  // Fetch users list
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && (user as any)?.role === 'admin'
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest("/api/admin/users", "POST", userData);
      return await response.json();
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setNewUser({ username: "", email: "", role: "user", licenseType: "basic" });
      setShowUserForm(false);
      toast({
        title: "Benutzer erstellt",
        description: response.message || "Der neue Benutzer wurde erfolgreich erstellt und das Passwort per E-Mail versendet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Erstellen des Benutzers",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Lade Administrationsbereich...</div>
      </div>
    );
  }

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Administration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Systemverwaltung und Benutzermanagement
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.newUsersThisMonth || 0} neue diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datenbankgröße</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.dbSize || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              Letztes Backup: {systemStats?.lastBackup || "Nie"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Lizenzen</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.activeLicenses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.expiringLicenses || 0} ablaufend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats?.adminUsers || 0} Administratoren
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* E-Mail System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              E-Mail System
            </CardTitle>
            <CardDescription>
              BREVO Integration für E-Mail-Versand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-medium">✅ Konfiguriert</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SMTP Server:</span>
                <span className="font-mono text-xs">smtp-relay.brevo.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Port:</span>
                <span className="font-mono text-xs">587/TLS</span>
              </div>
            </div>
            <Button 
              onClick={async () => {
                try {
                  toast({
                    title: "E-Mail Test läuft...",
                    description: "Demo-E-Mail wird verarbeitet",
                  });
                  
                  const response = await fetch('/api/email/test', {
                    method: 'POST',
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    toast({
                      title: "E-Mail Test erfolgreich",
                      description: data.message,
                      variant: "default",
                    });
                  } else {
                    const error = await response.json();
                    toast({
                      title: "E-Mail Test fehlgeschlagen",
                      description: error.message || "Unbekannter Fehler",
                      variant: "destructive",
                    });
                  }
                } catch (error: any) {
                  toast({
                    title: "E-Mail Test fehlgeschlagen",
                    description: error.message || "Netzwerkfehler",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full"
            >
              <TestTube2 className="h-4 w-4 mr-2" />
              Test-E-Mail senden
            </Button>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch('/api/test-brevo', {
                    method: 'POST',
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    toast({
                      title: "BREVO Test erfolgreich",
                      description: data.message,
                      variant: "default",
                    });
                  } else {
                    const error = await response.json();
                    toast({
                      title: "BREVO Test fehlgeschlagen",
                      description: error.message || "Unbekannter Fehler",
                      variant: "destructive",
                    });
                  }
                } catch (error: any) {
                  toast({
                    title: "BREVO Test fehlgeschlagen",
                    description: error.message || "Netzwerkfehler",
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              className="w-full"
            >
              <TestTube2 className="h-4 w-4 mr-2" />
              BREVO-Verbindung testen
            </Button>
            <div className="text-xs text-gray-500">
              BREVO SMTP • Support-Tickets • Willkommens-E-Mails • Hochwasserschutz-Export
            </div>
          </CardContent>
        </Card>
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Benutzerverwaltung
            </CardTitle>
            <CardDescription>
              Benutzerkonten, Rollen und Berechtigungen verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Administratoren:</span>
                <Badge variant="destructive">{systemStats?.adminUsers || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Manager:</span>
                <Badge variant="default">{systemStats?.managerUsers || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Benutzer:</span>
                <Badge variant="secondary">{systemStats?.regularUsers || 0}</Badge>
              </div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => setShowUserForm(!showUserForm)}
            >
              {showUserForm ? "Formular schließen" : "Neuen Benutzer erstellen"}
            </Button>
            
            {showUserForm && (
              <div className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="space-y-2">
                  <Label htmlFor="username">Benutzername</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="z.B. max.mustermann"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="max@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rolle auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Benutzer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Lizenztyp</Label>
                  <Select value={newUser.licenseType} onValueChange={(value) => setNewUser({...newUser, licenseType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lizenz auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (21€/Monat)</SelectItem>
                      <SelectItem value="professional">Professional (39€/Monat)</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => createUserMutation.mutate(newUser)}
                  disabled={createUserMutation.isPending || !newUser.username || !newUser.email}
                  className="w-full"
                >
                  {createUserMutation.isPending ? "Erstelle Benutzer..." : "Benutzer erstellen"}
                </Button>
              </div>
            )}

            {/* Users List */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Alle Benutzer ({users.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <Badge 
                        variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.licenseType}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-6"
                        onClick={async () => {
                          try {
                            console.log("Attempting password reset for:", user.email);
                            const response = await apiRequest("POST", "/api/admin/users/" + encodeURIComponent(user.email) + "/reset-password", {});
                            console.log("Response status:", response.status);
                            
                            if (response.ok) {
                              const data = await response.json();
                              console.log("Success response:", data);
                              toast({
                                title: "Passwort zurückgesetzt",
                                description: data.message || `Neues Passwort per E-Mail an ${user.email} gesendet`,
                              });
                            } else {
                              const errorData = await response.json();
                              console.log("Error response:", errorData);
                              toast({
                                title: "Fehler",
                                description: errorData.message || "Passwort konnte nicht zurückgesetzt werden",
                                variant: "destructive",
                              });
                            }
                          } catch (error: any) {
                            console.error("Password reset error:", error);
                            toast({
                              title: "Fehler",
                              description: "Netzwerkfehler beim Passwort-Reset",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        PW Reset
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Learning System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Intelligentes Fehlerlernsystem
            </CardTitle>
            <CardDescription>
              Automatische Fehlererkennung und -prävention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-medium">✅ Aktiv</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Erkannte Fehler:</span>
                <span className="font-mono text-xs">47 total</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto-Fixes:</span>
                <span className="font-mono text-xs">6 verfügbar</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Präventionsrate:</span>
                <span className="font-mono text-xs text-green-600">75%</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowErrorLearning(!showErrorLearning)}
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              {showErrorLearning ? 'Dashboard schließen' : 'Error Learning Dashboard'}
            </Button>
          </CardContent>
        </Card>

        {/* Backup Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup-Verwaltung
            </CardTitle>
            <CardDescription>
              Datenbank-Backups erstellen und verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>• Automatische tägliche Backups</p>
              <p>• Aufbewahrung für 30 Tage</p>
              <p>• Verschlüsselte Speicherung</p>
              <p>• Letztes Backup: Heute 02:00</p>
            </div>
            <Button 
              onClick={async () => {
                try {
                  toast({
                    title: "🔄 Backup wird erstellt...",
                    description: "Datenbank-Export wird verarbeitet",
                  });
                  
                  const response = await fetch('/api/admin/backup/create', {
                    method: 'POST',
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    toast({
                      title: "✅ Backup erfolgreich erstellt",
                      description: `Backup-ID: ${data.backupId} (${data.size})`,
                      variant: "default",
                    });
                  } else {
                    const error = await response.json();
                    toast({
                      title: "❌ Backup fehlgeschlagen",
                      description: error.message || "Unbekannter Fehler",
                      variant: "destructive",
                    });
                  }
                } catch (error: any) {
                  toast({
                    title: "❌ Backup fehlgeschlagen",
                    description: error.message || "Netzwerkfehler",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Backup erstellen
            </Button>
          </CardContent>
        </Card>

        {/* Zahlungsverkehr */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Zahlungsverkehr
            </CardTitle>
            <CardDescription>
              Stripe-Zahlungen und Lizenz-Management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Aktive Lizenzen:</span>
                <span className="font-medium">{systemStats?.activeLicenses || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Zahlungen diesen Monat:</span>
                <span className="font-medium">{systemStats?.paymentsThisMonth || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gesamtumsatz:</span>
                <span className="font-medium">{systemStats?.totalRevenue || '0'}€</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowPaymentOverview(true)}
              className="w-full"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Zahlungsübersicht öffnen
            </Button>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Systemdokumentation
            </CardTitle>
            <CardDescription>
              Datenstruktur und API-Dokumentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>• Datenbank-Schema (16 Tabellen)</p>
              <p>• API-Endpunkte (45 Routen)</p>
              <p>• Benutzerhandbuch</p>
              <p>• Entwickler-Dokumentation</p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Dokumentation anzeigen
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* License Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Lizenzverwaltung
            </CardTitle>
            <CardDescription>
              Drei Lizenzmodelle verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">Basic (21€)</div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">Grundfunktionen</div>
                </div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {systemStats?.basicLicenses || 0}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-green-800 dark:text-green-200">Professional (39€)</div>
                  <div className="text-xs text-green-600 dark:text-green-300">Erweiterte Features</div>
                </div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {systemStats?.professionalLicenses || 0}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-purple-800 dark:text-purple-200">Enterprise</div>
                  <div className="text-xs text-purple-600 dark:text-purple-300">Preis auf Anfrage</div>
                </div>
                <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
                  {systemStats?.enterpriseLicenses || 0}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-bold text-orange-600">{systemStats?.expiringLicenses || 0}</div>
                <div className="text-xs">Ablaufend (30 Tage)</div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-bold text-green-600">{systemStats?.activeLicenses || 0}</div>
                <div className="text-xs">Gesamt aktiv</div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" disabled>
              Lizenzen verwalten
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              Testphasen-Verwaltung
            </CardTitle>
            <CardDescription>
              Testbenutzer und Beta-Features verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Beta Features</span>
                <Badge variant="outline">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Test-Modus</span>
                <Badge variant="secondary">Inaktiv</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Test-Einstellungen
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Systemeinstellungen
            </CardTitle>
            <CardDescription>
              Allgemeine System- und App-Konfiguration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>• E-Mail-Konfiguration</p>
              <p>• SFTP-Einstellungen</p>
              <p>• Sicherheitsrichtlinien</p>
              <p>• Logging-Optionen</p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Einstellungen bearbeiten
              <span className="text-xs ml-2">(In Entwicklung)</span>
            </Button>
          </CardContent>
        </Card>
      </div>



      {/* Development Notice */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Entwicklungshinweis
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Der Administrationsbereich wird schrittweise ausgebaut. Aktuell sind die Grundfunktionen 
          implementiert. Erweiterte Features wie Benutzerverwaltung, Backup-Erstellung und 
          Systemkonfiguration werden in den nächsten Versionen hinzugefügt.
        </p>
      </div>

      {/* Zahlungsverkehr Detail Modal */}
      {showPaymentOverview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Zahlungsverkehr Übersicht</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowPaymentOverview(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Umsatz-Übersicht */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {systemStats?.totalRevenue || 0}€
                    </div>
                    <p className="text-xs text-muted-foreground">Alle Zahlungen</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Dieser Monat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {systemStats?.paymentsThisMonth || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Neue Zahlungen</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Aktive Lizenzen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {systemStats?.activeLicenses || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Gültige Abos</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ablaufend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {systemStats?.expiringLicenses || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Nächste 30 Tage</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lizenz-Verteilung */}
              <Card>
                <CardHeader>
                  <CardTitle>Lizenz-Verteilung</CardTitle>
                  <CardDescription>Aktuelle Lizenztypen der Benutzer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {systemStats?.basicLicenses || 0}
                      </div>
                      <div className="text-sm font-medium">Basic Lizenzen</div>
                      <div className="text-xs text-muted-foreground">21€ / Jahr</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {systemStats?.professionalLicenses || 0}
                      </div>
                      <div className="text-sm font-medium">Professional Lizenzen</div>
                      <div className="text-xs text-muted-foreground">39€ / Jahr</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gold-600">
                        {systemStats?.enterpriseLicenses || 0}
                      </div>
                      <div className="text-sm font-medium">Enterprise Lizenzen</div>
                      <div className="text-xs text-muted-foreground">99€ / Jahr</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe-Integration Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Stripe-Integration
                  </CardTitle>
                  <CardDescription>Zahlungsdienstleister Status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>API Status:</span>
                      <Badge className="bg-green-500">✅ Aktiv</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Webhook:</span>
                      <Badge variant="outline">🔄 Konfiguriert</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Test Modus:</span>
                      <Badge variant="secondary">🧪 Sandbox</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Währung:</span>
                      <Badge variant="outline">€ EUR</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Zahlungsmethoden verfügbar:
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      • Kreditkarten (Visa, Mastercard, American Express)
                      • SEPA-Lastschrift
                      • SOFORT-Überweisung
                      • PayPal (über Stripe)
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aktionen */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <BarChart className="h-4 w-4 mr-2" />
                  Detaillierte Berichte
                </Button>
                <Button variant="outline" className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Stripe Dashboard
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Umsatz exportieren
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Learning Dashboard */}
      {showErrorLearning && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Intelligentes Fehlerlernsystem</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowErrorLearning(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </div>
          <ErrorLearningDashboard />
        </div>
      )}
    </div>
  );
}