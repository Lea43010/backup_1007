/**
 * Admin-API für SFTP-Verwaltung
 */

import type { Express } from "express";
import { isAuthenticated } from "../localAuth";
import { SftpAutoSetup } from "../sftpAutoSetup";
import { storage } from "../storage";

export function registerSftpAdminRoutes(app: Express) {
  
  // SFTP für Benutzer manuell einrichten (Admin-Funktion)
  app.post('/api/admin/sftp/setup/:userId', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
      }

      const { userId } = req.params;
      
      const result = await SftpAutoSetup.setupSftpForUser(userId);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'SFTP-Account erfolgreich eingerichtet',
          credentials: {
            username: result.username,
            host: result.host,
            port: result.port,
            path: result.path
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Admin SFTP-Setup Fehler:', error);
      res.status(500).json({ 
        success: false,
        message: 'Technischer Fehler bei SFTP-Einrichtung' 
      });
    }
  });

  // SFTP-Account für Benutzer entfernen (Admin-Funktion)
  app.delete('/api/admin/sftp/remove/:userId', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
      }

      const { userId } = req.params;
      
      const result = await SftpAutoSetup.removeSftpForUser(userId);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'SFTP-Account erfolgreich entfernt'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Admin SFTP-Entfernung Fehler:', error);
      res.status(500).json({ 
        success: false,
        message: 'Technischer Fehler bei SFTP-Entfernung' 
      });
    }
  });

  // SFTP-Status für alle Benutzer anzeigen (Admin-Übersicht)
  app.get('/api/admin/sftp/status', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
      }

      const users = await storage.getAllUsers();
      
      const sftpStatus = users.map(user => ({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        licenseType: user.licenseType,
        paymentStatus: user.paymentStatus,
        hasValidLicense: user.paymentStatus === 'active' && user.licenseType !== null,
        sftpConfigured: !!(user.sftpUsername && user.sftpPassword),
        sftpUsername: user.sftpUsername,
        sftpHost: user.sftpHost,
        sftpAccessLevel: user.sftpAccessLevel,
        lastUpdate: user.updatedAt
      }));

      res.json({
        totalUsers: users.length,
        sftpConfigured: sftpStatus.filter(u => u.sftpConfigured).length,
        validLicenses: sftpStatus.filter(u => u.hasValidLicense).length,
        users: sftpStatus
      });
    } catch (error) {
      console.error('SFTP-Status Fehler:', error);
      res.status(500).json({ 
        message: 'Fehler beim Laden des SFTP-Status' 
      });
    }
  });
}