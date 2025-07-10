import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

export class AzureBackupService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private containerName: string;

  constructor() {
    // Azure Storage-Konfiguration
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_BACKUP_CONTAINER || 'bau-structura-backups';

    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }

  /**
   * Initialisiert den Azure Blob Container (falls noch nicht vorhanden)
   */
  async initializeContainer(): Promise<void> {
    try {
      const createContainerResponse = await this.containerClient.createIfNotExists();

      if (createContainerResponse.succeeded) {
        console.log(`Azure Container '${this.containerName}' erfolgreich erstellt oder bereits vorhanden`);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Azure Containers:', error);
      throw new Error('Azure Container-Initialisierung fehlgeschlagen');
    }
  }

  /**
   * Lädt ein Backup als SQL-Datei in Azure Blob Storage hoch
   */
  async uploadBackup(backupId: string, sqlContent: string): Promise<{
    success: boolean;
    blobUrl: string;
    size: number;
  }> {
    try {
      // Stelle sicher, dass Container existiert
      await this.initializeContainer();

      const blobName = `${backupId}.sql`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Konvertiere SQL-Content zu Buffer
      const data = Buffer.from(sqlContent, 'utf8');

      // Upload mit Metadaten
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: 'application/sql',
          blobContentDisposition: `attachment; filename="${blobName}"`
        },
        metadata: {
          backupId: backupId,
          created: new Date().toISOString(),
          source: 'Bau-Structura-System',
          version: '1.0',
          type: 'database-backup'
        },
        tags: {
          'system': 'bau-structura',
          'type': 'backup',
          'format': 'sql',
          'retention': '30-days'
        }
      };

      const uploadResponse = await blockBlobClient.upload(data, data.length, uploadOptions);

      if (uploadResponse.errorCode) {
        throw new Error(`Azure Upload Fehler: ${uploadResponse.errorCode}`);
      }

      console.log(`Backup ${backupId} erfolgreich zu Azure Blob Storage hochgeladen:`, {
        container: this.containerName,
        blob: blobName,
        size: `${(data.length / 1024).toFixed(2)} KB`,
        etag: uploadResponse.etag
      });

      return {
        success: true,
        blobUrl: blockBlobClient.url,
        size: data.length
      };

    } catch (error) {
      console.error('Azure Backup Upload fehlgeschlagen:', error);
      throw new Error(`Azure Upload fehlgeschlagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Listet verfügbare Backups in Azure Blob Storage auf
   */
  async listBackups(limit: number = 50): Promise<Array<{
    name: string;
    backupId: string;
    created: string;
    size: number;
    url: string;
  }>> {
    try {
      await this.initializeContainer();

      const backups = [];
      const listBlobsOptions = {
        includeMetadata: true,
        includeTags: true
      };

      for await (const blob of this.containerClient.listBlobsFlat(listBlobsOptions)) {
        if (blob.name.endsWith('.sql') && backups.length < limit) {
          backups.push({
            name: blob.name,
            backupId: blob.metadata?.backupId || blob.name.replace('.sql', ''),
            created: blob.metadata?.created || blob.properties.createdOn?.toISOString() || '',
            size: blob.properties.contentLength || 0,
            url: this.containerClient.getBlockBlobClient(blob.name).url
          });
        }
      }

      // Sortiere nach Erstellungsdatum (neueste zuerst)
      return backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    } catch (error) {
      console.error('Fehler beim Auflisten der Azure Backups:', error);
      throw new Error(`Azure Backup-Liste abrufen fehlgeschlagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lädt ein Backup von Azure Blob Storage herunter
   */
  async downloadBackup(backupId: string): Promise<string> {
    try {
      const blobName = `${backupId}.sql`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      const downloadResponse = await blockBlobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error('Backup-Download-Stream nicht verfügbar');
      }

      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks).toString('utf8');

    } catch (error) {
      console.error('Azure Backup Download fehlgeschlagen:', error);
      throw new Error(`Azure Download fehlgeschlagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Löscht alte Backups (Retention-Management)
   */
  async cleanupOldBackups(retentionDays: number = 30): Promise<{
    deleted: number;
    errors: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      let deleted = 0;
      let errors = 0;

      for await (const blob of this.containerClient.listBlobsFlat({ includeMetadata: true })) {
        if (blob.name.endsWith('.sql')) {
          const blobDate = new Date(blob.metadata?.created || blob.properties.createdOn || 0);
          
          if (blobDate < cutoffDate) {
            try {
              await this.containerClient.deleteBlob(blob.name);
              deleted++;
              console.log(`Altes Backup gelöscht: ${blob.name}`);
            } catch (deleteError) {
              errors++;
              console.error(`Fehler beim Löschen von ${blob.name}:`, deleteError);
            }
          }
        }
      }

      return { deleted, errors };

    } catch (error) {
      console.error('Backup-Cleanup fehlgeschlagen:', error);
      throw new Error(`Backup-Cleanup fehlgeschlagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prüft die Azure-Verbindung und Container-Zugriff
   */
  async testConnection(): Promise<{
    connected: boolean;
    containerExists: boolean;
    permissions: string[];
    error?: string;
  }> {
    try {
      // Teste Service-Verbindung
      const serviceProperties = await this.blobServiceClient.getProperties();
      
      // Teste Container-Zugriff
      const containerExists = await this.containerClient.exists();
      
      // Teste Berechtigungen
      const permissions = [];
      
      try {
        await this.containerClient.getProperties();
        permissions.push('read');
      } catch {}
      
      try {
        // Test-Blob erstellen und löschen
        const testBlob = this.containerClient.getBlockBlobClient('connection-test.txt');
        await testBlob.upload('test', 4);
        await testBlob.delete();
        permissions.push('write', 'delete');
      } catch {}

      return {
        connected: true,
        containerExists: containerExists,
        permissions: permissions
      };

    } catch (error) {
      return {
        connected: false,
        containerExists: false,
        permissions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton-Instance für die App
export const azureBackupService = new AzureBackupService();