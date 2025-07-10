import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ProfileSimple() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

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

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profil-Informationen</h2>
          <div className="space-y-4">
            <p><strong>Name:</strong> {(user as any)?.firstName} {(user as any)?.lastName}</p>
            <p><strong>E-Mail:</strong> {(user as any)?.email}</p>
            <p><strong>Rolle:</strong> {(user as any)?.role || "user"}</p>
            <p><strong>Mitglied seit:</strong> {new Date((user as any)?.createdAt || '').toLocaleDateString('de-DE')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}