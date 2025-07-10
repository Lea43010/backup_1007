import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePWA } from '@/hooks/usePWA'
import { useToast } from '@/hooks/use-toast'

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA()
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Show banner if app is installable and not dismissed
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
    if (isInstallable && !isInstalled && !isDismissed) {
      setShowBanner(true)
    }
  }, [isInstallable, isInstalled])

  const handleInstall = async () => {
    const success = await installApp()
    
    if (success) {
      toast({
        title: "App installiert!",
        description: "Bau-Structura ist jetzt auf Ihrem Gerät verfügbar.",
      })
      setShowBanner(false)
    } else {
      toast({
        title: "Installation fehlgeschlagen",
        description: "Die App konnte nicht installiert werden. Versuchen Sie es später erneut.",
        variant: "destructive"
      })
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show banner if already installed or dismissed
  if (!showBanner || isInstalled || dismissed) {
    return null
  }

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            Offline - Einige Funktionen sind eingeschränkt
          </div>
        </div>
      )}

      {/* Install Banner */}
      <Card className="fixed bottom-4 left-4 right-4 z-40 border-2 border-primary shadow-lg lg:left-auto lg:right-4 lg:w-96">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                App auf Startbildschirm hinzufügen
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Greifen Sie schnell auf Bau-Structura zu, ohne die URL eingeben zu müssen. Funktioniert auch offline!
              </p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Installieren
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  Später
                </Button>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export function PWAStatusIndicator() {
  const { isOnline, isInstalled } = usePWA()

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {isInstalled && (
        <div className="flex items-center gap-1">
          <Smartphone className="h-3 w-3" />
          <span>App installiert</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-600" />
        ) : (
          <WifiOff className="h-3 w-3 text-yellow-600" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  )
}