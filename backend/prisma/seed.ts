import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const plainPassword = process.argv[3];
  const name = process.argv[4] || 'المدير العام';

  if (!email || !plainPassword) {
    console.error('الاستخدام: npx ts-node prisma/seed.ts <email> <password> [name]');
    process.exit(1);
  }

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      console.log('هذا الحساب موجود مسبقاً.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: passwordHash
      }
    });

    console.log(`تم إنشاء حساب المشرف بنجاح!`);
    console.log(`الإيميل: ${admin.email}`);
  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء الحساب:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
