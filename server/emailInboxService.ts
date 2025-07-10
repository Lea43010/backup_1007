import axios from 'axios';
import { ConfidentialClientApplication } from '@azure/msal-node';

interface EmailMessage {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  receivedDateTime: string;
  bodyPreview: string;
  isRead: boolean;
  hasAttachments: boolean;
  conversationId: string;
  body?: {
    content: string;
    contentType: string;
  };
}

interface InboxConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  userEmail: string;
}

class EmailInboxService {
  private msalInstance: ConfidentialClientApplication;
  private config: InboxConfig;

  constructor() {
    this.config = {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      tenantId: process.env.MICROSOFT_TENANT_ID || '',
      userEmail: process.env.SUPPORT_EMAIL || 'support@bau-structura.de'
    };

    // Only initialize MSAL if all credentials are provided
    if (this.config.clientId && this.config.clientSecret && this.config.tenantId) {
      this.msalInstance = new ConfidentialClientApplication({
        auth: {
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
          authority: `https://login.microsoftonline.com/${this.config.tenantId}`
        }
      });
    }
  }

  async getAccessToken(): Promise<string> {
    if (!this.msalInstance) {
      throw new Error('Microsoft Graph API not configured - missing credentials');
    }

    try {
      const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const response = await this.msalInstance.acquireTokenByClientCredential(clientCredentialRequest);
      
      if (!response?.accessToken) {
        throw new Error('Failed to acquire access token');
      }

      return response.accessToken;
    } catch (error) {
      console.error('Error acquiring access token:', error);
      throw error;
    }
  }

  async getInboxMessages(limit: number = 20, unreadOnly: boolean = false): Promise<EmailMessage[]> {
    // Check if Microsoft credentials are configured
    if (!this.config.clientId || !this.config.clientSecret || !this.config.tenantId) {
      console.log('Microsoft 365 nicht konfiguriert - verwende Demo-Daten');
      return this.getDemoMessages();
    }

    try {
      const accessToken = await this.getAccessToken();
      
      let filterQuery = '';
      if (unreadOnly) {
        filterQuery = '?$filter=isRead eq false';
      }
      
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages${filterQuery}&$top=${limit}&$orderby=receivedDateTime desc`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.value.map((msg: any) => ({
        id: msg.id,
        subject: msg.subject || '(Kein Betreff)',
        from: {
          name: msg.from?.emailAddress?.name || 'Unbekannt',
          email: msg.from?.emailAddress?.address || ''
        },
        receivedDateTime: msg.receivedDateTime,
        bodyPreview: msg.bodyPreview || '',
        isRead: msg.isRead,
        hasAttachments: msg.hasAttachments,
        conversationId: msg.conversationId
      }));
    } catch (error) {
      console.error('Microsoft Graph API Fehler:', error);
      
      // Fallback zu Demo-Daten
      console.log('Verwende Demo-Daten aufgrund von API-Fehlern');
      return this.getDemoMessages();
    }
  }

  async getMessageById(messageId: string): Promise<EmailMessage | null> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages/${messageId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const msg = response.data;
      return {
        id: msg.id,
        subject: msg.subject || '(Kein Betreff)',
        from: {
          name: msg.from?.emailAddress?.name || 'Unbekannt',
          email: msg.from?.emailAddress?.address || ''
        },
        receivedDateTime: msg.receivedDateTime,
        bodyPreview: msg.bodyPreview || '',
        isRead: msg.isRead,
        hasAttachments: msg.hasAttachments,
        conversationId: msg.conversationId,
        body: {
          content: msg.body?.content || '',
          contentType: msg.body?.contentType || 'text'
        }
      };
    } catch (error) {
      console.error('Error fetching message by ID:', error);
      return null;
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages/${messageId}`;
      
      await axios.patch(url, 
        { isRead: true },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  async replyToMessage(messageId: string, replyContent: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}/messages/${messageId}/reply`;
      
      const replyData = {
        message: {
          body: {
            contentType: 'HTML',
            content: replyContent
          }
        }
      };

      await axios.post(url, replyData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return true;
    } catch (error) {
      console.error('Error replying to message:', error);
      return false;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; userInfo?: any }> {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.tenantId) {
      return {
        success: false,
        message: 'Microsoft 365 Credentials nicht konfiguriert - Demo-Modus aktiv'
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const url = `https://graph.microsoft.com/v1.0/users/${this.config.userEmail}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: 'Microsoft Graph API Verbindung erfolgreich',
        userInfo: {
          displayName: response.data.displayName,
          mail: response.data.mail,
          userPrincipalName: response.data.userPrincipalName
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Verbindungsfehler: ${error.message}`
      };
    }
  }

  private getDemoMessages(): EmailMessage[] {
    const now = new Date();
    return [
      {
        id: 'demo-' + Date.now() + '-1',
        subject: 'Kontaktanfrage: Projektmanagement für Bauvorhaben',
        from: {
          name: 'Maria Schmidt',
          email: 'maria.schmidt@bauunternehmen-nord.de'
        },
        receivedDateTime: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
        bodyPreview: 'Guten Tag, wir suchen ein professionelles Projektmanagement-Tool für unsere Bauvorhaben. Können Sie uns die Professional-Lizenz genauer erklären?',
        isRead: false,
        hasAttachments: false,
        conversationId: 'conv-' + Date.now() + '-1',
        body: {
          content: 'Guten Tag,\n\nwir sind ein mittelständisches Bauunternehmen mit 25 Mitarbeitern und suchen ein professionelles Tool für unser Projektmanagement.\n\nBesonders interessiert uns:\n- GPS-Integration für Baustellen\n- Dokumentenverwaltung\n- Mobile Nutzung\n\nKönnen Sie uns die Professional-Lizenz genauer erklären und eventuell eine Demo anbieten?\n\nVielen Dank!\nMaria Schmidt',
          contentType: 'text'
        }
      },
      {
        id: 'demo-' + Date.now() + '-2',
        subject: 'Problem mit Kamera-Funktion',
        from: {
          name: 'Stefan Müller',
          email: 'stefan.mueller@bau-technik.com'
        },
        receivedDateTime: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        bodyPreview: 'Hallo Support-Team, ich habe Probleme mit der Kamera-Funktion. Die GPS-Daten werden nicht korrekt zu den Fotos hinzugefügt...',
        isRead: true,
        hasAttachments: false,
        conversationId: 'conv-' + Date.now() + '-2',
        body: {
          content: 'Hallo Support-Team,\n\nich nutze Bau-Structura seit 2 Wochen und bin grundsätzlich sehr zufrieden. Allerdings habe ich ein Problem mit der Kamera-Funktion:\n\nDie GPS-Koordinaten werden nicht korrekt zu den Fotos hinzugefügt. Manchmal sind sie komplett falsch, manchmal fehlen sie ganz.\n\nIch nutze die App auf einem Samsung Galaxy S21.\n\nKönnen Sie mir helfen?\n\nBeste Grüße\nStefan Müller',
          contentType: 'text'
        }
      },
      {
        id: 'demo-' + Date.now() + '-3',
        subject: 'Anfrage Enterprise-Lizenz für Baukonzern',
        from: {
          name: 'Dr. Andreas Weber',
          email: 'andreas.weber@mega-bau-gruppe.de'
        },
        receivedDateTime: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        bodyPreview: 'Sehr geehrte Damen und Herren, wir sind ein großer Baukonzern mit über 500 Mitarbeitern und interessieren uns für eine Enterprise-Lösung...',
        isRead: false,
        hasAttachments: true,
        conversationId: 'conv-' + Date.now() + '-3',
        body: {
          content: 'Sehr geehrte Damen und Herren,\n\nwir sind die MEGA Bau Gruppe mit über 500 Mitarbeitern deutschlandweit und ca. 150 parallel laufenden Projekten.\n\nWir interessieren uns für eine Enterprise-Lösung von Bau-Structura mit folgenden Anforderungen:\n\n- Multi-Tenant-Fähigkeit\n- Zentrale Verwaltung aller Projekte\n- API-Integration in unsere bestehende ERP-Software\n- Dedicated Support\n- On-Premise Installation möglich?\n\nKönnen Sie uns ein individuelles Angebot unterbreiten? Gerne auch mit Proof-of-Concept.\n\nMit freundlichen Grüßen\nDr. Andreas Weber\nCTO, MEGA Bau Gruppe',
          contentType: 'text'
        }
      },
      {
        id: 'demo-' + Date.now() + '-4',
        subject: 'Positive Rückmeldung und Feature-Wunsch',
        from: {
          name: 'Jennifer Klein',
          email: 'jennifer.klein@klein-bauservice.de'
        },
        receivedDateTime: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
        bodyPreview: 'Liebes Bau-Structura Team, wir nutzen eure Software seit 3 Monaten und sind sehr zufrieden! Ein kleiner Feature-Wunsch...',
        isRead: true,
        hasAttachments: false,
        conversationId: 'conv-' + Date.now() + '-4',
        body: {
          content: 'Liebes Bau-Structura Team,\n\nwir nutzen eure Software seit 3 Monaten und sind sehr zufrieden! Die intuitive Bedienung und die GPS-Integration haben unsere Arbeitsabläufe deutlich verbessert.\n\nEin kleiner Feature-Wunsch: Könntet ihr eine Zeiterfassung pro Projekt einbauen? Das würde uns bei der Kalkulation sehr helfen.\n\nAnsonsten: Weiter so! 👍\n\nLiebe Grüße\nJennifer Klein\nGeschäftsführerin Klein Bauservice',
          contentType: 'text'
        }
      }
    ];
  }
}

export const emailInboxService = new EmailInboxService();