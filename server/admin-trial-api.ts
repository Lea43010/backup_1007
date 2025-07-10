/**
 * Admin-API für Testzeitraum-Verwaltung
 */

import type { Express } from "express";
import { trialReminderService } from "./trialReminderService";
import { isAuthenticated } from "./localAuth";

export function registerTrialAdminRoutes(app: Express) {
  // Admin-Test für Testzeitraum-Erinnerungen
  app.post('/api/admin/test-trial-reminder', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Zugriff verweigert' });
      }

      const { email } = req.body;
      
      const success = await trialReminderService.testTrialReminder(email);
      
      if (success) {
        res.json({ message: 'Testzeitraum-Erinnerung erfolgreich versendet' });
      } else {
        res.status(500).json({ message: 'Fehler beim Versenden der Testzeitraum-Erinnerung' });
      }
    } catch (error) {
      console.error('Admin Testzeitraum-Test Fehler:', error);
      res.status(500).json({ message: 'Fehler beim Testzeitraum-Test' });
    }
  });

  // Admin-Check für Testzeitraum-Status
  app.get('/api/admin/trial-status', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Zugriff verweigert' });
      }

      const results = await trialReminderService.checkTrialExpirations();
      
      res.json({
        message: 'Testzeitraum-Check abgeschlossen',
        results
      });
    } catch (error) {
      console.error('Admin Testzeitraum-Status Fehler:', error);
      res.status(500).json({ message: 'Fehler beim Testzeitraum-Status Check' });
    }
  });

  // Manueller Testzeitraum-Check
  app.post('/api/admin/run-trial-check', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Zugriff verweigert' });
      }

      const results = await trialReminderService.checkTrialExpirations();
      
      res.json({
        message: 'Manueller Testzeitraum-Check durchgeführt',
        results
      });
    } catch (error) {
      console.error('Admin Testzeitraum-Check Fehler:', error);
      res.status(500).json({ message: 'Fehler beim manuellen Testzeitraum-Check' });
    }
  });
}