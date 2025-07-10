import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Calendar, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentSuccess() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment intent from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    
    if (paymentIntent) {
      // Fetch payment details from Stripe
      fetch(`/api/payment-status?payment_intent=${paymentIntent}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setPaymentDetails(data);
        })
        .catch(console.error);
    }
  }, []);

  const getLicenseDetails = (licenseType: string) => {
    const details = {
      basic: { name: "Basic", price: 21, color: "bg-blue-500" },
      professional: { name: "Professional", price: 39, color: "bg-purple-500" },
      enterprise: { name: "Enterprise", price: 99, color: "bg-gold-500" }
    };
    return details[licenseType as keyof typeof details] || details.basic;
  };

  const license = user?.licenseType ? getLicenseDetails(user.licenseType) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Zahlung erfolgreich!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ihre Lizenz wurde erfolgreich aktiviert
          </p>
        </div>

        <div className="space-y-6">
          {/* License Information */}
          {license && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ihre aktive Lizenz</span>
                  <Badge className={license.color}>
                    {license.name}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Lizenz erfolgreich aktiviert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span>Betrag: {license.price}€</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Gültig für: 12 Monate</span>
                  </div>
                </div>
                
                {user?.licenseExpiresAt && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Läuft ab am: {new Date(user.licenseExpiresAt).toLocaleDateString('de-DE')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          {paymentDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Zahlungsdetails</CardTitle>
                <CardDescription>
                  Transaktionsinformationen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Zahlungs-ID:</span>
                  <span className="font-mono">{paymentDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600">Erfolgreich</span>
                </div>
                <div className="flex justify-between">
                  <span>Datum:</span>
                  <span>{new Date().toLocaleDateString('de-DE')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle>Was kommt als nächstes?</CardTitle>
              <CardDescription>
                Ihre neuen Features sind sofort verfügbar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Vollständiger Zugriff auf alle Features Ihrer Lizenz
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Projektmanagement ohne Einschränkungen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Support und Updates für 12 Monate
                </li>
              </ul>
              
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="w-full"
              >
                Zur Projektverwaltung
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}