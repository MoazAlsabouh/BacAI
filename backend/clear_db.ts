import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  
  await prisma.answer.deleteMany({});
  await prisma.studentAttempt.deleteMany({});
  await prisma.examQuestion.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.sourceMaterial.deleteMany({});
  
  console.log('Successfully deleted all questions, materials, and exams!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
