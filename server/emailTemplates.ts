// E-Mail Templates für BREVO/Nodemailer
export const emailTemplates = {
  ticketCreated: (data: { ticketId: number; subject: string; description: string; priority: string }) => ({
    html: `
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
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🚧 Bau-Structura Support</h1>
                  <p>Neues Support Ticket erstellt</p>
              </div>
              <div class="content">
                  <div class="ticket-info priority-${data.priority}">
                      <h3>Ticket #${data.ticketId}</h3>
                      <p><strong>Betreff:</strong> ${data.subject}</p>
                      <p><strong>Priorität:</strong> ${getPriorityLabel(data.priority)}</p>
                  </div>
                  <h4>Beschreibung:</h4>
                  <div style="background: white; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${data.description}</div>
                  <p style="margin-top: 20px;">Unser Support-Team kümmert sich schnellstmöglich um Ihr Anliegen.</p>
              </div>
          </div>
      </body>
      </html>`,
    text: `BAU-STRUCTURA SUPPORT\n\nTicket #${data.ticketId}\nBetreff: ${data.subject}\nPriorität: ${getPriorityLabel(data.priority)}\n\nBeschreibung:\n${data.description}\n\nUnser Team kümmert sich um Ihr Anliegen.`
  }),

  welcome: (data: { firstName: string; role: string }) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
              .role-badge { display: inline-block; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🚧 Willkommen bei Bau-Structura!</h1>
              </div>
              <div class="content">
                  <p>Hallo ${data.firstName},</p>
                  <p>herzlich willkommen bei Bau-Structura! Ihr Account wurde erfolgreich erstellt.</p>
                  <p><strong>Ihre Rolle:</strong> <span class="role-badge">${getRoleLabel(data.role)}</span></p>
                  <h3>🎯 Nächste Schritte:</h3>
                  <ol>
                      <li>Loggen Sie sich in Ihr Dashboard ein</li>
                      <li>Vervollständigen Sie Ihr Profil</li>
                      <li>Erstellen Sie Ihr erstes Projekt</li>
                  </ol>
              </div>
          </div>
      </body>
      </html>`,
    text: `Willkommen bei Bau-Structura!\n\nHallo ${data.firstName},\n\nherzlich willkommen! Ihr Account wurde erstellt.\nRolle: ${getRoleLabel(data.role)}\n\nViel Erfolg!`
  })
};

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high': return '🔴 Hoch';
    case 'medium': return '🟡 Mittel';
    case 'low': return '🟢 Niedrig';
    default: return priority;
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'manager': return 'Manager';
    case 'user': return 'Benutzer';
    default: return role;
  }
}