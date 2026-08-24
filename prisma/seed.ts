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
  const USERS_PER_ORG = 100;
  const CONVERSATIONS_PER_ORG = 50;
  const MESSAGES_PER_CONVERSATION = 20;
  const SESSION_COUNT = 500;

  // Organizaions

  const organizations: any[] = [];
  for (let i = 1; i <= ORGANIZATION_COUNT; i++) {
    organizations.push({
      name: `Organization ${i}`,
    });
  }

  await prisma.organization.createMany({ data: organizations });

  // Users

  const createdOrganizations = await prisma.organization.findMany();
  const passwordHash = await bcrypt.hash('password123', 10);
  const users: any[] = [];
  for (let orgIndex = 0; orgIndex < createdOrganizations.length; orgIndex++) {
    for (let i = 1; i <= USERS_PER_ORG; i++) {
      users.push({
        username: `user_${orgIndex + 1}_${i}`,
        email: `user${orgIndex * USERS_PER_ORG + i}@gmail.com`,
        passwordHash,
        organizationId: createdOrganizations[orgIndex].id,
      });
    }
  }
  await prisma.user.createMany({ data: users });

  // Sessions

  const createdUsers = await prisma.user.findMany();

  const sessions: any[] = [];
  for (let i = 1; i <= SESSION_COUNT; i++) {
    sessions.push({
      token: `token-${i}`,
      expiresAt: new Date(Date.now() + 86400000),
      userId: createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
    });
  }
  await prisma.session.createMany({ data: sessions });

  // Conversations + ConversationParticipants

  for (let orgIndex = 0; orgIndex < createdOrganizations.length; orgIndex++) {
    const org = createdOrganizations[orgIndex];
    type User = (typeof createdUsers)[0];
    const orgUsers: User[] = [];
    for (let i = 0; i < createdUsers.length; i++) {
      if (createdUsers[i].organizationId === org.id) {
        orgUsers.push(createdUsers[i]);
      }
    }

    if (orgUsers.length < 2) continue;

    for (let i = 0; i < CONVERSATIONS_PER_ORG; i++) {
      const index1 = Math.floor(Math.random() * orgUsers.length);
      let index2 = Math.floor(Math.random() * orgUsers.length);
      while (index2 === index1) {
        index2 = Math.floor(Math.random() * orgUsers.length);
      }
      const user1 = orgUsers[index1];
      const user2 = orgUsers[index2];

      const conversation = await prisma.conversation.create({
        data: {
          title: `chat between ${user1.username} and ${user2.username}`,
          organizationId: org.id,
          ownerId: user1.id,
        },
      });

      await prisma.conversationParticipant.createMany({
        data: [
          { conversationId: conversation.id, userId: user1.id },
          { conversationId: conversation.id, userId: user2.id },
        ],
        skipDuplicates: true,
      });
    }

    console.log(
      `Org ${orgIndex + 1}/${createdOrganizations.length} conversations done`,
    );
  }

  // Messages

  const createdConversations = await prisma.conversation.findMany();
  const allParticipants = await prisma.conversationParticipant.findMany();

  const participantMap: Record<string, string[]> = {};
  for (let i = 0; i < allParticipants.length; i++) {
    const p = allParticipants[i];
    if (!participantMap[p.conversationId]) {
      participantMap[p.conversationId] = [];
    }
    participantMap[p.conversationId].push(p.userId);
  }

  const BATCH_SIZE = 5000;
  let messageBatch: any[] = [];
  let totalMessages = 0;

  for (let i = 0; i < createdConversations.length; i++) {
    const conversation = createdConversations[i];
    const participants = participantMap[conversation.id] ?? [];
    if (participants.length === 0) continue;

    for (let j = 0; j < MESSAGES_PER_CONVERSATION; j++) {
      messageBatch.push({
        content: `Message ${j + 1} in ${conversation.title}`,
        conversationId: conversation.id,
        senderId: participants[Math.floor(Math.random() * participants.length)],
      });

      if (messageBatch.length >= BATCH_SIZE) {
        await prisma.message.createMany({ data: messageBatch });
        totalMessages += messageBatch.length;
        console.log(`Messages inserted: ${totalMessages}`);
        messageBatch = [];
      }
    }
  }

  if (messageBatch.length > 0) {
    await prisma.message.createMany({ data: messageBatch });
    totalMessages += messageBatch.length;
  }

  console.log('Seed complete.');
  console.log(`Organizations: ${createdOrganizations.length}`);
  console.log(`Users: ${createdUsers.length}`);
  console.log(`Conversations: ${createdConversations.length}`);
  console.log(`Messages: ${totalMessages}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
