import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

export interface SalesRow {
  product: string;
  quantity: number;
  price: number;
}

export interface ParseResult {
  rows: SalesRow[];
  totalQuantity: number;
  totalRevenue: number;
}

const REQUIRED_COLUMNS = ['product', 'quantity', 'price'];

@Injectable()
export class ExcelParserService {
  parse(buffer: Buffer): ParseResult {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rows.length === 0) {
      throw new BadRequestException('Excel file is empty');
    }

    const columns = Object.keys(rows[0]).map((k) => k.toLowerCase());
    for (const required of REQUIRED_COLUMNS) {
      if (!columns.includes(required)) {
        throw new BadRequestException(
          `Missing required column: "${required}". Expected: ${REQUIRED_COLUMNS.join(', ')}`,
        );
      }
    }

    const parsed: SalesRow[] = rows.map((row, index) => {
      const quantity = Number(row['quantity']);
      const price = Number(row['price']);

      if (isNaN(quantity) || quantity < 0) {
        throw new BadRequestException(`Row ${index + 1}: invalid quantity`);
      }
      if (isNaN(price) || price < 0) {
        throw new BadRequestException(`Row ${index + 1}: invalid price`);
      }

      return {
        product: String(row['product']),
        quantity,
        price,
      };
    });

    const totalQuantity = parsed.reduce((sum, r) => sum + r.quantity, 0);
    const totalRevenue = parsed.reduce(
      (sum, r) => sum + r.quantity * r.price,
      0,
    );

    return { rows: parsed, totalQuantity, totalRevenue };
  }
}
