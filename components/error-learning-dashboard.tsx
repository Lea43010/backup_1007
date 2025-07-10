/**
 * Dashboard für das Fehlerlernsystem - Zeigt Statistiken und Patterns
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  Brain, 
  Bug, 
  Shield,
  BarChart3,
  Clock,
  Target
} from "lucide-react";

interface ErrorStats {
  totalErrors: number;
  recurringErrors: number;
  patterns: number;
  autoFixesAvailable: number;
  mostCommonErrorType: string;
  recentErrors: any[];
}

interface ErrorPattern {
  patternId: string;
  description: string;
  frequency: number;
  lastSeen: string;
  solutions: string[];
  preventionRules: string[];
  autoFixAvailable: boolean;
}

export function ErrorLearningDashboard() {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [patterns, setPatterns] = useState<ErrorPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrorData();
  }, []);

  const loadErrorData = async () => {
    try {
      // In einer echten Implementierung würden diese Daten von der API kommen
      const mockStats: ErrorStats = {
        totalErrors: 47,
        recurringErrors: 8,
        patterns: 12,
        autoFixesAvailable: 6,
        mostCommonErrorType: 'IMPORT',
        recentErrors: [
          { id: '20250709180845_LOGIC_apiRequest_Parameter_Rei', type: 'LOGIC', solved: true },
          { id: '2025-07-09_SYNTAX_MISSING_SEMICOLON', type: 'SYNTAX', solved: true },
          { id: '2025-07-09_IMPORT_MODULE_NOT_FOUND', type: 'IMPORT', solved: false },
          { id: '2025-07-09_CONFIG_ENV_MISSING', type: 'CONFIG', solved: true },
        ]
      };

      const mockPatterns: ErrorPattern[] = [
        {
          patternId: 'pattern_apirequest',
          description: 'LOGIC: apiRequest Parameter-Reihenfolge falsch',
          frequency: 1,
          lastSeen: '2025-07-09T18:08:45Z',
          solutions: [
            'Parameter-Reihenfolge korrigiert: apiRequest(url, method, data)',
            'TypeScript-Interface für Parameter-Validierung hinzugefügt'
          ],
          preventionRules: [
            'Unit-Tests für HTTP-Methoden-Korrektheit',
            'ESLint-Regel für Parameter-Reihenfolge'
          ],
          autoFixAvailable: true
        },
        {
          patternId: 'pattern_1',
          description: 'IMPORT: Module nicht gefunden Fehler',
          frequency: 12,
          lastSeen: '2025-07-09T10:30:00Z',
          solutions: ['npm install <module>', 'Pfad korrigieren'],
          preventionRules: ['Dependency Check vor Build'],
          autoFixAvailable: true
        },
        {
          patternId: 'pattern_2', 
          description: 'SYNTAX: Fehlende Semikolons in TypeScript',
          frequency: 8,
          lastSeen: '2025-01-14T16:45:00Z',
          solutions: ['ESLint Auto-Fix', 'Prettier Konfiguration'],
          preventionRules: ['Pre-commit Hook'],
          autoFixAvailable: true
        },
        {
          patternId: 'pattern_3',
          description: 'CONFIG: Environment Variablen fehlen',
          frequency: 6,
          lastSeen: '2025-07-09T09:15:00Z',
          solutions: ['.env Template erstellen', 'Validation hinzufügen'],
          preventionRules: ['Startup Check'],
          autoFixAvailable: false
        }
      ];

      setStats(mockStats);
      setPatterns(mockPatterns);
    } catch (error) {
      console.error('Fehler beim Laden der Error-Learning Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const getErrorReductionPercentage = () => {
    if (!stats) return 0;
    const autoFixed = stats.autoFixesAvailable;
    const total = stats.recurringErrors;
    return total > 0 ? Math.round((autoFixed / total) * 100) : 0;
  };

  const getErrorTypeColor = (type: string) => {
    const colors = {
      'SYNTAX': 'bg-yellow-500',
      'IMPORT': 'bg-blue-500', 
      'CONFIG': 'bg-purple-500',
      'API': 'bg-green-500',
      'DATA': 'bg-orange-500',
      'LOGIC': 'bg-red-500',
      'RUNTIME': 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Intelligentes Fehlerlernsystem</h1>
        <Badge variant="outline" className="bg-green-50">
          {stats?.autoFixesAvailable || 0} Auto-Fixes verfügbar
        </Badge>
      </div>

      {/* Statistiken Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Fehler</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalErrors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.recurringErrors || 0} wiederkehrend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erkannte Muster</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.patterns || 0}</div>
            <p className="text-xs text-muted-foreground">
              Fehlerpatterns identifiziert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Fixes</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.autoFixesAvailable || 0}</div>
            <p className="text-xs text-muted-foreground">
              Automatische Korrekturen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effizienz</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getErrorReductionPercentage()}%</div>
            <p className="text-xs text-muted-foreground">
              Fehlerreduktion durch Automatisierung
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Fehlerpatterns</TabsTrigger>
          <TabsTrigger value="recent">Aktuelle Fehler</TabsTrigger>
          <TabsTrigger value="prevention">Prävention</TabsTrigger>
          <TabsTrigger value="knowledge">Wissensbasis</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4">
            {patterns.map((pattern) => (
              <Card key={pattern.patternId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pattern.description}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{pattern.frequency}x</Badge>
                      {pattern.autoFixAvailable && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Auto-Fix
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Letzte Sichtung: {new Date(pattern.lastSeen).toLocaleDateString('de-DE')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Bekannte Lösungen:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {pattern.solutions.map((solution, idx) => (
                          <li key={idx}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Präventionsmaßnahmen:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {pattern.preventionRules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>

                    {pattern.autoFixAvailable && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Automatische Korrektur verfügbar. Dieser Fehlertyp kann automatisch behoben werden.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Letzte Fehler</CardTitle>
              <CardDescription>
                Die neuesten erfassten Fehler und ihr Bearbeitungsstatus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentErrors.map((error, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getErrorTypeColor(error.type)}`}></div>
                      <div>
                        <p className="font-medium">{error.id}</p>
                        <p className="text-sm text-gray-500">Typ: {error.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {error.solved ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Gelöst
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Offen
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Präventionsmaßnahmen</CardTitle>
              <CardDescription>
                Aktive Maßnahmen zur Fehlervermeidung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Dependency Validation</span>
                  <Badge className="bg-green-500">Aktiv</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pre-Commit Hooks</span>
                  <Badge className="bg-green-500">Aktiv</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Environment Checks</span>
                  <Badge className="bg-green-500">Aktiv</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-Lint auf Save</span>
                  <Badge className="bg-yellow-500">Teilweise</Badge>
                </div>
                
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Fehlerreduktion Fortschritt</h4>
                  <Progress value={getErrorReductionPercentage()} className="w-full" />
                  <p className="text-sm text-gray-500 mt-1">
                    {getErrorReductionPercentage()}% der wiederkehrenden Fehler können automatisch behoben werden
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wissensbasis</CardTitle>
              <CardDescription>
                Gesammelte Erkenntnisse und Best Practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingDown className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Häufigster Fehlertyp:</strong> {stats?.mostCommonErrorType} - 
                    Empfehlung: Dependency Management und Import-Validierung verstärken
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Import-Fehler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Immer relative Pfade verwenden</li>
                        <li>• Package.json Abhängigkeiten prüfen</li>
                        <li>• TypeScript Path Mapping beachten</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Syntax-Fehler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• ESLint und Prettier aktivieren</li>
                        <li>• Editor-Integration nutzen</li>
                        <li>• Auto-Format bei Speicherung</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={loadErrorData} className="w-full">
                  <Brain className="h-4 w-4 mr-2" />
                  Wissensbasis aktualisieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}