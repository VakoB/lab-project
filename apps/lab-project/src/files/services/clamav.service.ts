import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import NodeClam from 'clamscan';
import { Readable } from 'stream';

interface ClamScanResult {
  isInfected: boolean | null;
  viruses: string[] | null;
}

interface ClamScanner {
  scanBuffer(buffer: Buffer): Promise<ClamScanResult>;
}

@Injectable()
export class ClamAvService implements OnModuleInit {
  private clamscan: ClamScanner | null = null;
  private readonly logger = new Logger(ClamAvService.name);

  async onModuleInit() {
    try {
      const clam = new NodeClam();

      this.clamscan = (await clam.init({
        clamdscan: {
          host: 'localhost',
          port: Number(process.env.CLAMAV_PORT ?? 3310),
          timeout: 60000,
          active: true,
        },
      })) as unknown as ClamScanner;

      this.logger.log('ClamAV scanner initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ClamAV scanner', error);
    }
  }

  async scanBuffer(buffer: Buffer): Promise<void> {
    if (!this.clamscan) {
      throw new InternalServerErrorException(
        'Antivirus scanner is not initialized',
      );
    }

    let result: ClamScanResult;

    try {
      const stream = Readable.from(buffer);
      result = (await (this.clamscan as any).scanStream(stream)) as ClamScanResult;
    } catch (error) {
      this.logger.error('ClamAV scan error', error);
      throw new InternalServerErrorException('Antivirus scan failed');
    }

    const { isInfected, viruses } = result;

    if (isInfected === null) {
      throw new InternalServerErrorException(
        'Antivirus scan returned inconclusive result',
      );
    }

    if (isInfected) {
      const detected = viruses?.join(', ') ?? 'unknown';
      throw new BadRequestException(`Malware detected: ${detected}`);
    }
  }
}
