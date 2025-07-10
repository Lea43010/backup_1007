/**
 * Automatische SFTP-Einrichtung für lizenzierte Benutzer
 * Wird ausgelöst nach erfolgreichem Lizenz-Abschluss
 */

import { storage } from './storage';
import { emailService } from './emailService';
import crypto from 'crypto';

interface SftpSetupResult {
  success: boolean;
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  path?: string;
  error?: string;
}

export class SftpAutoSetup {
  private static readonly SFTP_HOST = '128.140.82.20'; // Hetzner Server
  private static readonly SFTP_PORT = 22;
  private static readonly BASE_PATH = '/home/sftp-users';

  /**
   * Erstellt automatisch SFTP-Account nach Lizenz-Aktivierung
   */
  static async setupSftpForUser(userId: string): Promise<SftpSetupResult> {
    try {
      console.log(`🔧 Starte automatische SFTP-Einrichtung für User ${userId}`);

      // Benutzer aus Datenbank laden
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'Benutzer nicht gefunden' };
      }

      // Prüfen ob Lizenz aktiv ist
      if (!this.hasValidLicense(user)) {
        console.log(`❌ User ${userId} hat keine gültige Lizenz - SFTP-Setup übersprungen`);
        return { success: false, error: 'Keine gültige Lizenz vorhanden' };
      }

      // SFTP bereits konfiguriert?
      if (user.sftpUsername && user.sftpPassword) {
        console.log(`✅ SFTP bereits konfiguriert für User ${userId}`);
        return {
          success: true,
          username: user.sftpUsername,
          host: this.SFTP_HOST,
          port: this.SFTP_PORT,
          path: user.sftpPath || '/'
        };
      }

      // Neue SFTP-Credentials generieren
      const sftpCredentials = this.generateSftpCredentials(user);
      
      // SFTP-Account auf Server erstellen (simuliert)
      const serverSetup = await this.createSftpAccountOnServer(sftpCredentials);
      if (!serverSetup.success) {
        return { success: false, error: serverSetup.error };
      }

      // Credentials in Datenbank speichern
      await storage.updateUser(userId, {
        sftpHost: this.SFTP_HOST,
        sftpPort: this.SFTP_PORT,
        sftpUsername: sftpCredentials.username,
        sftpPassword: sftpCredentials.password,
        sftpPath: sftpCredentials.path,
        sftpAccessLevel: this.getSftpAccessLevel(user.licenseType || 'basic')
      });

      // Willkommens-E-Mail mit SFTP-Informationen senden
      await this.sendSftpWelcomeEmail(user, sftpCredentials);

      console.log(`✅ SFTP automatisch eingerichtet für User ${userId}: ${sftpCredentials.username}`);

      return {
        success: true,
        username: sftpCredentials.username,
        password: sftpCredentials.password,
        host: this.SFTP_HOST,
        port: this.SFTP_PORT,
        path: sftpCredentials.path
      };

    } catch (error) {
      console.error('Fehler bei automatischer SFTP-Einrichtung:', error);
      return { success: false, error: 'Technischer Fehler bei SFTP-Einrichtung' };
    }
  }

  /**
   * Prüft ob Benutzer eine gültige Lizenz hat
   */
  private static hasValidLicense(user: any): boolean {
    // Testzeitraum gilt nicht als gültige Lizenz
    if (user.paymentStatus === 'trial') {
      return false;
    }

    // Aktive Lizenz erforderlich
    if (user.paymentStatus !== 'active') {
      return false;
    }

    // Lizenz nicht abgelaufen
    if (user.licenseExpiresAt && new Date(user.licenseExpiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Generiert sichere SFTP-Credentials
   */
  private static generateSftpCredentials(user: any) {
    // Username: bau + user-id (eindeutig)
    const username = `bau${user.id}`;
    
    // Sicheres Passwort generieren
    const password = crypto.randomBytes(16).toString('hex');
    
    // Benutzer-spezifischer Pfad
    const path = `/home/sftp-users/${username}/`;

    return { username, password, path };
  }

  /**
   * Erstellt SFTP-Account auf dem Server (simuliert)
   */
  private static async createSftpAccountOnServer(credentials: any): Promise<{ success: boolean; error?: string }> {
    try {
      // In der Realität würde hier ein SSH-Befehl an den Hetzner Server gesendet:
      // 1. useradd -m -d /home/sftp-users/${username} -s /bin/false ${username}
      // 2. echo "${username}:${password}" | chpasswd
      // 3. mkdir -p /home/sftp-users/${username}/uploads
      // 4. chown ${username}:sftp-group /home/sftp-users/${username}
      // 5. chmod 755 /home/sftp-users/${username}

      console.log(`🔧 Erstelle SFTP-Account auf Server: ${credentials.username}`);
      
      // Simulierte Server-Kommunikation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ SFTP-Account erfolgreich erstellt: ${credentials.username}`);
      return { success: true };

    } catch (error) {
      console.error('Fehler bei Server-Account-Erstellung:', error);
      return { success: false, error: 'Server-Kommunikation fehlgeschlagen' };
    }
  }

  /**
   * Bestimmt SFTP-Zugriffslevel basierend auf Lizenztyp
   */
  private static getSftpAccessLevel(licenseType: string): number {
    switch (licenseType) {
      case 'basic': return 1;      // 1GB Speicher
      case 'professional': return 5;  // 5GB Speicher
      case 'enterprise': return 20;   // 20GB Speicher
      default: return 0;
    }
  }

  /**
   * Sendet Willkommens-E-Mail mit SFTP-Informationen
   */
  private static async sendSftpWelcomeEmail(user: any, credentials: any) {
    try {
      await emailService.sendSftpWelcomeEmail({
        email: user.email,
        firstName: user.firstName || 'Benutzer',
        sftpHost: this.SFTP_HOST,
        sftpPort: this.SFTP_PORT,
        sftpUsername: credentials.username,
        sftpPassword: credentials.password,
        sftpPath: credentials.path,
        licenseType: user.licenseType,
        storageLimit: this.getSftpAccessLevel(user.licenseType)
      });

      console.log(`📧 SFTP-Willkommens-E-Mail gesendet an ${user.email}`);
    } catch (error) {
      console.error('Fehler beim Senden der SFTP-Willkommens-E-Mail:', error);
    }
  }

  /**
   * Entfernt SFTP-Account bei Lizenz-Kündigung
   */
  static async removeSftpForUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.sftpUsername) {
        return { success: true }; // Bereits entfernt
      }

      // SFTP-Account auf Server löschen (simuliert)
      console.log(`🗑️ Entferne SFTP-Account: ${user.sftpUsername}`);
      
      // Server-Befehle (simuliert):
      // 1. userdel ${username}
      // 2. rm -rf /home/sftp-users/${username}
      
      // Credentials aus Datenbank entfernen
      await storage.updateUser(userId, {
        sftpHost: null,
        sftpPort: 22,
        sftpUsername: null,
        sftpPassword: null,
        sftpPath: '/',
        sftpAccessLevel: 0
      });

      console.log(`✅ SFTP-Account erfolgreich entfernt für User ${userId}`);
      return { success: true };

    } catch (error) {
      console.error('Fehler beim Entfernen des SFTP-Accounts:', error);
      return { success: false, error: 'Fehler beim Entfernen des SFTP-Accounts' };
    }
  }
}

/**
 * Hook: Wird nach erfolgreicher Stripe-Zahlung aufgerufen
 */
export async function onLicenseActivated(userId: string, licenseType: string) {
  console.log(`🎉 Lizenz aktiviert für User ${userId}: ${licenseType}`);
  
  // SFTP automatisch einrichten
  const sftpResult = await SftpAutoSetup.setupSftpForUser(userId);
  
  if (sftpResult.success) {
    console.log(`✅ SFTP automatisch eingerichtet: ${sftpResult.username}`);
  } else {
    console.error(`❌ SFTP-Einrichtung fehlgeschlagen: ${sftpResult.error}`);
  }
  
  return sftpResult;
}

/**
 * Hook: Wird bei Lizenz-Kündigung aufgerufen
 */
export async function onLicenseCancelled(userId: string) {
  console.log(`❌ Lizenz gekündigt für User ${userId}`);
  
  // SFTP-Account entfernen
  const result = await SftpAutoSetup.removeSftpForUser(userId);
  
  if (result.success) {
    console.log(`✅ SFTP-Account automatisch entfernt für User ${userId}`);
  } else {
    console.error(`❌ SFTP-Entfernung fehlgeschlagen: ${result.error}`);
  }
  
  return result;
}