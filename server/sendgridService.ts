import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY environment variable not set");
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY nicht verfügbar');
      return false;
    }

    const msg: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };

    if (params.text) {
      msg.text = params.text;
    }
    if (params.html) {
      msg.html = params.html;
    }
    if (params.attachments && params.attachments.length > 0) {
      msg.attachments = params.attachments;
    }

    await sgMail.send(msg as any);
    console.log('E-Mail erfolgreich gesendet an:', params.to);
    return true;
  } catch (error: any) {
    console.error('=== SendGrid E-Mail-Fehler ===');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Response:', error.response);
    if (error.response?.body) {
      console.error('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    if (error.response?.headers) {
      console.error('Response Headers:', error.response.headers);
    }
    console.error('=== Ende SendGrid Fehler ===');
    
    return false;
  }
}

export async function sendFloodProtectionEmail(params: {
  to: string;
  subject: string;
  message: string;
  checklist: any;
  schieber: any[];
  schaeden?: any[];
  wachen?: any[];
  includePdf?: boolean;
  fromEmail?: string;
  fromName?: string;
}): Promise<boolean> {
  try {
    const emailText = `
${params.message}

--- Hochwasserschutz-Checklisten-Details ---
Titel: ${params.checklist.titel}
Typ: ${params.checklist.typ}
Status: ${params.checklist.status}
Erstellt von: ${params.checklist.erstellt_von}
Fortschritt: ${params.checklist.aufgaben_erledigt || 0}/${params.checklist.aufgaben_gesamt || 11} Aufgaben
${params.checklist.beginn_pegelstand_cm ? `Pegelstand: ${params.checklist.beginn_pegelstand_cm} cm` : ''}

Absperrschieber-Status:
${params.schieber.map(s => `- Nr. ${s.nummer}: ${s.bezeichnung} (${s.funktionsfaehig ? 'Funktionsfähig' : 'Wartung erforderlich'})`).join('\n')}

${params.schaeden && params.schaeden.length > 0 ? `
Schadensfälle:
${params.schaeden.map(schaden => `- Schieber ${schaden.absperrschieber_nummer}: ${schaden.problem_beschreibung} (${schaden.status})`).join('\n')}
` : ''}

${params.wachen && params.wachen.length > 0 ? `
Deichwachen:
${params.wachen.map(wache => `- ${wache.name} (${wache.telefon}): ${wache.bereich}`).join('\n')}
` : ''}

---
Diese E-Mail wurde automatisch generiert vom Bau-Structura Hochwasserschutz-System.
Gesendet am: ${new Date().toLocaleString('de-DE')}
    `;

    const emailHtml = `
      <h2>Hochwasserschutz-Checkliste</h2>
      <p>${params.message}</p>
      
      <h3>Checklisten-Details</h3>
      <ul>
        <li><strong>Titel:</strong> ${params.checklist.titel}</li>
        <li><strong>Typ:</strong> ${params.checklist.typ}</li>
        <li><strong>Status:</strong> ${params.checklist.status}</li>
        <li><strong>Erstellt von:</strong> ${params.checklist.erstellt_von}</li>
        <li><strong>Fortschritt:</strong> ${params.checklist.aufgaben_erledigt || 0}/${params.checklist.aufgaben_gesamt || 11} Aufgaben</li>
        ${params.checklist.beginn_pegelstand_cm ? `<li><strong>Pegelstand:</strong> ${params.checklist.beginn_pegelstand_cm} cm</li>` : ''}
      </ul>
      
      <h3>Absperrschieber-Status</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">Nr.</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Bezeichnung</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Lage</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${params.schieber.map(s => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${s.nummer}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${s.bezeichnung}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${s.lage}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${s.funktionsfaehig ? '✓ Funktionsfähig' : '⚠ Wartung erforderlich'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${params.schaeden && params.schaeden.length > 0 ? `
        <h3>Schadensfälle</h3>
        <ul>
          ${params.schaeden.map(schaden => `<li>Schieber ${schaden.absperrschieber_nummer}: ${schaden.problem_beschreibung} (${schaden.status})</li>`).join('')}
        </ul>
      ` : ''}
      
      ${params.wachen && params.wachen.length > 0 ? `
        <h3>Deichwachen</h3>
        <ul>
          ${params.wachen.map(wache => `<li>${wache.name} (${wache.telefon}): ${wache.bereich}</li>`).join('')}
        </ul>
      ` : ''}
      
      <hr>
      <p><small>Diese E-Mail wurde automatisch generiert vom Bau-Structura Hochwasserschutz-System.<br>
      Gesendet am: ${new Date().toLocaleString('de-DE')}</small></p>
    `;

    const msg = {
      to: params.to,
      from: params.fromEmail || 'lea.zimmer@sachverstandigenburojustiti.onmicrosoft.com',
      subject: params.subject,
      text: emailText,
      html: emailHtml
    };

    await sgMail.send(msg as any);
    console.log('Hochwasserschutz-E-Mail erfolgreich gesendet an:', params.to);
    return true;
  } catch (error: any) {
    console.error('=== SendGrid Hochwasserschutz E-Mail-Fehler ===');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Response:', error.response);
    if (error.response?.body) {
      console.error('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    console.error('=== Ende Hochwasserschutz E-Mail Fehler ===');
    return false;
  }
}