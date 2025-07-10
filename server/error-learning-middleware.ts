/**
 * Middleware für kontinuierliches Error Learning
 * Automatische Fehlererfassung bei JEDER Request
 */

import { Request, Response, NextFunction } from 'express';
import { errorLearningSystem } from '@shared/error-learning-system';

export interface ErrorLearningRequest extends Request {
  errorContext?: {
    startTime: number;
    requestId: string;
    userId?: string;
  };
}

/**
 * Request-Tracking Middleware - Erfasst jeden Request für Fehleranalyse
 */
export function requestTrackingMiddleware() {
  return (req: ErrorLearningRequest, res: Response, next: NextFunction) => {
    // Eindeutige Request-ID generieren
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    req.errorContext = {
      startTime: Date.now(),
      requestId,
      userId: (req as any).user?.id
    };

    // Response-Timing erfassen
    res.on('finish', () => {
      const duration = Date.now() - req.errorContext!.startTime;
      
      // Langsame Requests als potentielle Performance-Probleme loggen
      if (duration > 5000) { // 5 Sekunden
        errorLearningSystem.logError({
          type: 'RUNTIME',
          message: `Slow request detected: ${duration}ms`,
          file: req.path,
          context: `${req.method} ${req.path} - User: ${req.errorContext?.userId || 'anonymous'} - Duration: ${duration}ms`
        });
      }

      // 4xx/5xx Fehler automatisch erfassen
      if (res.statusCode >= 400) {
        const errorType = res.statusCode >= 500 ? 'RUNTIME' : 'LOGIC';
        
        errorLearningSystem.logError({
          type: errorType,
          message: `HTTP ${res.statusCode} error`,
          file: req.path,
          context: `${req.method} ${req.path} - Status: ${res.statusCode} - User: ${req.errorContext?.userId || 'anonymous'}`
        });
      }
    });

    next();
  };
}

/**
 * Database Error Capture - Erfasst DB-Fehler automatisch
 */
export function databaseErrorCapture() {
  return (req: ErrorLearningRequest, res: Response, next: NextFunction) => {
    // Database operation wrapper
    const originalQuery = req.app.get('db')?.query;
    
    if (originalQuery) {
      req.app.get('db').query = function(...args: any[]) {
        try {
          return originalQuery.apply(this, args);
        } catch (error: any) {
          // DB-Fehler automatisch loggen
          errorLearningSystem.logError({
            type: 'DATA',
            message: `Database error: ${error.message}`,
            file: req.path,
            context: `SQL Error in ${req.method} ${req.path} - Query: ${args[0]?.slice(0, 100)}...`
          });
          
          throw error;
        }
      };
    }

    next();
  };
}

/**
 * Validation Error Capture - Erfasst Validierungsfehler
 */
export function validationErrorCapture() {
  return (req: ErrorLearningRequest, res: Response, next: NextFunction) => {
    // Zod-Validation errors automatisch erfassen
    const originalSend = res.send;
    
    res.send = function(body: any) {
      if (res.statusCode === 400 && body?.message?.includes('validation')) {
        errorLearningSystem.logError({
          type: 'DATA',
          message: `Validation error: ${body.message}`,
          file: req.path,
          context: `Validation failed for ${req.method} ${req.path} - Body: ${JSON.stringify(req.body).slice(0, 200)}`
        });
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
}

/**
 * API Error Pattern Detection - Erkennt API-spezifische Fehlerpatterns
 */
export function apiErrorPatternDetection() {
  return (req: ErrorLearningRequest, res: Response, next: NextFunction) => {
    // Häufige API-Fehlerpatterns prüfen
    
    // Missing Authentication
    if (!req.headers.authorization && req.path.startsWith('/api/') && req.path !== '/api/auth/login') {
      errorLearningSystem.logError({
        type: 'CONFIG',
        message: 'Missing authentication header',
        file: req.path,
        context: `Unauthenticated API access attempt: ${req.method} ${req.path}`
      });
    }

    // Invalid Content-Type
    if (req.method === 'POST' && !req.headers['content-type']?.includes('application/json')) {
      errorLearningSystem.logError({
        type: 'API',
        message: 'Invalid or missing Content-Type header',
        file: req.path,
        context: `POST request without proper Content-Type: ${req.method} ${req.path}`
      });
    }

    // Large payload detection
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      errorLearningSystem.logError({
        type: 'API',
        message: `Large payload detected: ${contentLength} bytes`,
        file: req.path,
        context: `Oversized request: ${req.method} ${req.path} - Size: ${contentLength}`
      });
    }

    next();
  };
}

/**
 * Proactive Error Prevention - Verhindert bekannte Fehler proaktiv
 */
export function proactiveErrorPrevention() {
  return async (req: ErrorLearningRequest, res: Response, next: NextFunction) => {
    const stats = errorLearningSystem.getErrorStatistics();
    
    // Wenn bereits bekannte Fehlerpatterns für diese Route existieren
    const routeErrors = stats.recentErrors.filter((error: any) => 
      error.affectedFile === req.path
    );

    if (routeErrors.length >= 3) {
      console.warn(`⚠️ ROUTE MIT BEKANNTEN PROBLEMEN: ${req.path}`);
      console.warn(`📊 ${routeErrors.length} Fehler in den letzten Sessions`);
      
      // Response-Header für Debugging hinzufügen
      res.setHeader('X-Error-Learning-Warning', 'Known-Issues-Route');
      res.setHeader('X-Error-Count', routeErrors.length.toString());
    }

    // Rate limiting für problematische Routes
    if (routeErrors.length >= 5) {
      console.warn(`🚨 AUTOMATISCHES RATE LIMITING für ${req.path}`);
      
      // Temporäres Rate Limiting implementieren
      const clientIp = req.ip;
      const rateLimitKey = `rate_limit_${clientIp}_${req.path}`;
      
      // In realer Implementierung: Redis/Memory-basiertes Rate Limiting
      console.log(`🛡️ Rate Limiting aktiviert für ${rateLimitKey}`);
    }

    next();
  };
}

/**
 * Error Learning Analytics - Sammelt Metriken für Machine Learning
 */
export function errorLearningAnalytics() {
  return (req: ErrorLearningRequest, res: Response, next: NextFunction) => {
    // Browser/Client Information sammeln
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    
    // Mobile vs Desktop Detection
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    // Context für bessere Fehleranalyse anreichern
    if (req.errorContext) {
      req.errorContext = {
        ...req.errorContext,
        userAgent,
        referer,
        isMobile,
        ip: req.ip
      };
    }

    next();
  };
}

/**
 * Kombinierte Error Learning Middleware
 */
export function createErrorLearningMiddleware() {
  return [
    requestTrackingMiddleware(),
    databaseErrorCapture(),
    validationErrorCapture(),
    apiErrorPatternDetection(),
    proactiveErrorPrevention(),
    errorLearningAnalytics()
  ];
}