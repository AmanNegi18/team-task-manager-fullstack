const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { name: true, email: true }
  });
  console.log('Admins found:', JSON.stringify(admins, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
