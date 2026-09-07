import { NotFoundException } from '@nestjs/common';
import { MessageService } from '../message/message.service';

// jest.mock('../prisma/prisma.client', () => ({
//   prisma: {
//     message: {
//       create: jest.fn(),
//       findFirst: jest.fn(),
//       findMany: jest.fn(),
//     },
//   },
// }));

// import { prisma } from '../prisma/prisma.client';

// describe('MessageService', () => {
//   let service: MessageService;

//   beforeEach(() => {
//     service = new MessageService();
//     jest.clearAllMocks();
//   });

//   // it('creates a message', async () => {
//   //   const input = { senderId: 'u1', conversationId: 'c1', content: 'hi' };
//   //   (prisma.message.create as jest.Mock).mockResolvedValue({
//   //     id: '1',
//   //     ...input,
//   //   });

//   //   const result = await service.create(input);

//   //   expect(result!.content).toBe('hi');
//   // });

//   it('throws NotFoundException when message is missing', async () => {
//     (prisma.message.findFirst as jest.Mock).mockResolvedValue(null);

//     await expect(service.findById('missing')).rejects.toThrow(
//       NotFoundException,
//     );
//   });
// });
