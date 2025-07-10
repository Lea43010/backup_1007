import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const licenseDetails = {
  basic: {
    name: "Basic",
    price: 21,
    features: [
      "Bis zu 5 Projekte",
      "Grundlegende Verwaltung",
      "Standard Support"
    ]
  },
  professional: {
    name: "Professional", 
    price: 39,
    features: [
      "Unbegrenzte Projekte",
      "Erweiterte Features",
      "GPS & Karten-Integration",
      "Priority Support"
    ]
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    features: [
      "Alle Professional Features",
      "Hochwasserschutz-Modul",
      "AI-Integration",
      "24/7 Premium Support",
      "Custom Branding"
    ]
  }
};

const CheckoutForm = ({ licenseType }: { licenseType: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-success",
      },
    });

    if (error) {
      toast({
        title: "Zahlung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Zahlung erfolgreich",
        description: "Ihre Lizenz wurde aktiviert!",
      });
      setLocation("/dashboard");
    }
    setIsLoading(false);
  };

  const details = licenseDetails[licenseType as keyof typeof licenseDetails];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lizenz kaufen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sichere Zahlung mit Stripe
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* License Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{details.name} Lizenz</span>
                <Badge variant="secondary">{details.price}€</Badge>
              </CardTitle>
              <CardDescription>
                Einmalige Zahlung für 12 Monate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Zahlungsinformationen
              </CardTitle>
              <CardDescription>
                Alle Zahlungen sind SSL-verschlüsselt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <PaymentElement />
                <Button 
                  type="submit" 
                  disabled={!stripe || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      Jetzt bezahlen - {details.price}€
                    </>
                  )}
                </Button>
              </form>
              <div className="text-xs text-gray-500 mt-4 text-center">
                Powered by Stripe • Sicher und verschlüsselt
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [licenseType, setLicenseType] = useState("basic");

  useEffect(() => {
    // Get license type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('license') || 'basic';
    setLicenseType(type);

    // Create PaymentIntent as soon as the page loads
    apiRequest("/api/create-payment-intent", "POST", { 
      licenseType: type,
      amount: licenseDetails[type as keyof typeof licenseDetails]?.price || 21
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Payment intent creation failed:", error);
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Zahlung wird vorbereitet...</p>
        </div>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm licenseType={licenseType} />
    </Elements>
  );
}