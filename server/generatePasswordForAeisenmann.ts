/**
 * Passwort-Generator für aeisenmann@lohr.de
 */

import { storage } from './storage';
import { emailService } from './emailService';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function generatePasswordForAeisenmann(): Promise<void> {
  console.log('🔐 Generiere neues Passwort für aeisenmann@lohr.de...');
  
  try {
    // Sicheres Passwort generieren
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const newPassword = `BauStructura2025!${randomSuffix}`;
    
    console.log('📝 Neues Passwort generiert:', newPassword);
    
    // Passwort verschlüsseln
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('🔒 Passwort erfolgreich verschlüsselt');
    
    // Benutzer suchen
    const user = await storage.getUserByEmail('aeisenmann@lohr.de');
    
    if (!user) {
      console.log('❌ Benutzer nicht gefunden mit E-Mail: aeisenmann@lohr.de');
      
      // Alternative: Benutzer über Username suchen
      const userByUsername = await storage.getUser('aeisenmann');
      
      if (userByUsername) {
        console.log('✅ Benutzer über Username gefunden:', userByUsername.id);
        await updatePasswordAndSendEmail(userByUsername, newPassword, hashedPassword);
      } else {
        console.log('❌ Benutzer auch nicht über Username gefunden');
        
        // Alle Benutzer auflisten
        const allUsers = await storage.getAllUsers();
        console.log('📋 Verfügbare Benutzer:');
        allUsers.forEach(u => {
          console.log(`   - ID: ${u.id} | E-Mail: ${u.email}`);
        });
      }
      return;
    }
    
    await updatePasswordAndSendEmail(user, newPassword, hashedPassword);
    
  } catch (error) {
    console.error('💥 Fehler bei Passwort-Generierung:', error);
  }
}

async function updatePasswordAndSendEmail(user: any, newPassword: string, hashedPassword: string) {
  try {
    // Passwort in Datenbank aktualisieren
    await storage.updateUser(user.id, {
      password: hashedPassword
    });
    
    console.log('✅ Passwort erfolgreich in Datenbank aktualisiert');
    
    // E-Mail mit neuem Passwort senden
    await emailService.sendPasswordResetEmail({
      email: user.email || 'aeisenmann@lohr.de',
      firstName: user.firstName || 'A. Eisenmann',
      newPassword: newPassword,
      loginUrl: 'https://bau-structura.com/auth'
    });
    
    console.log('📧 Passwort-E-Mail erfolgreich versendet');
    console.log('🎯 Zusammenfassung:');
    console.log(`   📧 E-Mail: ${user.email || 'aeisenmann@lohr.de'}`);
    console.log(`   👤 Benutzer-ID: ${user.id}`);
    console.log(`   🔐 Neues Passwort: ${newPassword}`);
    console.log(`   🔗 Login-URL: https://bau-structura.com/auth`);
    
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren/E-Mail-Versand:', error);
  }
}

// Sofortige Ausführung
generatePasswordForAeisenmann()
  .then(() => {
    console.log('🎉 Passwort-Generierung für aeisenmann abgeschlossen');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Passwort-Generierung fehlgeschlagen:', error);
    process.exit(1);
  });