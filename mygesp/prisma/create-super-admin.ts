// prisma/create-super-admin.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin1', 10)
  await prisma.admin.create({
    data: {
      username: 'admin1',
      email: 'admin@gmail.com',
      password: hashedPassword,
      isManager: true,
    }
  })
}

main().finally(() => prisma.$disconnect())