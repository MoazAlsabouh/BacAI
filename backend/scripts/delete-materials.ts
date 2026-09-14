import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all Student Attempts...");
  await prisma.answer.deleteMany({});
  await prisma.studentAttempt.deleteMany({});

  console.log("Deleting all Exams...");
  await prisma.examQuestion.deleteMany({});
  await prisma.exam.deleteMany({});
  
  console.log("Deleting all SourceMaterials and Questions...");
  const result = await prisma.sourceMaterial.deleteMany({});
  
  console.log(`Successfully deleted ${result.count} materials.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
