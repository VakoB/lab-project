import { File, RagIngestionJob } from 'generated/prisma/client';

export function toRagDocumentDto(job: RagIngestionJob & { file: File }) {
  return {
    fileId: job.fileId,
    jobId: job.id,
    fileName: job.file.originalName,
    fileSize: formatFileSize(job.file.size),
    status: job.status,
    chunkCount: job.chunkCount ?? undefined,
    errorMessage: job.errorMessage ?? undefined,
    createdAt: job.createdAt.toISOString(),
  };
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}
