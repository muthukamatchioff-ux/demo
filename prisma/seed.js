"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
    const createdRoles = {};
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
    const defaultPassword = await bcryptjs_1.default.hash('Demo@123', 10);
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
    update: {
        passwordHash: defaultPassword,
        roleId: user.roleId,
        active: true,
    },
    create: {
        username: user.username,
        email: user.email,
        passwordHash: defaultPassword,
        roleId: user.roleId,
        active: true,
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
