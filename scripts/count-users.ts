// Simple script to count users and list their emails
import { prisma } from '../lib/prisma';

async function countUsers() {
  try {
    const totalUsers = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n📊 Total Users: ${totalUsers}\n`);
    console.log('📧 User Emails:');
    console.log('─'.repeat(50));
    users.forEach((user, index) => {
      const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      console.log(`${index + 1}. ${user.email} (${user.name || 'No name'}) - Signed up: ${date}`);
    });
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('Error counting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countUsers();

