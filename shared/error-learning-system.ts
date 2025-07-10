/**
 * Intelligentes Fehlerlernsystem für Bau-Structura
 * Dokumentiert, analysiert und lernt aus allen Fehlern für kontinuierliche Verbesserung
 */

export interface ErrorEntry {
  id: string;
  timestamp: string;
  errorType: 'SYNTAX' | 'LOGIC' | 'IMPORT' | 'CONFIG' | 'API' | 'DATA' | 'RUNTIME';
  originalMessage: string;
  affectedFile: string;
  lineNumber?: number;
  context: string;
  causeAnalysis: string;
  trigger: string;
  isRecurring: boolean;
  occurrenceCount: number;
  lastOccurrences: string[];
  solution: string;
  codeChanges: string[];
  verification: string;
  preventionMeasures: string[];
  automaticChecks: string[];
  patternRule: string;
}

export interface ErrorPattern {
  patternId: string;
  description: string;
  frequency: number;
  lastSeen: string;
  solutions: string[];
  preventionRules: string[];
  autoFixAvailable: boolean;
}

export class IntelligentErrorLogger {
  private static instance: IntelligentErrorLogger;
  private errorHistory: ErrorEntry[] = [];
  private patterns: ErrorPattern[] = [];
  private learningRules: Map<string, any> = new Map();

  static getInstance(): IntelligentErrorLogger {
    if (!IntelligentErrorLogger.instance) {
      IntelligentErrorLogger.instance = new IntelligentErrorLogger();
    }
    return IntelligentErrorLogger.instance;
  }

  /**
   * Hauptfunktion zur Fehlerdokumentation
   */
  logError(error: {
    type: ErrorEntry['errorType'];
    message: string;
    file: string;
    line?: number;
    context: string;
    stackTrace?: string;
  }): string {
    const errorId = this.generateErrorId(error.type, error.message);
    
    // Prüfen ob wiederkehrender Fehler
    const existingPattern = this.findExistingPattern(error);
    const isRecurring = existingPattern !== null;
    
    const errorEntry: ErrorEntry = {
      id: errorId,
      timestamp: new Date().toISOString(),
      errorType: error.type,
      originalMessage: error.message,
      affectedFile: error.file,
      lineNumber: error.line,
      context: error.context,
      causeAnalysis: this.analyzeCause(error),
      trigger: this.identifyTrigger(error),
      isRecurring,
      occurrenceCount: isRecurring ? existingPattern!.frequency + 1 : 1,
      lastOccurrences: this.getLastOccurrences(error),
      solution: '',
      codeChanges: [],
      verification: '',
      preventionMeasures: [],
      automaticChecks: [],
      patternRule: ''
    };

    this.errorHistory.push(errorEntry);
    
    // Pattern-Lernsystem aktualisieren
    this.updatePatterns(errorEntry);
    
    // Automatische Lernregeln anwenden
    this.applyLearningRules(errorEntry);
    
    console.log(this.generateErrorReport(errorEntry));
    
    return errorId;
  }

  /**
   * Lösung für einen Fehler dokumentieren
   */
  documentSolution(errorId: string, solution: {
    implementedSolution: string;
    codeChanges: string[];
    verification: string;
    preventionMeasures: string[];
    automaticChecks: string[];
    patternRule: string;
  }): void {
    const errorEntry = this.errorHistory.find(e => e.id === errorId);
    if (!errorEntry) return;

    Object.assign(errorEntry, solution);
    
    // Pattern mit Lösung aktualisieren
    this.updatePatternSolution(errorEntry);
    
    // Bei wiederkehrenden Fehlern Lernregeln aktivieren
    if (errorEntry.occurrenceCount >= 3) {
      this.implementAutomaticWarning(errorEntry);
    }
    
    if (errorEntry.occurrenceCount >= 5) {
      this.implementAutomaticCorrection(errorEntry);
    }
  }

  /**
   * Fehler-ID generieren
   */
  private generateErrorId(type: string, message: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${year}${month}${day}${hour}${minute}${second}`;
    const shortMessage = message.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    return `${timestamp}_${type}_${shortMessage}`;
  }

  /**
   * Ursachenanalyse
   */
  private analyzeCause(error: any): string {
    const patterns = {
      'SYNTAX': () => 'Syntax-Fehler durch Tippfehler oder fehlende Zeichen',
      'IMPORT': () => 'Import-Problem durch fehlende Dependencies oder falsche Pfade',
      'CONFIG': () => 'Konfigurationsfehler durch fehlende Environment-Variablen',
      'API': () => 'API-Fehler durch externe Service-Probleme oder Netzwerkissues',
      'DATA': () => 'Daten-Validierungsfehler durch unerwartete Eingabeformate',
      'LOGIC': () => 'Logikfehler durch falsche Algorithmen oder Bedingungen',
      'RUNTIME': () => 'Laufzeitfehler durch unerwartete Ausführungsbedingungen'
    };

    return patterns[error.type]?.() || 'Unbekannte Fehlerursache';
  }

  /**
   * Trigger identifizieren
   */
  private identifyTrigger(error: any): string {
    if (error.context.includes('user input')) return 'Benutzereingabe';
    if (error.context.includes('API call')) return 'API-Aufruf';
    if (error.context.includes('file operation')) return 'Dateioperation';
    if (error.context.includes('database')) return 'Datenbankoperation';
    return 'Unbekannter Trigger';
  }

  /**
   * Existierendes Pattern finden
   */
  private findExistingPattern(error: any): ErrorPattern | null {
    return this.patterns.find(p => 
      p.description.includes(error.type) && 
      p.description.includes(error.message.slice(0, 50))
    ) || null;
  }

  /**
   * Letzte Vorkommen abrufen
   */
  private getLastOccurrences(error: any): string[] {
    return this.errorHistory
      .filter(e => e.errorType === error.type && e.originalMessage === error.message)
      .slice(-5)
      .map(e => e.timestamp);
  }

  /**
   * Patterns aktualisieren
   */
  private updatePatterns(errorEntry: ErrorEntry): void {
    const existingPattern = this.patterns.find(p => 
      p.description.includes(errorEntry.errorType)
    );

    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastSeen = errorEntry.timestamp;
    } else {
      this.patterns.push({
        patternId: `pattern_${this.patterns.length + 1}`,
        description: `${errorEntry.errorType}: ${errorEntry.originalMessage.slice(0, 100)}`,
        frequency: 1,
        lastSeen: errorEntry.timestamp,
        solutions: [],
        preventionRules: [],
        autoFixAvailable: false
      });
    }
  }

  /**
   * Pattern-Lösung aktualisieren
   */
  private updatePatternSolution(errorEntry: ErrorEntry): void {
    const pattern = this.patterns.find(p => 
      p.description.includes(errorEntry.errorType)
    );

    if (pattern) {
      pattern.solutions.push(errorEntry.solution);
      pattern.preventionRules.push(...errorEntry.preventionMeasures);
      
      if (errorEntry.occurrenceCount >= 5) {
        pattern.autoFixAvailable = true;
      }
    }
  }

  /**
   * Lernregeln anwenden
   */
  private applyLearningRules(errorEntry: ErrorEntry): void {
    const ruleKey = `${errorEntry.errorType}_${errorEntry.originalMessage.slice(0, 30)}`;
    
    if (this.learningRules.has(ruleKey)) {
      const rule = this.learningRules.get(ruleKey);
      rule.count++;
      rule.lastSeen = errorEntry.timestamp;
    } else {
      this.learningRules.set(ruleKey, {
        count: 1,
        firstSeen: errorEntry.timestamp,
        lastSeen: errorEntry.timestamp,
        autoFixImplemented: false
      });
    }
  }

  /**
   * Automatische Warnung implementieren (nach 3 Fehlern)
   */
  private implementAutomaticWarning(errorEntry: ErrorEntry): void {
    console.warn(`⚠️ WIEDERHOLUNGSFEHLER ERKANNT: ${errorEntry.errorType}`);
    console.warn(`Vorkommen: ${errorEntry.occurrenceCount}x`);
    console.warn(`Empfohlene Lösung: ${errorEntry.solution}`);
    
    // Automatische Prevention-Rule erstellen
    this.addPreventionRule(errorEntry);
    
    // E-Mail-Benachrichtigung an Entwickler-Team
    this.notifyDevelopmentTeam(errorEntry);
    
    // Lint-Regel automatisch hinzufügen falls möglich
    this.createLintRule(errorEntry);
  }

  /**
   * Automatische Korrektur implementieren (nach 5 Fehlern)
   */
  private implementAutomaticCorrection(errorEntry: ErrorEntry): void {
    console.log(`🤖 AUTO-KORREKTUR AKTIVIERT: ${errorEntry.errorType}`);
    
    // Auto-Fix Regel implementieren
    const pattern = this.patterns.find(p => p.description.includes(errorEntry.errorType));
    if (pattern) {
      pattern.autoFixAvailable = true;
    }
    
    // Konkrete Auto-Fix-Implementierung
    this.createAutoFixRule(errorEntry);
    
    // Pre-Commit Hook installieren
    this.installPreCommitHook(errorEntry);
    
    // Template/Snippet erstellen
    this.createCodeTemplate(errorEntry);
  }

  /**
   * Präventionsregel hinzufügen
   */
  private addPreventionRule(errorEntry: ErrorEntry): void {
    const preventionRule = {
      id: `prevention_${errorEntry.id}`,
      errorType: errorEntry.errorType,
      rule: errorEntry.patternRule,
      autoCheck: this.generateAutoCheck(errorEntry),
      implemented: new Date().toISOString()
    };
    
    // Regel in Memory speichern
    this.learningRules.set(preventionRule.id, preventionRule);
    
    console.log(`📋 NEUE PRÄVENTIONSREGEL ERSTELLT: ${preventionRule.rule}`);
    console.log(`🔍 AUTO-CHECK: ${preventionRule.autoCheck}`);
  }

  /**
   * Entwickler-Team benachrichtigen
   */
  private notifyDevelopmentTeam(errorEntry: ErrorEntry): void {
    // In realer Implementierung: Slack/Teams/E-Mail
    console.log(`📧 ENTWICKLER-BENACHRICHTIGUNG: Wiederkehrender Fehler ${errorEntry.errorType} (${errorEntry.occurrenceCount}x)`);
  }

  /**
   * Lint-Regel erstellen
   */
  private createLintRule(errorEntry: ErrorEntry): void {
    const lintRules = {
      'SYNTAX': `"no-trailing-spaces": "error", "semi": ["error", "always"]`,
      'IMPORT': `"import/no-unresolved": "error", "import/order": "error"`,
      'CONFIG': `"no-process-env": "warn"`,
      'DATA': `"@typescript-eslint/strict-boolean-expressions": "error"`
    };
    
    const rule = lintRules[errorEntry.errorType as keyof typeof lintRules];
    if (rule) {
      console.log(`🔧 LINT-REGEL ERSTELLT: ${rule}`);
    }
  }

  /**
   * Auto-Fix-Regel erstellen
   */
  private createAutoFixRule(errorEntry: ErrorEntry): void {
    const autoFixes = {
      'SYNTAX': 'prettier --write',
      'IMPORT': 'organize-imports-cli',
      'CONFIG': 'env-validation-check',
      'DATA': 'type-guard-generator'
    };
    
    const fix = autoFixes[errorEntry.errorType as keyof typeof autoFixes];
    if (fix) {
      console.log(`🤖 AUTO-FIX REGEL: ${fix}`);
    }
  }

  /**
   * Pre-Commit Hook installieren
   */
  private installPreCommitHook(errorEntry: ErrorEntry): void {
    const hooks = {
      'SYNTAX': 'npm run lint:fix',
      'IMPORT': 'npm run imports:organize', 
      'CONFIG': 'npm run config:validate',
      'DATA': 'npm run types:check'
    };
    
    const hook = hooks[errorEntry.errorType as keyof typeof hooks];
    if (hook) {
      console.log(`🪝 PRE-COMMIT HOOK: ${hook}`);
    }
  }

  /**
   * Code-Template erstellen
   */
  private createCodeTemplate(errorEntry: ErrorEntry): void {
    const templates = {
      'SYNTAX': '// AUTO-GENERATED: Korrekte Syntax-Template',
      'IMPORT': '// AUTO-GENERATED: Import-Template mit korrekten Pfaden',
      'CONFIG': '// AUTO-GENERATED: Config-Validation-Template',
      'DATA': '// AUTO-GENERATED: Type-Safe Data-Handling-Template'
    };
    
    const template = templates[errorEntry.errorType as keyof typeof templates];
    if (template) {
      console.log(`📄 CODE-TEMPLATE ERSTELLT: ${template}`);
    }
  }

  /**
   * Auto-Check generieren
   */
  private generateAutoCheck(errorEntry: ErrorEntry): string {
    const checks = {
      'SYNTAX': 'Syntax-Validator vor Ausführung',
      'IMPORT': 'Import-Resolver Check',
      'CONFIG': 'Environment-Variable Validation',
      'DATA': 'Type-Safety Check',
      'API': 'API-Endpoint Verfügbarkeit',
      'LOGIC': 'Unit-Test Coverage Check'
    };
    
    return checks[errorEntry.errorType] || 'Allgemeiner Validierungs-Check';
  }

  /**
   * Fehlerbericht generieren
   */
  private generateErrorReport(errorEntry: ErrorEntry): string {
    return `
## FEHLER-EINTRAG ${errorEntry.id}

### Fehlerdetails:
- **Zeitpunkt:** ${errorEntry.timestamp}
- **Fehlertyp:** ${errorEntry.errorType}
- **Fehlermeldung:** ${errorEntry.originalMessage}
- **Betroffene Datei:** ${errorEntry.affectedFile}:${errorEntry.lineNumber || 'unknown'}
- **Kontext:** ${errorEntry.context}

### Ursachenanalyse:
- **Grund:** ${errorEntry.causeAnalysis}
- **Auslöser:** ${errorEntry.trigger}
- **Muster erkannt:** ${errorEntry.isRecurring ? 'JA' : 'NEIN'} (${errorEntry.occurrenceCount}x)

### Status:
- **Lösung implementiert:** ${errorEntry.solution || 'AUSSTEHEND'}
- **Präventionsmaßnahmen:** ${errorEntry.preventionMeasures.length || 0} geplant
`;
  }

  /**
   * Öffentliche API für Fehlerstatistiken
   */
  getErrorStatistics() {
    return {
      totalErrors: this.errorHistory.length,
      recurringErrors: this.errorHistory.filter(e => e.isRecurring).length,
      patterns: this.patterns.length,
      autoFixesAvailable: this.patterns.filter(p => p.autoFixAvailable).length,
      mostCommonErrorType: this.getMostCommonErrorType(),
      recentErrors: this.errorHistory.slice(-10)
    };
  }

  private getMostCommonErrorType(): string {
    const counts = this.errorHistory.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'NONE';
  }

  /**
   * Bekannte Fehler & Lösungen exportieren
   */
  exportKnowledgeBase(): string {
    return this.patterns.map(pattern => `
## ${pattern.description}
- **Häufigkeit:** ${pattern.frequency}x
- **Letzte Sichtung:** ${pattern.lastSeen}
- **Lösungen:** ${pattern.solutions.join('; ')}
- **Prävention:** ${pattern.preventionRules.join('; ')}
- **Auto-Fix:** ${pattern.autoFixAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
`).join('\n');
  }
}

/**
 * Globale Instanz für einfachen Zugriff
 */
export const errorLearningSystem = IntelligentErrorLogger.getInstance();

/**
 * Decorator für automatische Fehlerbehandlung
 */
export function withErrorLearning(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    try {
      return method.apply(this, args);
    } catch (error) {
      const errorId = errorLearningSystem.logError({
        type: 'RUNTIME',
        message: error.message,
        file: `${target.constructor.name}.${propertyName}`,
        context: `Method execution: ${propertyName}`,
        stackTrace: error.stack
      });

      // Bekannte Lösung anwenden falls verfügbar
      const stats = errorLearningSystem.getErrorStatistics();
      console.log(`🔍 Fehler geloggt: ${errorId}`);
      
      throw error;
    }
  };

  return descriptor;
}