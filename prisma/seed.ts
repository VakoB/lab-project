import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const ORGANIZATION_COUNT = 10;
  const USER_COUNT = 1000;
  const CONVERSATION_COUNT = 5000;
  const MESSAGE_COUNT = 50000;
  const SESSION_COUNT = 500;

  const organizations: any[] = [];
  for (let i = 1; i <= ORGANIZATION_COUNT; i++) {
    organizations.push({
      name: `Organization ${i}`,
    });
  }

  await prisma.organization.createMany({ data: organizations });
  const createdOrganizations = await prisma.organization.findMany();

  const users: any[] = [];
  for (let i = 1; i <= USER_COUNT; i++) {
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    users.push({
      username: `User ${i}`,
      email: `user${i}@gmail.com`,
      passwordHash,
      organizationId:
        createdOrganizations[Math.floor(Math.random() * ORGANIZATION_COUNT)].id,
    });
  }
  await prisma.user.createMany({ data: users });
  const createdUsers = await prisma.user.findMany();

  const sessions: any[] = [];
  for (let i = 1; i <= SESSION_COUNT; i++) {
    sessions.push({
      token: `token-${i}`,
      expiresAt: new Date(Date.now() + 86400000),
      userId: createdUsers[Math.floor(Math.random() * USER_COUNT)].id,
    });
  }
  await prisma.session.createMany({ data: sessions });

  const conversations: any[] = [];
  for (let i = 1; i <= CONVERSATION_COUNT; i++) {
    conversations.push({
      title: `conversation ${i}`,
      ownerId: createdUsers[Math.floor(Math.random() * USER_COUNT)].id,
    });
  }
  await prisma.conversation.createMany({ data: conversations });
  const createdConversations = await prisma.conversation.findMany();

  const messages: any[] = [];
  for (let i = 1; i <= MESSAGE_COUNT; i++) {
    messages.push({
      content: `message ${i}`,
      senderId: createdUsers[Math.floor(Math.random() * USER_COUNT)].id,
      conversationId:
        createdConversations[Math.floor(Math.random() * CONVERSATION_COUNT)].id,
    });
  }
  await prisma.message.createMany({ data: messages });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
