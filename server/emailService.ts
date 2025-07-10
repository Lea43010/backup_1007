import * as nodemailer from 'nodemailer';
import { storage } from './storage';
import { InsertSupportTicket } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  senderEmail: string;
  senderName: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      senderEmail: process.env.SENDER_EMAIL || 'support@bau-structura.de',
      senderName: process.env.SENDER_NAME || 'Bau-Structura Support'
    };

    // Nodemailer setup with BREVO SMTP - Enhanced configuration
    console.log('BREVO SMTP Konfiguration:', {
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      passLength: this.config.pass?.length || 0,
      senderEmail: this.config.senderEmail
    });

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: false, // Use STARTTLS
      requireTLS: true,
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      debug: true, // Enable debug for troubleshooting
      logger: true
    });
  }

  async sendSupportTicketEmail(ticketData: {
    to: string;
    subject: string;
    description: string;
    ticketId: number;
    priority: string;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: ticketData.to,
      subject: `Support Ticket #${ticketData.ticketId}: ${ticketData.subject}`,
      html: this.generateTicketEmailHtml(ticketData),
      text: this.generateTicketEmailText(ticketData)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim E-Mail Versand:', error);
      throw error;
    }
  }

  async sendTicketUpdateEmail(ticketData: {
    to: string;
    ticketId: number;
    subject: string;
    status: string;
    updateMessage: string;
    assignedTo?: string;
    editorName?: string;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: ticketData.to,
      subject: `Support Ticket #${ticketData.ticketId} Update: ${ticketData.status}`,
      html: this.generateUpdateEmailHtml(ticketData),
      text: this.generateUpdateEmailText(ticketData)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Update E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Update E-Mail Versand:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userData: {
    to: string;
    firstName: string;
    role: string;
    password?: string;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: userData.to,
      subject: 'Willkommen bei Bau-Structura!',
      html: this.generateWelcomeEmailHtml(userData),
      text: this.generateWelcomeEmailText(userData)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Willkommens-E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Willkommens-E-Mail Versand:', error);
      throw error;
    }
  }

  async sendFloodProtectionEmail(emailData: {
    to: string;
    subject: string;
    message: string;
    checklist: any;
    schieber: any[];
    schaeden?: any[];
    wachen?: any[];
    includePdf?: boolean;
  }) {
    const { to, subject, message, checklist, schieber, schaeden, wachen } = emailData;

    // E-Mail-Inhalt zusammenstellen
    const emailContent = `
${message}

--- Checklisten-Details ---
Titel: ${checklist.titel}
Typ: ${checklist.typ}
Status: ${checklist.status}
Erstellt von: ${checklist.erstellt_von}
Fortschritt: ${checklist.aufgaben_erledigt || 0}/${checklist.aufgaben_gesamt || 11} Aufgaben
${checklist.beginn_pegelstand_cm ? `Pegelstand: ${checklist.beginn_pegelstand_cm} cm` : ''}

Absperrschieber-Status:
${schieber.map((s: any) => `- Nr. ${s.nummer}: ${s.bezeichnung} (${s.status})`).join('\n')}

${schaeden && schaeden.length > 0 ? `
Schadensfälle:
${schaeden.map((schaden: any) => `- Schieber ${schaden.absperrschieber_nummer}: ${schaden.problem_beschreibung} (${schaden.status})`).join('\n')}
` : ''}

${wachen && wachen.length > 0 ? `
Deichwachen:
${wachen.map((wache: any) => `- ${wache.name} (${wache.bereich}): ${wache.telefon}`).join('\n')}
` : ''}

---
Diese E-Mail wurde automatisch generiert vom Bau-Structura Hochwasserschutz-System.
Support: ${this.config.senderEmail}
    `;

    const htmlContent = this.generateFloodProtectionEmailHtml({
      to, subject, message, checklist, schieber, schaeden, wachen
    });

    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      text: emailContent
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Hochwasserschutz-E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Hochwasserschutz-E-Mail Versand:', error);
      throw error;
    }
  }

  private generateTicketEmailHtml(ticketData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .priority-high { border-left: 4px solid #ef4444; }
            .priority-medium { border-left: 4px solid #f97316; }
            .priority-low { border-left: 4px solid #22c55e; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚧 Bau-Structura Support</h1>
                <p>Neues Support Ticket erstellt</p>
            </div>
            <div class="content">
                <div class="ticket-info priority-${ticketData.priority}">
                    <h3>Ticket #${ticketData.ticketId}</h3>
                    <p><strong>Betreff:</strong> ${ticketData.subject}</p>
                    <p><strong>Priorität:</strong> ${this.getPriorityLabel(ticketData.priority)}</p>
                    <p><strong>Status:</strong> Offen</p>
                </div>
                
                <h4>Beschreibung:</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${ticketData.description}</div>
                
                <p style="margin-top: 20px;">
                    Unser Support-Team wird sich schnellstmöglich um Ihr Anliegen kümmern. 
                    Sie erhalten automatisch Updates zu diesem Ticket.
                </p>
            </div>
            <div class="footer">
                <p>Bau-Structura - Revolutionäres Projektmanagement für den Bau</p>
                <p>Bei Fragen antworten Sie einfach auf diese E-Mail.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateTicketEmailText(ticketData: any): string {
    return `
BAU-STRUCTURA SUPPORT

Neues Support Ticket erstellt

Ticket #${ticketData.ticketId}
Betreff: ${ticketData.subject}
Priorität: ${this.getPriorityLabel(ticketData.priority)}
Status: Offen

Beschreibung:
${ticketData.description}

Unser Support-Team wird sich schnellstmöglich um Ihr Anliegen kümmern.
Sie erhalten automatisch Updates zu diesem Ticket.

Bau-Structura - Revolutionäres Projektmanagement für den Bau
Bei Fragen antworten Sie einfach auf diese E-Mail.`;
  }

  private generateUpdateEmailHtml(ticketData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .update-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .status-open { border-left: 4px solid #f97316; }
            .status-in-progress { border-left: 4px solid #3b82f6; }
            .status-resolved { border-left: 4px solid #22c55e; }
            .status-closed { border-left: 4px solid #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔄 Ticket Update</h1>
                <p>Status-Änderung für Ihr Support Ticket</p>
            </div>
            <div class="content">
                <div class="update-info status-${ticketData.status}">
                    <h3>Ticket #${ticketData.ticketId}</h3>
                    <p><strong>Betreff:</strong> ${ticketData.subject}</p>
                    <p><strong>Neuer Status:</strong> ${this.getStatusLabel(ticketData.status)}</p>
                    ${ticketData.assignedTo ? `<p><strong>Zugewiesen an:</strong> ${ticketData.assignedTo}</p>` : ''}
                    ${ticketData.editorName ? `<p><strong>Bearbeitet von:</strong> ${ticketData.editorName}</p>` : ''}
                </div>
                
                <h4>Update-Nachricht:</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${ticketData.updateMessage}</div>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateUpdateEmailText(ticketData: any): string {
    return `
BAU-STRUCTURA SUPPORT - TICKET UPDATE

Ticket #${ticketData.ticketId}
Betreff: ${ticketData.subject}
Neuer Status: ${this.getStatusLabel(ticketData.status)}
${ticketData.assignedTo ? `Zugewiesen an: ${ticketData.assignedTo}` : ''}
${ticketData.editorName ? `Bearbeitet von: ${ticketData.editorName}` : ''}

Update-Nachricht:
${ticketData.updateMessage}

Bau-Structura Support Team`;
  }

  private generateWelcomeEmailHtml(userData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .role-badge { display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚧 Willkommen bei Bau-Structura!</h1>
                <p>Ihr Account wurde erfolgreich erstellt</p>
            </div>
            <div class="content">
                <p>Hallo ${userData.firstName},</p>
                
                <p>herzlich willkommen bei Bau-Structura! Ihr Account wurde erfolgreich erstellt.</p>
                
                <p><strong>Ihre Rolle:</strong> <span class="role-badge">${this.getRoleLabel(userData.role)}</span></p>
                
                ${userData.password ? `
                <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">🔐 Ihre Anmeldedaten</h3>
                    <p><strong>Benutzername:</strong> ${userData.firstName}</p>
                    <p><strong>Temporäres Passwort:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${userData.password}</code></p>
                    <p style="color: #dc2626; font-size: 14px;"><strong>⚠️ Wichtig:</strong> Bitte ändern Sie Ihr Passwort bei der ersten Anmeldung!</p>
                </div>
                ` : ''}
                
                <div style="background: #e8f4fd; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">📂 Ihr persönlicher SFTP-Datei-Server</h3>
                    <p><strong>Für Sie wurde automatisch ein sicherer SFTP-Account vorbereitet:</strong></p>
                    <ul style="margin: 10px 0;">
                        <li><strong>Server:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px;">128.140.82.20</code></li>
                        <li><strong>Ihr Benutzer:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px;">baustructura_user_${userData.id || 'YOUR_ID'}</code></li>
                        <li><strong>Upload-Bereich:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 3px;">/var/ftp/user_${userData.id || 'YOUR_ID'}/uploads/</code></li>
                        <li><strong>Speicherplatz:</strong> 1GB (erweiterbar)</li>
                        <li><strong>Sicherheit:</strong> SSL/TLS-verschlüsselt, vollständig isoliert</li>
                    </ul>
                    
                    <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 15px; margin: 15px 0;">
                        <h4 style="color: #92400e; margin-top: 0;">🚀 So aktivieren Sie Ihren SFTP-Account:</h4>
                        <ol style="margin: 5px 0; color: #92400e;">
                            <li>Gehen Sie zu <strong>Profil → SFTP-Konfiguration</strong></li>
                            <li>Klicken Sie auf <strong>"Automatischen SFTP-Account erstellen"</strong></li>
                            <li>Ihre Zugangsdaten werden automatisch konfiguriert</li>
                            <li>Laden Sie Dateien direkt aus der App in Ihren sicheren Bereich hoch</li>
                        </ol>
                    </div>
                    
                    <p style="margin-bottom: 0; font-size: 14px; color: #6b7280;"><em>💡 Jeder Bau-Structura-Benutzer erhält einen komplett separaten, sicheren SFTP-Bereich. Ihre Daten sind vollständig von anderen Benutzern isoliert.</em></p>
                </div>

                <h3>🎯 Nächste Schritte:</h3>
                <ol>
                    <li>Loggen Sie sich in Ihr Dashboard ein</li>
                    <li>Vervollständigen Sie Ihr Profil</li>
                    <li><strong>Aktivieren Sie Ihren SFTP-Account</strong> (siehe oben)</li>
                    <li>Erstellen Sie Ihr erstes Projekt</li>
                    <li>Entdecken Sie die KI-gestützten Features</li>
                </ol>
                
                <h3>📱 App Installation (Empfohlen):</h3>
                <div style="background: #e0f2fe; border: 1px solid #b3e5fc; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <p><strong>Installieren Sie Bau-Structura als App auf Ihrem Gerät:</strong></p>
                    
                    <div style="margin: 15px 0;">
                        <h4 style="margin: 10px 0 5px 0; color: #0277bd;">📱 Smartphone (Android):</h4>
                        <ol style="margin: 5px 0; padding-left: 20px;">
                            <li>Website in Chrome öffnen</li>
                            <li>"Zur Startseite hinzufügen"-Banner erscheint</li>
                            <li>Auf "Installieren" tippen</li>
                        </ol>
                        
                        <h4 style="margin: 10px 0 5px 0; color: #0277bd;">🍎 iPhone/iPad:</h4>
                        <ol style="margin: 5px 0; padding-left: 20px;">
                            <li>Website in Safari öffnen</li>
                            <li>Teilen-Button (Quadrat mit Pfeil) antippen</li>
                            <li>"Zum Home-Bildschirm" wählen</li>
                        </ol>
                        
                        <h4 style="margin: 10px 0 5px 0; color: #0277bd;">💻 Desktop:</h4>
                        <ol style="margin: 5px 0; padding-left: 20px;">
                            <li>Website in Chrome/Edge öffnen</li>
                            <li>Installations-Symbol (⊕) in Adressleiste klicken</li>
                            <li>"Installieren" wählen</li>
                        </ol>
                    </div>
                    
                    <p style="margin: 10px 0; padding: 10px; background: #f1f8e9; border-radius: 4px; font-size: 14px;">
                        <strong>✅ Vorteile:</strong> Offline-Nutzung, kein Browser nötig, Shortcuts für Kamera/Karte/Projekte, Push-Benachrichtigungen
                    </p>
                </div>
                
                <h3>🆘 Benötigen Sie Hilfe?</h3>
                <p>Unser Support-Team steht Ihnen gerne zur Verfügung. Erstellen Sie einfach ein Support-Ticket in der App oder antworten Sie auf diese E-Mail.</p>
                
                <p>Viel Erfolg mit Bau-Structura!</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateWelcomeEmailText(userData: any): string {
    return `
WILLKOMMEN BEI BAU-STRUCTURA!

Hallo ${userData.firstName},

herzlich willkommen bei Bau-Structura! Ihr Account wurde erfolgreich erstellt.

Ihre Rolle: ${this.getRoleLabel(userData.role)}

${userData.password ? `
IHRE ANMELDEDATEN:
Benutzername: ${userData.firstName}
Temporäres Passwort: ${userData.password}

⚠️ WICHTIG: Bitte ändern Sie Ihr Passwort bei der ersten Anmeldung!
` : ''}

PERSÖNLICHER SFTP-DATEI-SERVER:
Für Sie wurde automatisch ein sicherer SFTP-Account vorbereitet:
- Server: 128.140.82.20
- Ihr Benutzer: baustructura_user_${userData.id || 'YOUR_ID'}
- Upload-Bereich: /var/ftp/user_${userData.id || 'YOUR_ID'}/uploads/
- Speicherplatz: 1GB (erweiterbar)
- Sicherheit: SSL/TLS-verschlüsselt, vollständig isoliert

So aktivieren Sie Ihren SFTP-Account:
1. Gehen Sie zu Profil → SFTP-Konfiguration
2. Klicken Sie auf "Automatischen SFTP-Account erstellen"
3. Ihre Zugangsdaten werden automatisch konfiguriert
4. Laden Sie Dateien direkt aus der App in Ihren sicheren Bereich hoch

💡 Jeder Bau-Structura-Benutzer erhält einen komplett separaten, sicheren SFTP-Bereich.

Nächste Schritte:
1. Loggen Sie sich in Ihr Dashboard ein
2. Vervollständigen Sie Ihr Profil  
3. Aktivieren Sie Ihren SFTP-Account (siehe oben)
4. Erstellen Sie Ihr erstes Projekt
5. Entdecken Sie die KI-gestützten Features

APP INSTALLATION (EMPFOHLEN):
Installieren Sie Bau-Structura als App auf Ihrem Gerät:

📱 Smartphone (Android):
1. Website in Chrome öffnen
2. "Zur Startseite hinzufügen"-Banner erscheint
3. Auf "Installieren" tippen

🍎 iPhone/iPad:
1. Website in Safari öffnen
2. Teilen-Button (Quadrat mit Pfeil) antippen
3. "Zum Home-Bildschirm" wählen

💻 Desktop:
1. Website in Chrome/Edge öffnen
2. Installations-Symbol (⊕) in Adressleiste klicken
3. "Installieren" wählen

✅ Vorteile: Offline-Nutzung, kein Browser nötig, Shortcuts für Kamera/Karte/Projekte, Push-Benachrichtigungen

Benötigen Sie Hilfe?
Unser Support-Team steht Ihnen gerne zur Verfügung. Erstellen Sie einfach ein Support-Ticket in der App oder antworten Sie auf diese E-Mail.

Viel Erfolg mit Bau-Structura!`;
  }

  private getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high': return '🔴 Hoch';
      case 'medium': return '🟡 Mittel';
      case 'low': return '🟢 Niedrig';
      default: return priority;
    }
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'open': return '📋 Offen';
      case 'in-progress': return '⚙️ In Bearbeitung';
      case 'resolved': return '✅ Gelöst';
      case 'closed': return '🔒 Geschlossen';
      default: return status;
    }
  }

  private generateFloodProtectionEmailHtml(emailData: any): string {
    const { message, checklist, schieber, schaeden, wachen } = emailData;
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .checklist-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .status-active { border-left: 4px solid #22c55e; }
            .status-warning { border-left: 4px solid #f97316; }
            .status-danger { border-left: 4px solid #ef4444; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .data-table th, .data-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .data-table th { background-color: #f1f5f9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌊 Hochwasserschutz-Checkliste</h1>
                <p>Automatischer E-Mail-Export</p>
            </div>
            <div class="content">
                <div class="checklist-info status-active">
                    <h2>${checklist.titel}</h2>
                    <p><strong>Typ:</strong> ${checklist.typ}</p>
                    <p><strong>Status:</strong> ${checklist.status}</p>
                    <p><strong>Erstellt von:</strong> ${checklist.erstellt_von}</p>
                    <p><strong>Fortschritt:</strong> ${checklist.aufgaben_erledigt || 0}/${checklist.aufgaben_gesamt || 11} Aufgaben</p>
                    ${checklist.beginn_pegelstand_cm ? `<p><strong>Pegelstand:</strong> ${checklist.beginn_pegelstand_cm} cm</p>` : ''}
                </div>
                
                <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px;">
                    <h3>💬 Nachricht</h3>
                    <p>${message}</p>
                </div>

                <div style="margin: 20px 0;">
                    <h3>🔧 Absperrschieber-Status</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nr.</th>
                                <th>Bezeichnung</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schieber.map((s: any) => `
                                <tr>
                                    <td>${s.nummer}</td>
                                    <td>${s.bezeichnung}</td>
                                    <td>${s.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                ${schaeden && schaeden.length > 0 ? `
                <div style="margin: 20px 0;">
                    <h3>⚠️ Schadensfälle</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Schieber</th>
                                <th>Problem</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schaeden.map((schaden: any) => `
                                <tr>
                                    <td>Nr. ${schaden.absperrschieber_nummer}</td>
                                    <td>${schaden.problem_beschreibung}</td>
                                    <td>${schaden.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                ${wachen && wachen.length > 0 ? `
                <div style="margin: 20px 0;">
                    <h3>👥 Deichwachen</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Bereich</th>
                                <th>Telefon</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${wachen.map((wache: any) => `
                                <tr>
                                    <td>${wache.name}</td>
                                    <td>${wache.bereich}</td>
                                    <td>${wache.telefon}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <div class="footer">
                    <p>Diese E-Mail wurde automatisch vom Bau-Structura Hochwasserschutz-System generiert.</p>
                    <p>Support: ${this.config.senderEmail}</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
  }

  private getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'user': return 'Benutzer';
      default: return role;
    }
  }

  async sendContactEmail(contactData: {
    name: string;
    email: string;
    company: string;
    subject: string;
    message: string;
    timestamp: string;
  }) {
    const mailOptions = {
      from: `"${contactData.name}" <${this.config.senderEmail}>`,
      to: 'support@bau-structura.de',
      replyTo: contactData.email,
      subject: `Kontaktanfrage: ${contactData.subject}`,
      html: this.generateContactEmailHtml(contactData),
      text: this.generateContactEmailText(contactData)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Kontaktformular E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Kontaktformular E-Mail Versand:', error);
      throw error;
    }
  }

  private generateContactEmailHtml(contactData: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
            .contact-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #22c55e; }
            .message-box { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border: 1px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 Neue Kontaktanfrage</h1>
                <p>Kontaktformular von der Bau-Structura Website</p>
            </div>
            <div class="content">
                <div class="contact-info">
                    <h3>Kontaktdaten</h3>
                    <p><strong>Name:</strong> ${contactData.name}</p>
                    <p><strong>E-Mail:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                    <p><strong>Unternehmen:</strong> ${contactData.company}</p>
                    <p><strong>Thema:</strong> ${contactData.subject}</p>
                    <p><strong>Zeitstempel:</strong> ${new Date(contactData.timestamp).toLocaleString('de-DE')}</p>
                </div>
                
                <h4>Nachricht:</h4>
                <div class="message-box">
                    <p style="white-space: pre-wrap; margin: 0;">${contactData.message}</p>
                </div>
                
                <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #0c4a6e;"><strong>💡 Tipp:</strong> Sie können direkt auf diese E-Mail antworten, um dem Kunden zu antworten.</p>
                </div>
            </div>
            <div class="footer">
                <p>Bau-Structura - Revolutionäres Projektmanagement für den Bau</p>
                <p>Diese E-Mail wurde automatisch vom Kontaktformular generiert.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateContactEmailText(contactData: any): string {
    return `
NEUE KONTAKTANFRAGE - BAU-STRUCTURA

Kontaktdaten:
Name: ${contactData.name}
E-Mail: ${contactData.email}
Unternehmen: ${contactData.company}
Thema: ${contactData.subject}
Zeitstempel: ${new Date(contactData.timestamp).toLocaleString('de-DE')}

Nachricht:
${contactData.message}

---
Diese E-Mail wurde automatisch vom Kontaktformular der Bau-Structura Website generiert.
Sie können direkt auf diese E-Mail antworten, um dem Kunden zu antworten.

Bau-Structura Support Team`;
  }

  async sendPasswordResetEmail(data: {
    to: string;
    firstName: string;
    resetToken: string;
    resetLink: string;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: data.to,
      subject: "🔒 Passwort zurücksetzen - Bau-Structura",
      html: this.generatePasswordResetEmailHtml(data),
      text: this.generatePasswordResetEmailText(data)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Passwort-Reset-E-Mail erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Passwort-Reset-E-Mail Versand:', error);
      throw error;
    }
  }

  async sendTrialReminderEmail(data: {
    to: string;
    firstName: string;
    daysRemaining: number;
    trialEndDate: Date;
  }) {
    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: data.to,
      subject: `🚨 Ihr Bau-Structura Testzeitraum läuft in ${data.daysRemaining} Tagen ab`,
      html: this.generateTrialReminderEmailHtml(data),
      text: this.generateTrialReminderEmailText(data)
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log('Testzeitraum-Erinnerung erfolgreich versendet:', response.messageId);
      return response;
    } catch (error) {
      console.error('Fehler beim Testzeitraum-Erinnerung Versand:', error);
      throw error;
    }
  }

  private generateTrialReminderEmailHtml(data: any): string {
    const formattedEndDate = new Date(data.trialEndDate).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .warning-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .license-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .price-box { background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center; }
            .cta-button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .countdown { font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Testzeitraum läuft ab!</h1>
                <p>Ihr Bau-Structura Account benötigt eine Lizenz</p>
            </div>
            
            <div class="content">
                <h2>Hallo ${data.firstName},</h2>
                
                <div class="warning-box">
                    <h3 style="color: #92400e; margin-top: 0;">🚨 Wichtige Erinnerung</h3>
                    <div class="countdown">${data.daysRemaining} Tage verbleibend</div>
                    <p><strong>Ihr kostenloser 30-Tage-Testzeitraum endet am ${formattedEndDate}.</strong></p>
                    <p>Um Bau-Structura weiterhin nutzen zu können, wählen Sie bitte eine unserer Lizenzoptionen:</p>
                </div>
                
                <h3>💼 Unsere Lizenzangebote</h3>
                
                <div class="price-box">
                    <h4 style="color: #1e40af; margin-top: 0;">🚀 Basic Lizenz</h4>
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 10px 0;">21€</div>
                    <p style="color: #64748b; font-size: 14px;">pro Monat</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>✅ Bis zu 10 Projekte</li>
                        <li>✅ Grundlegende Kundenverwaltung</li>
                        <li>✅ 1GB SFTP-Speicher</li>
                        <li>✅ GPS-Integration</li>
                        <li>✅ Mobile App</li>
                        <li>✅ E-Mail-Support</li>
                    </ul>
                    <a href="https://bau-structura.com/checkout/basic" class="cta-button">Basic wählen</a>
                </div>
                
                <div class="price-box">
                    <h4 style="color: #1e40af; margin-top: 0;">⭐ Professional Lizenz</h4>
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 10px 0;">39€</div>
                    <p style="color: #64748b; font-size: 14px;">pro Monat</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>✅ <strong>Unbegrenzte Projekte</strong></li>
                        <li>✅ Erweiterte Kundenverwaltung</li>
                        <li>✅ 10GB SFTP-Speicher</li>
                        <li>✅ KI-Assistent</li>
                        <li>✅ Hochwasserschutz-Modul</li>
                        <li>✅ Prioritäts-Support</li>
                        <li>✅ Team-Funktionen</li>
                    </ul>
                    <a href="https://bau-structura.com/checkout/professional" class="cta-button">Professional wählen</a>
                </div>
                
                <div class="price-box">
                    <h4 style="color: #1e40af; margin-top: 0;">🏢 Enterprise Lizenz</h4>
                    <div style="font-size: 32px; font-weight: bold; color: #1e40af; margin: 10px 0;">79€</div>
                    <p style="color: #64748b; font-size: 14px;">pro Monat</p>
                    <ul style="text-align: left; margin: 15px 0;">
                        <li>✅ <strong>Alle Professional Features</strong></li>
                        <li>✅ 100GB SFTP-Speicher</li>
                        <li>✅ White-Label-Option</li>
                        <li>✅ API-Zugang</li>
                        <li>✅ Dedizierter Account Manager</li>
                        <li>✅ 24/7 Premium Support</li>
                        <li>✅ On-Premise-Installation</li>
                    </ul>
                    <a href="https://bau-structura.com/checkout/enterprise" class="cta-button">Enterprise wählen</a>
                </div>
                
                <div class="license-box">
                    <h3 style="color: #1e40af; margin-top: 0;">🔒 Was passiert nach dem Testzeitraum?</h3>
                    <ul>
                        <li>📋 <strong>Ihre Daten bleiben sicher:</strong> Alle Projekte und Dokumente werden gespeichert</li>
                        <li>🚫 <strong>Zugriff pausiert:</strong> Login und neue Projekte sind nicht möglich</li>
                        <li>💾 <strong>SFTP-Server:</strong> Dateien bleiben 30 Tage gesichert</li>
                        <li>📧 <strong>Reaktivierung jederzeit:</strong> Lizenz buchen und sofort weiterarbeiten</li>
                    </ul>
                </div>
                
                <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #166534; margin-top: 0;">💡 Warum Bau-Structura?</h3>
                    <p style="color: #166534;">Sie haben in den letzten 2 Wochen die Vorteile unseres Systems kennengelernt:</p>
                    <ul style="color: #166534;">
                        <li>📱 <strong>Mobile-First:</strong> Perfekt für die Baustelle</li>
                        <li>🗺️ <strong>GPS & Karten:</strong> Präzise Projekterfassung</li>
                        <li>🤖 <strong>KI-Integration:</strong> Intelligente Projektberatung</li>
                        <li>🌊 <strong>Hochwasserschutz:</strong> Spezialisierte Tools</li>
                        <li>☁️ <strong>Cloud-Sicherheit:</strong> Ihre Daten sind geschützt</li>
                    </ul>
                </div>
                
                <p><strong>Haben Sie Fragen zu unseren Lizenzen?</strong></p>
                <p>Unser Support-Team hilft gerne bei der Auswahl der passenden Lizenz. Antworten Sie einfach auf diese E-Mail oder nutzen Sie den Chat in der App.</p>
                
                <p>Vielen Dank für Ihr Vertrauen in Bau-Structura!</p>
                <p><strong>Ihr Bau-Structura Team</strong></p>
            </div>
            
            <div class="footer">
                <p>Bau-Structura - Professionelles Bauprojekt-Management<br>
                Diese E-Mail wurde automatisch generiert. Bei Fragen kontaktieren Sie uns über die Anwendung.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateTrialReminderEmailText(data: any): string {
    const formattedEndDate = new Date(data.trialEndDate).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
⏰ TESTZEITRAUM LÄUFT AB - BAU-STRUCTURA

Hallo ${data.firstName},

🚨 WICHTIGE ERINNERUNG

${data.daysRemaining} Tage verbleibend

Ihr kostenloser 30-Tage-Testzeitraum endet am ${formattedEndDate}.

Um Bau-Structura weiterhin nutzen zu können, wählen Sie bitte eine unserer Lizenzoptionen:

💼 UNSERE LIZENZANGEBOTE

🚀 Basic Lizenz - 21€/Monat
✅ Bis zu 10 Projekte
✅ Grundlegende Kundenverwaltung  
✅ 1GB SFTP-Speicher
✅ GPS-Integration
✅ Mobile App
✅ E-Mail-Support
→ Lizenz wählen: https://bau-structura.com/checkout/basic

⭐ Professional Lizenz - 39€/Monat  
✅ Unbegrenzte Projekte
✅ Erweiterte Kundenverwaltung
✅ 10GB SFTP-Speicher
✅ KI-Assistent
✅ Hochwasserschutz-Modul
✅ Prioritäts-Support
✅ Team-Funktionen
→ Lizenz wählen: https://bau-structura.com/checkout/professional

🏢 Enterprise Lizenz - 79€/Monat
✅ Alle Professional Features
✅ 100GB SFTP-Speicher
✅ White-Label-Option
✅ API-Zugang
✅ Dedizierter Account Manager
✅ 24/7 Premium Support
✅ On-Premise-Installation
→ Lizenz wählen: https://bau-structura.com/checkout/enterprise

🔒 WAS PASSIERT NACH DEM TESTZEITRAUM?

📋 Ihre Daten bleiben sicher: Alle Projekte und Dokumente werden gespeichert
🚫 Zugriff pausiert: Login und neue Projekte sind nicht möglich
💾 SFTP-Server: Dateien bleiben 30 Tage gesichert
📧 Reaktivierung jederzeit: Lizenz buchen und sofort weiterarbeiten

💡 WARUM BAU-STRUCTURA?

Sie haben in den letzten 14 Tagen die Vorteile unseres Systems kennengelernt:
📱 Mobile-First: Perfekt für die Baustelle
🗺️ GPS & Karten: Präzise Projekterfassung
🤖 KI-Integration: Intelligente Projektberatung
🌊 Hochwasserschutz: Spezialisierte Tools
☁️ Cloud-Sicherheit: Ihre Daten sind geschützt

Haben Sie Fragen zu unseren Lizenzen?
Unser Support-Team hilft gerne bei der Auswahl der passenden Lizenz. 
Antworten Sie einfach auf diese E-Mail oder nutzen Sie den Chat in der App.

Vielen Dank für Ihr Vertrauen in Bau-Structura!

Ihr Bau-Structura Team

---
Bau-Structura - Professionelles Bauprojekt-Management
Diese E-Mail wurde automatisch generiert. Bei Fragen kontaktieren Sie uns über die Anwendung.
    `;
  }

  private generatePasswordResetEmailHtml(data: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .reset-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .cta-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 15px 0; color: #991b1b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Passwort zurücksetzen</h1>
                <p>Bau-Structura Account Sicherheit</p>
            </div>
            <div class="content">
                <p>Hallo ${data.firstName},</p>
                
                <p>Sie haben eine Anfrage zur Zurücksetzung Ihres Passworts für Ihren Bau-Structura Account gestellt.</p>
                
                <div class="reset-box">
                    <h3>🔑 Passwort zurücksetzen</h3>
                    <p>Klicken Sie auf den folgenden Button, um Ihr Passwort zurückzusetzen:</p>
                    <div style="text-align: center;">
                        <a href="${data.resetLink}" class="cta-button">Passwort jetzt zurücksetzen</a>
                    </div>
                </div>
                
                <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
                <p style="background: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 14px;">${data.resetLink}</p>
                
                <div class="warning">
                    <h4 style="margin-top: 0;">⚠️ Sicherheitshinweise:</h4>
                    <ul style="margin-bottom: 0;">
                        <li>Dieser Link ist nur 24 Stunden gültig</li>
                        <li>Der Link kann nur einmal verwendet werden</li>
                        <li>Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail</li>
                        <li>Teilen Sie diesen Link mit niemandem</li>
                    </ul>
                </div>
                
                <p style="margin-top: 30px;">Falls Sie Probleme haben, kontaktieren Sie unser Support-Team unter <a href="mailto:support@bau-structura.de">support@bau-structura.de</a></p>
                
                <p>Ihr Bau-Structura Support-Team</p>
            </div>
            <div class="footer">
                <p>Bau-Structura - Sicheres Projektmanagement für den Bau</p>
                <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generatePasswordResetEmailText(data: any): string {
    return `
PASSWORT ZURÜCKSETZEN - BAU-STRUCTURA

Hallo ${data.firstName},

Sie haben eine Anfrage zur Zurücksetzung Ihres Passworts für Ihren Bau-Structura Account gestellt.

🔑 PASSWORT ZURÜCKSETZEN:
Öffnen Sie den folgenden Link in Ihrem Browser, um Ihr Passwort zurückzusetzen:

${data.resetLink}

⚠️ SICHERHEITSHINWEISE:
- Dieser Link ist nur 24 Stunden gültig
- Der Link kann nur einmal verwendet werden  
- Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail
- Teilen Sie diesen Link mit niemandem

SUPPORT:
Falls Sie Probleme haben, kontaktieren Sie unser Support-Team unter support@bau-structura.de

Ihr Bau-Structura Support-Team

---
Bau-Structura - Sicheres Projektmanagement für den Bau
Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.`;
  }

  /**
   * SFTP-Willkommens-E-Mail nach Lizenz-Aktivierung
   */
  async sendSftpWelcomeEmail(data: {
    email: string;
    firstName: string;
    sftpHost: string;
    sftpPort: number;
    sftpUsername: string;
    sftpPassword: string;
    sftpPath: string;
    licenseType: string;
    storageLimit: number;
  }) {
    try {
      const mailOptions = {
        from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
        to: data.email,
        subject: '🎉 Ihr SFTP-Server ist bereit! - Bau-Structura',
        text: this.generateSftpWelcomeEmailText(data),
        html: this.generateSftpWelcomeEmailHtml(data)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ SFTP-Willkommens-E-Mail gesendet an ${data.email}`);
    } catch (error) {
      console.error('Fehler beim Senden der SFTP-Willkommens-E-Mail:', error);
      throw error;
    }
  }

  private generateSftpWelcomeEmailHtml(data: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials-box { background: #e8f4fd; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .warning-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .success-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            code { background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #1e40af; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Ihr SFTP-Server ist bereit!</h1>
                <p>Automatische Einrichtung abgeschlossen</p>
            </div>
            <div class="content">
                <p>Hallo ${data.firstName},</p>
                
                <p><strong>Herzlichen Glückwunsch!</strong> Ihre ${this.getLicenseLabel(data.licenseType)}-Lizenz wurde aktiviert und Ihr persönlicher SFTP-Server wurde automatisch eingerichtet.</p>
                
                <div class="success-box">
                    <h3 style="color: #059669; margin-top: 0;">✅ Was wurde für Sie erledigt:</h3>
                    <ul>
                        <li>🔧 SFTP-Account automatisch erstellt</li>
                        <li>🔒 Sichere Zugangsdaten generiert</li>
                        <li>📂 Persönlicher Upload-Bereich konfiguriert</li>
                        <li>🛡️ Vollständige Isolation von anderen Benutzern</li>
                        <li>💾 ${data.storageLimit}GB Speicherplatz zugewiesen</li>
                    </ul>
                </div>

                <div class="credentials-box">
                    <h3 style="color: #1e40af; margin-top: 0;">🔐 Ihre SFTP-Zugangsdaten</h3>
                    <p><strong>Server:</strong> <code>${data.sftpHost}:${data.sftpPort}</code></p>
                    <p><strong>Benutzername:</strong> <code>${data.sftpUsername}</code></p>
                    <p><strong>Passwort:</strong> <code>${data.sftpPassword}</code></p>
                    <p><strong>Upload-Pfad:</strong> <code>${data.sftpPath}</code></p>
                    <p><strong>Speicherplatz:</strong> <code>${data.storageLimit}GB</code></p>
                </div>

                <div class="warning-box">
                    <h3 style="color: #d97706; margin-top: 0;">🔒 Sicherheitshinweise</h3>
                    <ul style="color: #92400e;">
                        <li><strong>Bewahren Sie diese Zugangsdaten sicher auf!</strong></li>
                        <li>Verwenden Sie nur sichere FTP-Clients (FileZilla, WinSCP)</li>
                        <li>Ihre Daten sind komplett von anderen Benutzern isoliert</li>
                        <li>Der Server verwendet SSL/TLS-Verschlüsselung</li>
                    </ul>
                </div>

                <h3>🚀 So verwenden Sie Ihren SFTP-Server:</h3>
                <ol>
                    <li><strong>Über die App:</strong> Gehen Sie zu "Dokumente" → Upload-Bereich</li>
                    <li><strong>FTP-Client:</strong> Verwenden Sie die Zugangsdaten oben</li>
                    <li><strong>Automatisch:</strong> Fotos/Dateien werden automatisch hochgeladen</li>
                </ol>

                <h3>📊 Ihre Lizenz-Details:</h3>
                <p><strong>Lizenztyp:</strong> ${this.getLicenseLabel(data.licenseType)}</p>
                <p><strong>Speicherplatz:</strong> ${data.storageLimit}GB</p>
                <p><strong>Server-Standort:</strong> Hetzner Cloud, Deutschland (DSGVO-konform)</p>

                <h3>🆘 Support</h3>
                <p>Bei Fragen zu Ihrem SFTP-Server erstellen Sie gerne ein Support-Ticket in der App.</p>
                
                <p><strong>Viel Erfolg mit Ihrem neuen SFTP-Server!</strong></p>
            </div>
        </div>
    </body>
    </html>`;
  }

  private generateSftpWelcomeEmailText(data: any): string {
    return `
🎉 IHR SFTP-SERVER IST BEREIT! - BAU-STRUCTURA

Hallo ${data.firstName},

Herzlichen Glückwunsch! Ihre ${this.getLicenseLabel(data.licenseType)}-Lizenz wurde aktiviert und Ihr persönlicher SFTP-Server wurde automatisch eingerichtet.

IHRE SFTP-ZUGANGSDATEN:
Server: ${data.sftpHost}:${data.sftpPort}
Benutzername: ${data.sftpUsername}
Passwort: ${data.sftpPassword}
Upload-Pfad: ${data.sftpPath}
Speicherplatz: ${data.storageLimit}GB

🔒 SICHERHEITSHINWEISE:
- Bewahren Sie diese Zugangsdaten sicher auf!
- Verwenden Sie nur sichere FTP-Clients (FileZilla, WinSCP)
- Ihre Daten sind komplett von anderen Benutzern isoliert
- Der Server verwendet SSL/TLS-Verschlüsselung

🚀 SO VERWENDEN SIE IHREN SFTP-SERVER:
1. Über die App: Gehen Sie zu "Dokumente" → Upload-Bereich
2. FTP-Client: Verwenden Sie die Zugangsdaten oben
3. Automatisch: Fotos/Dateien werden automatisch hochgeladen

Bei Fragen erstellen Sie gerne ein Support-Ticket in der App.

Viel Erfolg mit Ihrem neuen SFTP-Server!

Bau-Structura Team`;
  }

  private getLicenseLabel(licenseType: string): string {
    switch (licenseType) {
      case 'basic': return 'Basic';
      case 'professional': return 'Professional';
      case 'enterprise': return 'Enterprise';
      default: return licenseType;
    }
  }
}

export const emailService = new EmailService();