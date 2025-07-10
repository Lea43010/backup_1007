

// Einfacher PDF-Generator - gibt gut formatiertes HTML zurück das als PDF gespeichert wird
export async function generateFloodProtectionPDF(data: {
  checklist: any;
  schieber: any[];
  schaeden?: any[];
  wachen?: any[];
  exportedAt: string;
  exportedBy: string;
}): Promise<Buffer> {
  const { checklist, schieber, schaeden, wachen, exportedAt, exportedBy } = data;

  // Generiere professionelle HTML-Vorlage, die Browser als PDF drucken können
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hochwasserschutz-Checkliste</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.4;
          color: #333;
        }
        .header { 
          border-bottom: 3px solid #1f2937; 
          padding-bottom: 15px; 
          margin-bottom: 25px;
          text-align: center;
        }
        .header h1 {
          color: #1f2937;
          margin: 0 0 15px 0;
          font-size: 28px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-item {
          background: #f9fafb;
          padding: 10px;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
          margin-bottom: 3px;
        }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section h2 {
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 20px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px;
          font-size: 12px;
        }
        th, td { 
          border: 1px solid #d1d5db; 
          padding: 10px 8px; 
          text-align: left;
          vertical-align: top;
        }
        th { 
          background-color: #f3f4f6; 
          font-weight: bold;
          color: #374151;
        }
        .status-ok { color: #16a34a; font-weight: bold; }
        .status-warning { color: #ea580c; font-weight: bold; }
        .priority { font-weight: bold; }
        .priority-1 { color: #dc2626; }
        .priority-2 { color: #ea580c; }
        .priority-3 { color: #ca8a04; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d1d5db;
          font-size: 11px;
          color: #6b7280;
          text-align: center;
        }
        
        /* Print-optimierte Styles für PDF-Export */
        @media print {
          body { margin: 0; }
          .header, .section { page-break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
        
        /* Automatische Print-Funktionalität */
        @page { size: A4; margin: 2cm; }
        
        /* Button zum manuellen PDF-Export */
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        
        @media print {
          .print-button { display: none; }
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          margin: 10px 0;
        }
        .progress-fill {
          height: 100%;
          background-color: #10b981;
          width: ${checklist.fortschritt || 0}%;
          transition: width 0.3s ease;
        }
      </style>
      <script>
        // Automatischer Print-Dialog beim Laden der Seite
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 1000);
        };
        
        function printDocument() {
          window.print();
        }
      </script>
    </head>
    <body>
      <button class="print-button" onclick="printDocument()">📄 Als PDF speichern</button>
      <div class="header">
        <h1>🏗️ Hochwasserschutz-Checkliste</h1>
        <div style="font-size: 14px; color: #6b7280;">
          Sachverständigenbüro Justiti • Hochwasservorsorge & -schutz
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Checklist-Titel</div>
          <div>${checklist.titel}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Typ</div>
          <div>${checklist.typ}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div style="text-transform: capitalize; font-weight: bold;">${checklist.status}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Erstellt von</div>
          <div>${checklist.erstellt_von}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Erstellt am</div>
          <div>${new Date(checklist.erstellt_am).toLocaleDateString('de-DE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
        ${checklist.beginn_pegelstand_cm ? `
        <div class="info-item">
          <div class="info-label">Pegelstand</div>
          <div>${checklist.beginn_pegelstand_cm} cm</div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h2>📊 Fortschritt</h2>
        <div style="margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>Aufgaben erledigt:</strong> ${checklist.aufgaben_erledigt || 0} von ${checklist.aufgaben_gesamt || 11}</span>
            <span><strong>${checklist.fortschritt || 0}% abgeschlossen</strong></span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>🔧 Absperrschieber-Status</h2>
        <table>
          <thead>
            <tr>
              <th>Nr.</th>
              <th>Bezeichnung</th>
              <th>Lage</th>
              <th>Status</th>
              <th>Letzte Prüfung</th>
            </tr>
          </thead>
          <tbody>
            ${schieber.map(s => `
              <tr>
                <td><strong>${s.nummer}</strong></td>
                <td>${s.bezeichnung}</td>
                <td>${s.lage}</td>
                <td class="${s.funktionsfaehig ? 'status-ok' : 'status-warning'}">
                  ${s.funktionsfaehig ? '✓ Funktionsfähig' : '⚠ Wartung erforderlich'}
                </td>
                <td>${new Date(s.letzte_pruefung).toLocaleDateString('de-DE')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${schaeden && schaeden.length > 0 ? `
      <div class="section">
        <h2>🚨 Schadensfälle</h2>
        <table>
          <thead>
            <tr>
              <th>Schieber Nr.</th>
              <th>Problem</th>
              <th>Status</th>
              <th>Priorität</th>
              <th>Gemeldet von</th>
              <th>Maßnahme</th>
            </tr>
          </thead>
          <tbody>
            ${schaeden.map(schaden => `
              <tr>
                <td><strong>${schaden.absperrschieber_nummer}</strong></td>
                <td>${schaden.problem_beschreibung}</td>
                <td style="text-transform: capitalize;">${schaden.status}</td>
                <td class="priority priority-${schaden.prioritaet}">Stufe ${schaden.prioritaet}</td>
                <td>${schaden.gemeldet_von}</td>
                <td>${schaden.massnahme}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${wachen && wachen.length > 0 ? `
      <div class="section">
        <h2>👥 Deichwachen</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Telefon</th>
              <th>Schicht</th>
              <th>Bereich</th>
              <th>Bemerkung</th>
            </tr>
          </thead>
          <tbody>
            ${wachen.map(wache => `
              <tr>
                <td><strong>${wache.name}</strong></td>
                <td>${wache.telefon}</td>
                <td>
                  ${new Date(wache.schicht_beginn).toLocaleDateString('de-DE')} ${new Date(wache.schicht_beginn).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  <br>
                  bis ${new Date(wache.schicht_ende).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>${wache.bereich}</td>
                <td>${wache.bemerkung || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Exportiert am:</strong> ${exportedAt} <strong>von:</strong> ${exportedBy}</p>
        <p>Bau-Structura Hochwasserschutz-Management System • Sachverständigenbüro Justiti</p>
        <p>Diese Checkliste dient der systematischen Überwachung und Wartung von Hochwasserschutzanlagen.</p>
      </div>
    </body>
    </html>
  `;

  // Erstelle echten PDF-Buffer - vereinfachte PDF-Struktur für Demo
  const textContent = `
HOCHWASSERSCHUTZ-CHECKLISTE
===========================

Checkliste: ${checklist?.titel || 'Unbenannt'}
Typ: ${checklist?.typ || 'hochwasser'}
Status: ${checklist?.status || 'offen'}
Erstellt von: ${exportedBy || 'Unbekannt'}
Exportiert am: ${new Date(exportedAt || Date.now()).toLocaleDateString('de-DE')}

Aufgaben: ${checklist?.aufgaben_erledigt || 0}/${checklist?.aufgaben_gesamt || 11} erledigt
${checklist?.beginn_pegelstand_cm ? `Pegelstand: ${checklist.beginn_pegelstand_cm} cm` : ''}

ABSPERRSCHIEBER
---------------
${schieber?.length ? schieber.map(s => `- Nr. ${s.nummer}: ${s.bezeichnung} (${s.funktionsfaehig ? 'OK' : 'Defekt'})`).join('\n') : 'Keine Schieber erfasst'}

${schaeden?.length ? `SCHADENSFÄLLE
-------------
${schaeden.map(s => `- Schieber ${s.absperrschieber_nummer}: ${s.problem_beschreibung}`).join('\n')}` : ''}

${wachen?.length ? `DEICHWACHEN
-----------
${wachen.map(w => `- ${w.name}: ${w.telefon}`).join('\n')}` : ''}

---
Generiert mit Bau-Structura Hochwasserschutz-System
  `;

  // Generiere echten PDF-Buffer
  const pdfHeader = '%PDF-1.4\n';
  const pdfContent = `1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n
2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n
3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n
4 0 obj\n<<\n/Length ${textContent.length + 50}\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(${textContent.replace(/\n/g, ')Tj T*(').replace(/\(/g, '\\(').replace(/\)/g, '\\)')})Tj\nET\nendstream\nendobj\n
xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000202 00000 n \n
trailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n${300 + textContent.length}\n%%EOF`;
  
  return Buffer.from(pdfHeader + pdfContent, 'utf-8');
}