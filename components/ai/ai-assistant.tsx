import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { apiRequest } from "../../lib/queryClient";
import { Sparkles, MessageSquare, ShieldCheck, AlertTriangle, FileText, Brain, HelpCircle, BookOpen, Settings, Database, Code } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface RiskAssessmentData {
  riskLevel: "niedrig" | "mittel" | "hoch";
  riskFactors: string[];
  recommendations: string[];
  score: number;
  aiGenerated: boolean;
}

interface ProjectDescriptionData {
  description: string;
  aiGenerated: boolean;
}

interface AIAssistantProps {
  projectId?: number;
  projectData?: {
    name?: string;
    description?: string;
    location?: string;
    budget?: number;
    status?: string;
  };
}

export function AIAssistant({ projectId, projectData }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'description' | 'risk'>('chat');
  const [formData, setFormData] = useState({
    name: projectData?.name || '',
    location: projectData?.location || '',
    budget: projectData?.budget?.toString() || '',
    category: '',
    question: '',
  });
  const { toast } = useToast();

  const generateDescriptionMutation = useMutation<ProjectDescriptionData, Error, any>({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✨ KI-Beschreibung generiert",
        description: "Die Projektbeschreibung wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      console.error("AI description error:", error);
      toast({
        title: "Fehler",
        description: "KI-Beschreibung konnte nicht generiert werden.",
        variant: "destructive",
      });
    },
  });

  const riskAssessmentMutation = useMutation<RiskAssessmentData, Error, any>({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/ai/risk-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "⚠️ Risikobewertung erstellt",
        description: `Risikostufe: ${data.riskLevel}`,
      });
    },
    onError: (error) => {
      console.error("AI risk assessment error:", error);
      toast({
        title: "Fehler",
        description: "Risikobewertung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  const chatMutation = useMutation<{ answer: string; aiGenerated: boolean; type: 'project' | 'help' | 'documentation' }, Error, any>({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/ai/project-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: data.question,
          projectContext: projectData,
          projectId,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🤖 KI-Antwort erhalten",
        description: "Ihr Experten-Rat ist verfügbar.",
      });
    },
    onError: (error) => {
      console.error("AI chat error:", error);
      toast({
        title: "Fehler",
        description: "KI-Beratung ist momentan nicht verfügbar.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateDescription = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Projektname erforderlich",
        description: "Bitte geben Sie einen Projektnamen ein.",
        variant: "destructive",
      });
      return;
    }

    generateDescriptionMutation.mutate({
      name: formData.name,
      location: formData.location,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      category: formData.category,
    });
  };

  const handleRiskAssessment = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Projektname erforderlich",
        description: "Bitte geben Sie einen Projektnamen ein.",
        variant: "destructive",
      });
      return;
    }

    riskAssessmentMutation.mutate({
      name: formData.name,
      location: formData.location,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      description: projectData?.description,
    });
  };

  const handleChat = () => {
    if (!formData.question.trim()) {
      toast({
        title: "Frage erforderlich",
        description: "Bitte stellen Sie eine Frage.",
        variant: "destructive",
      });
      return;
    }

    chatMutation.mutate({ question: formData.question });
  };

  const handleQuickHelp = (question: string) => {
    setFormData(prev => ({ ...prev, question }));
    chatMutation.mutate({ question });
  };

  return (
    <div className="space-y-4">
      {/* EU AI Act Compliance Badge */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-700 dark:text-blue-300">
          EU AI Act konform • Vollständige Transparenz • Alle Antworten sind KI-generiert
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Button
          variant={activeTab === 'chat' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('chat')}
          className="flex-1"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Hilfe & Chat
        </Button>
        <Button
          variant={activeTab === 'description' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('description')}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Beschreibung
        </Button>
        <Button
          variant={activeTab === 'risk' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('risk')}
          className="flex-1"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Risiko
        </Button>
      </div>

      {/* Project Description Generator */}
      {activeTab === 'description' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              KI-Projektbeschreibung
            </CardTitle>
            <CardDescription>
              Automatische Generierung professioneller Projektbeschreibungen für Tiefbau-Projekte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Projektname *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="z.B. Bahnhofsplatz Sanierung"
                />
              </div>
              <div>
                <Label htmlFor="location">Standort</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="z.B. München, Bayern"
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="z.B. 250000"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="z.B. Straßenbau, Kanal"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateDescription}
              disabled={generateDescriptionMutation.isPending}
              className="w-full"
            >
              {generateDescriptionMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  KI generiert Beschreibung...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Beschreibung generieren
                </>
              )}
            </Button>

            {generateDescriptionMutation.data && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">KI-generiert</Badge>
                  <span className="text-sm text-green-700 dark:text-green-300">
                    OpenAI GPT-4o
                  </span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  {generateDescriptionMutation.data.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {activeTab === 'risk' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              KI-Risikobewertung
            </CardTitle>
            <CardDescription>
              Intelligente Analyse von Projektrisiken basierend auf Erfahrungswerten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="risk-name">Projektname *</Label>
                <Input
                  id="risk-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Projektname eingeben"
                />
              </div>
              <div>
                <Label htmlFor="risk-location">Standort</Label>
                <Input
                  id="risk-location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Projektstandort"
                />
              </div>
            </div>

            <Button
              onClick={handleRiskAssessment}
              disabled={riskAssessmentMutation.isPending}
              className="w-full"
            >
              {riskAssessmentMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  KI analysiert Risiken...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Risikobewertung erstellen
                </>
              )}
            </Button>

            {riskAssessmentMutation.data && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">KI-generiert</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    OpenAI GPT-4o Risikobewertung
                  </span>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Risikostufe:</span>
                    <Badge 
                      variant={
                        riskAssessmentMutation.data.riskLevel === 'hoch' ? 'destructive' :
                        riskAssessmentMutation.data.riskLevel === 'mittel' ? 'default' : 
                        'secondary'
                      }
                    >
                      {riskAssessmentMutation.data.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-sm">
                      ({riskAssessmentMutation.data.score}/10)
                    </span>
                  </div>
                  
                  {riskAssessmentMutation.data.riskFactors.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-semibold mb-2">Identifizierte Risiken:</h4>
                      <ul className="text-sm space-y-1">
                        {riskAssessmentMutation.data.riskFactors.map((factor: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-600">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {riskAssessmentMutation.data.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Empfehlungen:</h4>
                      <ul className="text-sm space-y-1">
                        {riskAssessmentMutation.data.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Chat */}
      {activeTab === 'chat' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              KI-Assistent & Hilfe-Center
            </CardTitle>
            <CardDescription>
              Stellen Sie Fragen zu Projekten oder fordern Sie technische Hilfe an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Help Buttons */}
            <div className="space-y-3">
              <Label>Schnelle Hilfe</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickHelp("Wie funktioniert die Kamera-Integration?")}
                  className="justify-start"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Kamera-Integration
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickHelp("Zeige mir die API-Dokumentation")}
                  className="justify-start"
                >
                  <Code className="h-4 w-4 mr-2" />
                  API-Dokumentation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickHelp("Erkläre das Hochwasserschutz-Modul")}
                  className="justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Hochwasserschutz
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickHelp("Wie richte ich SFTP ein?")}
                  className="justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  SFTP-Setup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickHelp("Deployment-Anleitung anzeigen")}
                  className="justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Deployment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickHelp("PWA-Installation auf Mobile")}
                  className="justify-start"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  PWA-Installation
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="question">Eigene Frage stellen</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                placeholder="z.B. Welche Genehmigungen benötige ich für dieses Projekt? oder Wie funktioniert Feature X?"
                rows={3}
              />
            </div>

            <Button
              onClick={handleChat}
              disabled={chatMutation.isPending}
              className="w-full"
            >
              {chatMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  KI denkt nach...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Frage stellen
                </>
              )}
            </Button>

            {chatMutation.data && (
              <div className={`mt-4 p-4 rounded-lg border ${
                chatMutation.data.type === 'help' 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : chatMutation.data.type === 'documentation'
                  ? 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'
                  : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {chatMutation.data.type === 'help' ? '🛟 Hilfe-Assistent'
                      : chatMutation.data.type === 'documentation' ? '📚 Tech-Dokumentation'
                      : '🤖 Projekt-Experte'}
                  </Badge>
                  <span className={`text-sm ${
                    chatMutation.data.type === 'help' 
                      ? 'text-green-700 dark:text-green-300'
                      : chatMutation.data.type === 'documentation'
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {chatMutation.data.type === 'help' 
                      ? 'Benutzerführung (GPT-4o)'
                      : chatMutation.data.type === 'documentation'
                      ? 'Technische Dokumentation (GPT-4o)'
                      : 'Tiefbau-Experte (GPT-4o)'}
                  </span>
                </div>
                <p className={`text-sm whitespace-pre-wrap ${
                  chatMutation.data.type === 'help' 
                    ? 'text-green-800 dark:text-green-200'
                    : chatMutation.data.type === 'documentation'
                    ? 'text-purple-800 dark:text-purple-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {chatMutation.data.answer}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}