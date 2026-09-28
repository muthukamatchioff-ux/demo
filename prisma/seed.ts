import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. EXACTLY 6 ROLES (No Agency, No Finance)
  const roles = [
    { name: 'Admin', description: 'Full system access' },
    { name: 'Project Coordinator', description: 'Project coordination and operational editing access' },
    { name: 'Senior Officer', description: 'Review/edit access according to assigned permissions' },
    { name: 'Documentation User', description: 'Document and record management access' },
    { name: 'TEC Member', description: 'TEC/evaluation related access' },
    { name: 'Viewer', description: 'Read-only access' },
  ];

  const createdRoles: Record<string, any> = {};
  for (const role of roles) {
    createdRoles[role.name] = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // 2. FINANCIAL YEARS
  const financialYears = ['2026-27', '2027-28', '2028-29'];
  for (const year of financialYears) {
    await prisma.financialYear.upsert({
      where: { year },
      update: {},
      create: { year, active: year === '2026-27' },
    });
  }

  // 3. SAFE DEMO USERS
  const defaultPassword = await bcrypt.hash('Demo@123', 10);
  
  const demoUsers = [
    { username: 'demoadmin', email: 'admin@demo.com', roleId: createdRoles['Admin'].id },
    { username: 'democoordinator', email: 'coordinator@demo.com', roleId: createdRoles['Project Coordinator'].id },
    { username: 'demoofficer', email: 'officer@demo.com', roleId: createdRoles['Senior Officer'].id },
    { username: 'demodoc', email: 'docuser@demo.com', roleId: createdRoles['Documentation User'].id },
    { username: 'demotec', email: 'tecmember@demo.com', roleId: createdRoles['TEC Member'].id },
    { username: 'demoviewer', email: 'viewer@demo.com', roleId: createdRoles['Viewer'].id },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        username: user.username,
        email: user.email,
        passwordHash: defaultPassword,
        roleId: user.roleId,
        active: true
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
