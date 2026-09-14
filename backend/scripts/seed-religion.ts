import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjectName = "التربية الدينية الإسلامية";
  const branch = "SCIENTIFIC";
  const templateName = "النموذج الوزاري المعتمد - ديانة";
  const rules = {
    sections: [
      { title: "أولاً: التلاوة", type: "COMPREHENSION", count: 1, marksPerQuestion: 40, topics: ["قرآن كريم", "تجويد"] },
      { title: "ثانياً: التفسير والاستحفاظ", type: "ESSAY", count: 1, marksPerQuestion: 40, topics: ["تفسير"] },
      { title: "ثالثاً: الحديث الشريف", type: "ESSAY", count: 1, marksPerQuestion: 40, topics: ["حديث"] },
      { title: "رابعاً: بحوث إسلامية (موضوعي)", type: "MCQ", count: 1, marksPerQuestion: 20, topics: ["أسئلة موضوعية"] },
      { title: "خامساً: بحوث إسلامية (مقالي)", type: "ESSAY", count: 2, marksPerQuestion: 30, topics: ["أسئلة مقالية"] }
    ]
  };

  let subject = await prisma.subject.findFirst({
    where: { name: subjectName, branch: branch }
  });
  
  if (!subject) {
    subject = await prisma.subject.create({
      data: { name: subjectName, branch: branch }
    });
    console.log(`Created subject ${subjectName} - ${branch}`);
  }

  const existingTemplate = await prisma.examTemplate.findFirst({
    where: { subjectId: subject.id, name: templateName }
  });

  if (existingTemplate) {
    await prisma.examTemplate.update({
      where: { id: existingTemplate.id },
      data: { rules: rules as any }
    });
    console.log(`Updated template for ${subjectName}`);
  } else {
    await prisma.examTemplate.create({
      data: {
        name: templateName,
        rules: rules as any,
        subjectId: subject.id
      }
    });
    console.log(`Created template for ${subjectName}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
