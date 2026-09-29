const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    throw new Error(
      'ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.'
    );
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  const role = await prisma.role.findUnique({
    where: { name: 'Admin' }
  });

  if (!role) {
    throw new Error('Admin role not found. Run database migrations first.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existingByUsername = await prisma.user.findUnique({
    where: { username }
  });

  if (existingByUsername && existingByUsername.email !== email) {
    throw new Error(
      `Username "${username}" already belongs to another email address.`
    );
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      username,
      passwordHash,
      roleId: role.id,
      active: true
    },
    create: {
      username,
      email,
      passwordHash,
      roleId: role.id,
      active: true
    }
  });

  console.log(`Admin user ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });