export interface ProcessFileMessage {
  jobId: string;
  fileId: string;
  storagePath: string;
  organizationId: string;
  correlationId: string;
}

export const FILE_PROCESS_PATTERN = 'file.process';
