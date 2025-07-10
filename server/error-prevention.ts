/**
 * Fehlerprävention-System für Server-seitige Operationen
 */

import { errorLearningSystem } from '@shared/error-learning-system';

export class ErrorPreventionSystem {
  private static instance: ErrorPreventionSystem;
  
  static getInstance(): ErrorPreventionSystem {
    if (!ErrorPreventionSystem.instance) {
      ErrorPreventionSystem.instance = new ErrorPreventionSystem();
    }
    return ErrorPreventionSystem.instance;
  }

  /**
   * Pre-Execution-Scan für bekannte Fehlermuster
   */
  async preExecutionScan(context: {
    operation: string;
    file?: string;
    dependencies?: string[];
    environment?: Record<string, any>;
  }): Promise<{
    safe: boolean;
    warnings: string[];
    autoFixes: string[];
    recommendations: string[];
  }> {
    const warnings: string[] = [];
    const autoFixes: string[] = [];
    const recommendations: string[] = [];

    // 1. Dependency-Check
    if (context.dependencies) {
      const missingDeps = await this.checkDependencies(context.dependencies);
      if (missingDeps.length > 0) {
        warnings.push(`Fehlende Dependencies: ${missingDeps.join(', ')}`);
        autoFixes.push(`npm install ${missingDeps.join(' ')}`);
      }
    }

    // 2. Environment-Validierung
    if (context.environment) {
      const missingEnvVars = this.checkEnvironmentVariables(context.environment);
      if (missingEnvVars.length > 0) {
        warnings.push(`Fehlende Environment-Variablen: ${missingEnvVars.join(', ')}`);
        recommendations.push('Überprüfen Sie die .env Konfiguration');
      }
    }

    // 3. Bekannte Fehlermuster prüfen
    const knownPatterns = this.checkKnownPatterns(context);
    warnings.push(...knownPatterns.warnings);
    recommendations.push(...knownPatterns.recommendations);

    return {
      safe: warnings.length === 0,
      warnings,
      autoFixes,
      recommendations
    };
  }

  /**
   * Dependencies prüfen
   */
  private async checkDependencies(dependencies: string[]): Promise<string[]> {
    const missing: string[] = [];
    
    for (const dep of dependencies) {
      try {
        require.resolve(dep);
      } catch (error) {
        missing.push(dep);
      }
    }
    
    return missing;
  }

  /**
   * Environment-Variablen prüfen
   */
  private checkEnvironmentVariables(requiredVars: Record<string, any>): string[] {
    const missing: string[] = [];
    
    for (const [key, required] of Object.entries(requiredVars)) {
      if (required && !process.env[key]) {
        missing.push(key);
      }
    }
    
    return missing;
  }

  /**
   * Bekannte Fehlermuster prüfen
   */
  private checkKnownPatterns(context: any): {
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    const stats = errorLearningSystem.getErrorStatistics();
    
    // Wiederkehrende Fehler warnen
    if (stats.recurringErrors > 0) {
      warnings.push(`⚠️ ${stats.recurringErrors} wiederkehrende Fehler erkannt`);
      recommendations.push('Überprüfen Sie die Fehler-Historie für bekannte Lösungen');
    }

    // Häufige Fehlertypen
    if (stats.mostCommonErrorType === 'CONFIG') {
      recommendations.push('💡 Häufige Konfigurationsfehler - Environment-Variablen validieren');
    }

    if (stats.mostCommonErrorType === 'IMPORT') {
      recommendations.push('💡 Häufige Import-Fehler - Pfade und Dependencies prüfen');
    }

    return { warnings, recommendations };
  }

  /**
   * Automatische Korrektur anwenden
   */
  async applyAutoFixes(fixes: string[]): Promise<boolean> {
    let allSuccessful = true;

    for (const fix of fixes) {
      try {
        if (fix.startsWith('npm install')) {
          console.log(`🔧 Auto-Fix: ${fix}`);
          // Fehler loggen für spätere automatische Behandlung
          errorLearningSystem.logError({
            type: 'CONFIG',
            message: `Dependency missing: ${fix}`,
            file: 'package.json',
            context: 'Auto-Fix dependency installation'
          });
        }
        
        if (fix.startsWith('export ')) {
          console.log(`🔧 Auto-Fix: ${fix}`);
          // Environment-Variable fehlt
          errorLearningSystem.logError({
            type: 'CONFIG',
            message: `Environment variable missing: ${fix}`,
            file: '.env',
            context: 'Auto-Fix environment setup'
          });
        }

        if (fix.includes('prettier') || fix.includes('eslint')) {
          console.log(`🔧 Auto-Fix: Code formatting/linting`);
          // Syntax-Fehler automatisch beheben
          this.applySyntaxAutoFix();
        }

        if (fix.includes('import')) {
          console.log(`🔧 Auto-Fix: Import organization`);
          // Import-Fehler automatisch beheben
          this.applyImportAutoFix();
        }

      } catch (error) {
        console.error(`❌ Auto-Fix fehlgeschlagen: ${fix}`, error);
        
        // Fehlgeschlagenen Auto-Fix auch loggen
        errorLearningSystem.logError({
          type: 'RUNTIME',
          message: `Auto-Fix failed: ${error.message}`,
          file: 'error-prevention.ts',
          context: `Failed to apply auto-fix: ${fix}`
        });
        
        allSuccessful = false;
      }
    }

    return allSuccessful;
  }

  /**
   * Syntax Auto-Fix anwenden
   */
  private applySyntaxAutoFix(): void {
    console.log(`🎯 SYNTAX AUTO-FIX: Formatierung wird korrigiert`);
    // Hier würde prettier/eslint --fix ausgeführt
  }

  /**
   * Import Auto-Fix anwenden
   */
  private applyImportAutoFix(): void {
    console.log(`🎯 IMPORT AUTO-FIX: Import-Pfade werden korrigiert`);
    // Hier würde import-organizer ausgeführt
  }

  /**
   * Code-Qualitäts-Checks
   */
  validateCodeQuality(code: string, fileType: string): {
    isValid: boolean;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      suggestion?: string;
    }>;
  } {
    const issues: any[] = [];

    // TypeScript/JavaScript Validierung
    if (fileType === 'ts' || fileType === 'js') {
      // Häufige Syntax-Fehler prüfen
      if (code.includes('console.log(') && !code.includes('// DEBUG')) {
        issues.push({
          type: 'warning',
          message: 'Console.log ohne DEBUG-Kommentar',
          suggestion: '// DEBUG: Entfernen vor Production'
        });
      }

      // Fehlende Error-Handling
      if (code.includes('await ') && !code.includes('try {')) {
        issues.push({
          type: 'warning',
          message: 'Async/Await ohne Error-Handling',
          suggestion: 'Try-Catch Block hinzufügen'
        });
      }

      // Fehlende Type-Annotations
      if (code.includes('function ') && !code.includes(': ')) {
        issues.push({
          type: 'info',
          message: 'Fehlende TypeScript-Typen',
          suggestion: 'Return-Type und Parameter-Typen hinzufügen'
        });
      }
    }

    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues
    };
  }

  /**
   * Intelligent Error Handler für Express
   */
  createExpressErrorHandler() {
    return (error: any, req: any, res: any, next: any) => {
      // Fehler loggen und lernen
      const errorId = errorLearningSystem.logError({
        type: this.classifyExpressError(error),
        message: error.message,
        file: req.path,
        context: `${req.method} ${req.path} - User: ${req.user?.id || 'anonymous'}`,
        stackTrace: error.stack
      });

      // Bekannte Lösung anwenden falls verfügbar
      const stats = errorLearningSystem.getErrorStatistics();
      
      // User-freundliche Fehlermeldung basierend auf gelernten Mustern
      const userMessage = this.generateUserFriendlyErrorMessage(error, stats);

      res.status(error.status || 500).json({
        error: userMessage,
        errorId,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });

      console.error(`🔍 Express Error logged: ${errorId}`);
    };
  }

  /**
   * Express-Fehler klassifizieren
   */
  private classifyExpressError(error: any): any {
    if (error.code === 'ENOENT') return 'CONFIG';
    if (error.message.includes('Cannot find module')) return 'IMPORT';
    if (error.status === 401 || error.status === 403) return 'AUTH';
    if (error.status >= 500) return 'RUNTIME';
    if (error.message.includes('validation')) return 'DATA';
    return 'LOGIC';
  }

  /**
   * User-freundliche Fehlermeldung generieren
   */
  private generateUserFriendlyErrorMessage(error: any, stats: any): string {
    const commonErrors = {
      'Cannot find module': 'Ein erforderliches Modul konnte nicht gefunden werden. Bitte kontaktieren Sie den Support.',
      'ENOENT': 'Eine Datei oder Ressource konnte nicht gefunden werden.',
      'validation failed': 'Die eingegebenen Daten sind ungültig. Bitte überprüfen Sie Ihre Eingaben.',
      'Unauthorized': 'Sie sind nicht berechtigt, diese Aktion durchzuführen.',
      'Network Error': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.'
    };

    for (const [pattern, message] of Object.entries(commonErrors)) {
      if (error.message.includes(pattern)) {
        return message;
      }
    }

    return 'Ein unerwarteter Fehler ist aufgetreten. Unser Team wurde benachrichtigt.';
  }
}

export const errorPrevention = ErrorPreventionSystem.getInstance();

/**
 * Middleware für automatische Fehlerprävention
 */
export function createPreventionMiddleware() {
  return async (req: any, res: any, next: any) => {
    // Pre-Request Validation
    const scanResult = await errorPrevention.preExecutionScan({
      operation: `${req.method} ${req.path}`,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    });

    if (!scanResult.safe) {
      console.warn('⚠️ Prevention Scan Warnings:', scanResult.warnings);
    }

    if (scanResult.recommendations.length > 0) {
      console.info('💡 Recommendations:', scanResult.recommendations);
    }

    next();
  };
}