import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-green-600" />
              Datenschutzerklärung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Verantwortlicher</h2>
              <p className="text-gray-700">
                Verantwortlicher für die Datenverarbeitung im Sinne der DSGVO ist:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <p><strong>Bau-Structura</strong><br />
                Sachverständigenbüro für Tiefbau<br />
                E-Mail: support@bau-structura.de</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
              <p className="text-gray-700 mb-3">
                Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung 
                unserer Dienstleistungen erforderlich ist:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Registrierungsdaten:</strong> Vorname, Nachname, E-Mail-Adresse</li>
                <li><strong>Projektdaten:</strong> Baustelleninformationen, GPS-Koordinaten, Dokumentationen</li>
                <li><strong>Kommunikationsdaten:</strong> Support-Anfragen, E-Mail-Korrespondenz</li>
                <li><strong>Technische Daten:</strong> IP-Adresse, Session-Daten für die Anmeldung</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Rechtsgrundlage der Verarbeitung</h2>
              <p className="text-gray-700">
                Die Verarbeitung erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
                <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung bei der Registrierung</li>
                <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung und vorvertragliche Maßnahmen</li>
                <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen (technische Sicherheit)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Speicherdauer</h2>
              <p className="text-gray-700">
                Personenbezogene Daten werden nur solange gespeichert, wie es für die Zweckerfüllung 
                erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Ihre Rechte</h2>
              <p className="text-gray-700 mb-3">
                Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
                <li>Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Datensicherheit</h2>
              <p className="text-gray-700">
                Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust, 
                Missbrauch und unbefugtem Zugriff zu schützen. Dazu gehören Verschlüsselung, 
                sichere Datenübertragung und regelmäßige Sicherheitsupdates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Kontakt</h2>
              <p className="text-gray-700">
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich an:
              </p>
              <div className="bg-green-50 p-4 rounded-lg mt-2">
                <p><strong>E-Mail:</strong> support@bau-structura.de<br />
                <strong>Betreff:</strong> Datenschutz-Anfrage</p>
              </div>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">8. Beschwerderecht</h2>
              <p className="text-gray-700">
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die 
                Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
              </p>
            </section>

            <div className="text-sm text-gray-500 pt-6 border-t">
              <p>Stand: Juli 2025</p>
              <p>Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}