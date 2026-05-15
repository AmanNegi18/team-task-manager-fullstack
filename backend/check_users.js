const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { name: true, email: true, role: true }
  });
  console.log('All Users:', JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
