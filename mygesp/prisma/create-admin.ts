// prisma/create-admin.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('giorgia', 10)
  await prisma.admin.create({
    data: { email: 'perronesirio@gmail.com', password: hashedPassword }
  })
}

main().finally(() => prisma.$disconnect())