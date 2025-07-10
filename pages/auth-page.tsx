import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth.tsx";
import { useLocation } from "wouter";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refetch } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  
  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    privacyConsent: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Anmeldung fehlgeschlagen");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Anmeldung erfolgreich",
        description: "Sie wurden erfolgreich angemeldet.",
      });
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message || "Bitte überprüfen Sie Ihre Eingaben.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      privacyConsent: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registrierung erfolgreich",
        description: "Ihr Konto wurde erfolgreich erstellt.",
      });
      refetch();
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message || "Bitte überprüfen Sie Ihre Eingaben.",
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset-Link gesendet",
        description: "Falls die E-Mail-Adresse registriert ist, wurde ein Reset-Link gesendet.",
      });
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setShowResetForm(true);
      }
      setShowForgotPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Passwort-Reset fehlgeschlagen.",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; newPassword: string; resetToken: string }) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Passwort zurückgesetzt",
        description: "Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.",
      });
      setShowResetForm(false);
      setResetToken("");
      setNewPassword("");
      setForgotPasswordEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Passwort-Reset fehlgeschlagen.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.password || !registerForm.firstName || !registerForm.lastName) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
      return;
    }
    if (!registerForm.privacyConsent) {
      toast({
        title: "DSGVO-Einverständnis erforderlich",
        description: "Sie müssen der Datenschutzerklärung zustimmen, um sich zu registrieren.",
        variant: "destructive",
      });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }
    if (registerForm.password.length < 6) {
      toast({
        title: "Fehler",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({
      email: registerForm.email,
      password: registerForm.password,
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      privacyConsent: registerForm.privacyConsent,
    });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(forgotPasswordEmail);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Das neue Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate({
      email: forgotPasswordEmail,
      newPassword,
      resetToken,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full overflow-hidden mx-auto mb-4 sm:mb-6 p-1 shadow-2xl">
            <img
              src="/logo.png"
              alt="Bau-Structura"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                console.log('Auth Logo loading failed, using fallback');
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">BS</div>';
                }
              }}
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Bau-Structura
            </span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">Mobile Baustellendokumentation</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Professionelle Tiefbau-Verwaltung</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white text-gray-300">Anmelden</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white text-gray-300">Registrieren</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="shadow-2xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-xl sm:text-2xl text-white">Anmelden</CardTitle>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  Melden Sie sich mit Ihren Zugangsdaten an
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-200">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ihre@email.de"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-200">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ihr Passwort"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-600/50 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Anmelden...
                      </>
                    ) : (
                      "Anmelden"
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-orange-400 hover:text-orange-300"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Passwort vergessen?
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="shadow-2xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Registrieren
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  Erstellen Sie ein neues Benutzerkonto
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-200 text-sm">Vorname</Label>
                      <Input
                        id="firstName"
                        placeholder="Max"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 h-10 sm:h-auto"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-200 text-sm">Nachname</Label>
                      <Input
                        id="lastName"
                        placeholder="Mustermann"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 h-10 sm:h-auto"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-200">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="ihre@email.de"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-200">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mindestens 6 Zeichen"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-600/50 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-200">Passwort bestätigen</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Passwort wiederholen"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* DSGVO-Einverständnis */}
                  <div className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <Checkbox
                      id="privacy-consent"
                      checked={registerForm.privacyConsent}
                      onCheckedChange={(checked) => 
                        setRegisterForm(prev => ({ ...prev, privacyConsent: !!checked }))
                      }
                      className="mt-0.5 sm:mt-1 border-gray-400 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 w-4 h-4 sm:w-5 sm:h-5"
                    />
                    <div className="grid gap-1 sm:gap-1.5 leading-none">
                      <Label
                        htmlFor="privacy-consent"
                        className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-200"
                      >
                        Datenschutzerklärung
                      </Label>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Ich stimme der{" "}
                        <button
                          type="button"
                          className="text-orange-400 hover:text-orange-300 underline"
                          onClick={() => window.open('/datenschutz', '_blank')}
                        >
                          Datenschutzerklärung
                        </button>
                        {" "}zu und willige ein, dass meine personenbezogenen Daten gemäß DSGVO verarbeitet werden.*
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={registerMutation.isPending || !registerForm.privacyConsent}
                  >
                    {registerMutation.isPending ? "Registrieren..." : "Registrieren"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-2 sm:mx-0 border border-gray-700 bg-gray-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="h-5 w-5" />
                Passwort vergessen
              </CardTitle>
              <CardDescription className="text-gray-300">
                Geben Sie Ihre E-Mail-Adresse ein, um ein neues Passwort anzufordern
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-gray-200">E-Mail-Adresse</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="ihre@email.de"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-600 bg-gray-700/50 text-gray-200 hover:bg-gray-600/50"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail("");
                    }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? "Senden..." : "Reset-Link senden"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Password Dialog */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-2 sm:mx-0 border border-gray-700 bg-gray-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5" />
                Neues Passwort setzen
              </CardTitle>
              <CardDescription className="text-gray-300">
                Geben Sie Ihr neues Passwort ein (Demo: Token automatisch gesetzt)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-200">Neues Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Mindestens 6 Zeichen"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-600 bg-gray-700/50 text-gray-200 hover:bg-gray-600/50"
                    onClick={() => {
                      setShowResetForm(false);
                      setResetToken("");
                      setNewPassword("");
                      setForgotPasswordEmail("");
                    }}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? "Speichern..." : "Passwort ändern"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}