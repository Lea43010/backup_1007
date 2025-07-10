/**
 * API-Routen für das Error Learning System
 */

import { Express } from 'express';
import { isAuthenticated } from '../localAuth';
import { errorLearningSystem } from '@shared/error-learning-system';

export function registerErrorLearningRoutes(app: Express) {
  // Fehlerstatistiken abrufen (nur für Admins)
  app.get('/api/admin/error-learning/stats', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
      }

      const stats = errorLearningSystem.getErrorStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Fehler beim Abrufen der Error-Learning Stats:', error);
      res.status(500).json({ message: 'Fehler beim Laden der Statistiken' });
    }
  });

  // Wissensbasis exportieren
  app.get('/api/admin/error-learning/knowledge-base', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
      }

      const knowledgeBase = errorLearningSystem.exportKnowledgeBase();
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="error-knowledge-base.md"');
      res.send(knowledgeBase);
    } catch (error) {
      console.error('Fehler beim Export der Wissensbasis:', error);
      res.status(500).json({ message: 'Fehler beim Export' });
    }
  });

  // Manuellen Fehler loggen (für Testing/Development)
  app.post('/api/admin/error-learning/log-error', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
      }

      const { type, message, file, context } = req.body;
      
      if (!type || !message || !context) {
        return res.status(400).json({ message: 'Fehlende Pflichtfelder: type, message, context' });
      }

      const errorId = errorLearningSystem.logError({
        type,
        message,
        file: file || 'manual-entry',
        context
      });

      res.json({ 
        success: true, 
        errorId,
        message: 'Fehler erfolgreich geloggt' 
      });
    } catch (error) {
      console.error('Fehler beim manuellen Logging:', error);
      res.status(500).json({ message: 'Fehler beim Logging' });
    }
  });

  // Lösung für einen Fehler dokumentieren
  app.post('/api/admin/error-learning/document-solution', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
      }

      const { errorId, solution } = req.body;
      
      if (!errorId || !solution) {
        return res.status(400).json({ message: 'ErrorId und Solution sind erforderlich' });
      }

      errorLearningSystem.documentSolution(errorId, solution);

      res.json({ 
        success: true,
        message: 'Lösung erfolgreich dokumentiert' 
      });
    } catch (error) {
      console.error('Fehler beim Dokumentieren der Lösung:', error);
      res.status(500).json({ message: 'Fehler beim Dokumentieren' });
    }
  });

  console.log('✅ Error Learning API-Routen registriert');
}