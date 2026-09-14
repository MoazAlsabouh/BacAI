import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjectId = "c5a3297a-1878-485a-9a63-71b95fd854fd";
  
  const questions = await prisma.question.groupBy({
    by: ['type'],
    where: { subjectId },
    _count: {
      id: true
    }
  });

  console.log("Question counts by type for subject", subjectId, ":");
  console.log(questions);

  const subject = await prisma.subject.findUnique({ where: { id: subjectId }});
  console.log("Subject:", subject);
}

main().catch(console.error).finally(() => prisma.$disconnect());
