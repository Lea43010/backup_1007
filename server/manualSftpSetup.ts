/**
 * Manuelle SFTP-Einrichtung für aeisenmann
 */

import { emailService } from './emailService';

export async function setupSftpForAeisenmann(): Promise<void> {
  console.log('🔧 Richte SFTP-Account für aeisenmann ein...');
  
  // SFTP-Zugangsdaten generieren
  const sftpCredentials = {
    username: 'baustructura_aeisenmann',
    password: 'SecurePass2025!@#',
    host: '128.140.82.20',
    port: 22,
    path: '/var/ftp/aeisenmann/uploads/',
    storageLimit: 1
  };

  console.log('📧 Sende SFTP-Zugangsdaten per E-Mail...');
  
  try {
    // E-Mail mit SFTP-Zugangsdaten senden
    await emailService.sendSftpWelcomeEmail({
      email: 'aeisenmann@lohr.de', // Korrekte E-Mail-Adresse
      firstName: 'A. Eisenmann',
      sftpHost: sftpCredentials.host,
      sftpPort: sftpCredentials.port,
      sftpUsername: sftpCredentials.username,
      sftpPassword: sftpCredentials.password,
      sftpPath: sftpCredentials.path,
      licenseType: 'basic',
      storageLimit: sftpCredentials.storageLimit
    });

    console.log('✅ SFTP-Account für aeisenmann erfolgreich eingerichtet!');
    console.log('📧 E-Mail mit Zugangsdaten wurde versendet');
    console.log('🔐 SFTP-Zugangsdaten:');
    console.log(`   Host: ${sftpCredentials.host}:${sftpCredentials.port}`);
    console.log(`   Username: ${sftpCredentials.username}`);
    console.log(`   Password: ${sftpCredentials.password}`);
    console.log(`   Path: ${sftpCredentials.path}`);
    
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error);
    throw error;
  }
}

// Sofortige Ausführung
setupSftpForAeisenmann()
  .then(() => {
    console.log('🎉 SFTP-Setup für aeisenmann abgeschlossen');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 SFTP-Setup fehlgeschlagen:', error);
    process.exit(1);
  });