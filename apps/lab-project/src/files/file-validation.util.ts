import { BadRequestException } from '@nestjs/common';
import * as path from 'path';

const ALLOWED: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    '.xlsx',
  ],
  'application/vnd.ms-excel': ['.xls'],
};
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export function validateFile(
  originalName: string,
  detectedMimeType: string,
  size: number,
): void {
  if (size > MAX_SIZE_BYTES) {
    throw new BadRequestException(
      `File too large. Max allowed size is ${MAX_SIZE_BYTES / 1024 / 1024} MB`,
    );
  }
  if (
    originalName.includes('/') ||
    originalName.includes('\\') ||
    originalName.includes('..')
  ) {
    throw new BadRequestException('Invalid file name');
  }

  const parts = originalName.split('.');
  if (parts.length > 2) {
    throw new BadRequestException(
      'File name must not contain multiple extensions',
    );
  }

  const allowedExtensions = ALLOWED[detectedMimeType];
  if (!allowedExtensions) {
    throw new BadRequestException(
      `File type "${detectedMimeType}" is not allowed`,
    );
  }

  const ext = path.extname(originalName).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new BadRequestException(
      `Extension "${ext}" does not match MIME type "${detectedMimeType}"`,
    );
  }
}
