import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main() {
  console.log('Seeding...')
  const pw = await bcrypt.hash('password123', 12)
  const org = await prisma.organization.upsert({
    where: { slug: 'printshop-demo' },
    update: {},
    create: { name: 'PrintShop Demo', slug: 'printshop-demo', plan: 'STUDIO', planStatus: 'ACTIVE', maxUsers: 15, accentColor: '#22c55e', email: 'info@printshop.it' },
  })
  await prisma.user.upsert({
    where: { email_organizationId: { email: 'admin@printshop.it', organizationId: org.id } },
    update: { passwordHash: pw },
    create: { organizationId: org.id, email: 'admin@printshop.it', passwordHash: pw, name: 'Admin', role: 'OWNER' },
  })
  console.log('Done!')
}
main().catch(console.error).finally(() => prisma.$disconnect())
