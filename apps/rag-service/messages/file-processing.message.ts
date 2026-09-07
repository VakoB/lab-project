export interface FileProcessingMessage {
  jobId: string;
  fileId: string;
  organizationId: string;
  correlationId: string;
  storageKey: string;
  mimeType: string;
}
