import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templatesData = [
    {
      subjectName: "اللغة الإنجليزية",
      branch: "SCIENTIFIC",
      templateName: "النموذج الوزاري المعتمد - لغة إنكليزية",
      rules: {
        sections: [
          { title: "I. Read the following text then do the tasks below", type: "COMPREHENSION", count: 1, marksPerQuestion: 70, topics: ["Reading", "Vocabulary", "Grammar"] },
          { title: "II. Read the following text then do the tasks below", type: "COMPREHENSION", count: 1, marksPerQuestion: 70, topics: ["Reading", "Vocabulary"] },
          { title: "III. Choose the correct answer A, B, C or D", type: "MCQ", count: 10, marksPerQuestion: 7, topics: ["Vocabulary", "Grammar"] },
          { title: "IV. Complete the following paragraph by filling in each gap", type: "FILL_IN_BLANKS", count: 4, marksPerQuestion: 7, topics: ["Functional Words"] },
          { title: "V. Write suitable questions about the underlined words", type: "ESSAY", count: 4, marksPerQuestion: 10, topics: ["Making Questions"] },
          { title: "VI. Rewrite the following sentences as required", type: "ESSAY", count: 4, marksPerQuestion: 10, topics: ["Grammar Transformation"] },
          { title: "VII. Correct the verbs in brackets", type: "ESSAY", count: 4, marksPerQuestion: 7, topics: ["Verb Tenses"] },
          { title: "VIII. Complete the following sentences using clauses", type: "FILL_IN_BLANKS", count: 2, marksPerQuestion: 8, topics: ["Clauses"] },
          { title: "IX. Translation", type: "ESSAY", count: 2, marksPerQuestion: 8, topics: ["Translation"] },
          { title: "X. Write a composition", type: "ESSAY", count: 1, marksPerQuestion: 60, topics: ["Composition", "Writing"] }
        ]
      }
    },
    {
      subjectName: "اللغة العربية",
      branch: "SCIENTIFIC",
      templateName: "النموذج الوزاري المعتمد - لغة عربية",
      rules: {
        sections: [
          { title: "أولاً: اقرأ الأبيات الآتية ثم أجب", type: "COMPREHENSION", count: 1, marksPerQuestion: 80, topics: ["تحليل نص شعري"] },
          { title: "ثانياً: البنية والمضمون", type: "ESSAY", count: 4, marksPerQuestion: 15, topics: ["شرح أبيات", "موازنة", "استنتاج"] },
          { title: "ثالثاً: المستوى الفني", type: "ESSAY", count: 2, marksPerQuestion: 10, topics: ["صور بيانية", "محسنات بديعية"] },
          { title: "رابعاً: قواعد اللغة والنحو والإملاء", type: "FILL_IN_BLANKS", count: 4, marksPerQuestion: 15, topics: ["إعراب", "صرف", "إملاء", "نحو"] },
          { title: "خامساً: الرواية والمطالعة", type: "ESSAY", count: 2, marksPerQuestion: 15, topics: ["مطالعة", "رواية"] },
          { title: "سادساً: المستوى الإبداعي (الموضوع)", type: "ESSAY", count: 1, marksPerQuestion: 100, topics: ["تعبير أدبي", "موضوع إجباري"] },
          { title: "سابعاً: كتابة مقال أو تقرير", type: "ESSAY", count: 1, marksPerQuestion: 40, topics: ["تعبير وظيفي"] }
        ]
      }
    },
    {
      subjectName: "الرياضيات",
      branch: "SCIENTIFIC",
      templateName: "النموذج الوزاري المعتمد - رياضيات",
      rules: {
        sections: [
          { title: "أولاً: اختر الإجابة الصحيحة", type: "MCQ", count: 10, marksPerQuestion: 10, topics: ["نهايات", "احتمالات", "عقدية", "أشعة"] },
          { title: "ثانياً: حل التمارين الآتية", type: "PROBLEM_SOLVING", count: 3, marksPerQuestion: 60, topics: ["متتاليات", "تكامل", "عقدية"] },
          { title: "ثالثاً: حل المسألتين الآتيتين", type: "PROBLEM_SOLVING", count: 2, marksPerQuestion: 100, topics: ["دراسة تغيرات تابع", "أشعة ومستقيمات"] }
        ]
      }
    },
    {
      subjectName: "الفيزياء",
      branch: "SCIENTIFIC",
      templateName: "النموذج الوزاري المعتمد - فيزياء",
      rules: {
        sections: [
          { title: "أولاً: اختر الإجابة الصحيحة", type: "MCQ", count: 4, marksPerQuestion: 10, topics: ["نواسات", "مغناطيسية", "تيار متناوب", "إلكترونيات"] },
          { title: "ثانياً: أجب عن سؤالين (نظري)", type: "ESSAY", count: 2, marksPerQuestion: 20, topics: ["تعاريف", "تفسير علمي"] },
          { title: "ثالثاً: أجب عن سؤالين (استنتاج)", type: "ESSAY", count: 2, marksPerQuestion: 25, topics: ["استنتاج رياضي", "تجارب"] },
          { title: "رابعاً: حل المسائل الآتية", type: "PROBLEM_SOLVING", count: 4, marksPerQuestion: 60, topics: ["نواس مرن", "دارات مهتزة", "تيار متناوب", "ميكانيك"] }
        ]
      }
    },
    {
      subjectName: "علم الأحياء",
      branch: "SCIENTIFIC",
      templateName: "النموذج الوزاري المعتمد - علم أحياء",
      rules: {
        sections: [
          { title: "أولاً: اختر الإجابة الصحيحة", type: "MCQ", count: 10, marksPerQuestion: 10, topics: ["عصبية", "مستقبلات", "تنسيق هرموني"] },
          { title: "ثانياً: الرسمة والمسميات", type: "DIAGRAM", count: 1, marksPerQuestion: 38, topics: ["بنية العين", "الدماغ", "المشبك"] },
          { title: "ثالثاً: أعط تفسيراً علمياً", type: "ESSAY", count: 5, marksPerQuestion: 10, topics: ["تعاليل"] },
          { title: "رابعاً: الوراثة", type: "PROBLEM_SOLVING", count: 1, marksPerQuestion: 50, topics: ["مسألة وراثية"] },
          { title: "خامساً: خارطة مفاهيم", type: "DIAGRAM", count: 1, marksPerQuestion: 30, topics: ["خارطة مفاهيم"] },
          { title: "سادساً: مقارنة وتفكير ناقد", type: "ESSAY", count: 2, marksPerQuestion: 16, topics: ["مقارنة", "تفكير ناقد"] }
        ]
      }
    },
    {
      subjectName: "التاريخ",
      branch: "LITERARY",
      templateName: "النموذج الوزاري المعتمد - تاريخ",
      rules: {
        sections: [
          { title: "أولاً: اختر الإجابة الصحيحة", type: "MCQ", count: 6, marksPerQuestion: 10, topics: ["تاريخ"] },
          { title: "ثانياً: صح وخطأ", type: "TRUE_FALSE", count: 4, marksPerQuestion: 5, topics: ["تاريخ"] },
          { title: "ثالثاً: رتب الأحداث", type: "ORDERING", count: 1, marksPerQuestion: 30, topics: ["تسلسل زمني"] },
          { title: "رابعاً: علل / اشرح", type: "ESSAY", count: 2, marksPerQuestion: 30, topics: ["تعليل", "شرح"] },
          { title: "خامساً: صنف / وازن / قارن", type: "ESSAY", count: 3, marksPerQuestion: 26, topics: ["مقارنة", "تصنيف"] },
          { title: "سادساً: تحليل نص", type: "COMPREHENSION", count: 1, marksPerQuestion: 60, topics: ["تحليل نص تاريخي"] },
          { title: "سابعاً: الخريطة", type: "DIAGRAM", count: 1, marksPerQuestion: 50, topics: ["رسم خريطة"] }
        ]
      }
    },
    {
      subjectName: "الجغرافيا",
      branch: "LITERARY",
      templateName: "النموذج الوزاري المعتمد - جغرافيا",
      rules: {
        sections: [
          { title: "أولاً: اختر الإجابة الصحيحة", type: "MCQ", count: 6, marksPerQuestion: 10, topics: ["جغرافيا"] },
          { title: "ثانياً: صح وخطأ", type: "TRUE_FALSE", count: 4, marksPerQuestion: 5, topics: ["جغرافيا"] },
          { title: "ثالثاً: فسر (علل)", type: "ESSAY", count: 3, marksPerQuestion: 10, topics: ["تفسير علمي"] },
          { title: "رابعاً: أجب عن الأسئلة", type: "ESSAY", count: 4, marksPerQuestion: 20, topics: ["أسئلة مقالية"] },
          { title: "خامساً: دقق في الشكل/الخريطة", type: "DIAGRAM", count: 1, marksPerQuestion: 30, topics: ["تحليل خريطة أو مخطط"] },
          { title: "سادساً: حلل النص الآتي", type: "COMPREHENSION", count: 1, marksPerQuestion: 30, topics: ["تحليل نص جغرافي"] },
          { title: "سابعاً: ارسم خريطة", type: "DIAGRAM", count: 1, marksPerQuestion: 50, topics: ["رسم خريطة"] }
        ]
      }
    },
    {
      subjectName: "الفلسفة",
      branch: "LITERARY",
      templateName: "النموذج الوزاري المعتمد - فلسفة",
      rules: {
        sections: [
          { title: "أولاً: اختر الإجابة الصحيحة", type: "MCQ", count: 6, marksPerQuestion: 10, topics: ["فلسفة"] },
          { title: "ثانياً: صح وخطأ", type: "TRUE_FALSE", count: 4, marksPerQuestion: 10, topics: ["فلسفة"] },
          { title: "ثالثاً: حدد معنى المصطلحين", type: "MATCHING", count: 2, marksPerQuestion: 10, topics: ["مصطلحات"] },
          { title: "رابعاً: أجب عن الأسئلة (علل)", type: "ESSAY", count: 3, marksPerQuestion: 20, topics: ["تعليل"] },
          { title: "خامساً: وازن / قارن", type: "ESSAY", count: 2, marksPerQuestion: 30, topics: ["مقارنة"] },
          { title: "سادساً: اقرأ النص", type: "COMPREHENSION", count: 1, marksPerQuestion: 60, topics: ["تحليل نص فلسفي"] },
          { title: "سابعاً: الموضوع", type: "ESSAY", count: 1, marksPerQuestion: 100, topics: ["موضوع فلسفي"] }
        ]
      }
    },
    {
      subjectName: "التربية الدينية الإسلامية",
      branch: "LITERARY",
      templateName: "النموذج الوزاري المعتمد - ديانة",
      rules: {
        sections: [
          { title: "أولاً: التلاوة", type: "COMPREHENSION", count: 1, marksPerQuestion: 40, topics: ["قرآن كريم", "تجويد"] },
          { title: "ثانياً: التفسير والاستحفاظ", type: "ESSAY", count: 1, marksPerQuestion: 40, topics: ["تفسير"] },
          { title: "ثالثاً: الحديث الشريف", type: "ESSAY", count: 1, marksPerQuestion: 40, topics: ["حديث"] },
          { title: "رابعاً: بحوث إسلامية (موضوعي)", type: "MCQ", count: 1, marksPerQuestion: 20, topics: ["أسئلة موضوعية"] },
          { title: "خامساً: بحوث إسلامية (مقالي)", type: "ESSAY", count: 2, marksPerQuestion: 30, topics: ["أسئلة مقالية"] }
        ]
      }
    },
    {
      subjectName: "اللغة الفرنسية",
      branch: "SCIENTIFIC",
      templateName: "النموذج الوزاري المعتمد - لغة فرنسية",
      rules: {
        sections: [
          { title: "I. Compréhension écrite (Vrai/Faux)", type: "COMPREHENSION", count: 1, marksPerQuestion: 60, topics: ["Reading", "Vrai/Faux"] },
          { title: "I. Compréhension (Choix Multiple)", type: "MCQ", count: 5, marksPerQuestion: 12, topics: ["Reading", "MCQ"] },
          { title: "II. Grammaire et structures", type: "MCQ", count: 10, marksPerQuestion: 8, topics: ["Grammar"] },
          { title: "III. Expression écrite (Ordre)", type: "ORDERING", count: 1, marksPerQuestion: 40, topics: ["Ordering Sentences"] },
          { title: "IV. Traitez le sujet suivant", type: "ESSAY", count: 1, marksPerQuestion: 60, topics: ["Composition"] }
        ]
      }
    }
  ];

  console.log("Starting DB Seed...");
  
  for (const t of templatesData) {
    // Upsert the subject just in case it doesn't exist
    let subject = await prisma.subject.findFirst({
      where: { name: t.subjectName }
    });
    
    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: t.subjectName, branch: t.branch as any }
      });
      console.log(`Created subject ${t.subjectName}`);
    }

    // Upsert the template
    const existingTemplate = await prisma.examTemplate.findFirst({
      where: { subjectId: subject.id, name: t.templateName }
    });

    if (existingTemplate) {
      await prisma.examTemplate.update({
        where: { id: existingTemplate.id },
        data: { rules: t.rules as any }
      });
      console.log(`Updated template for ${t.subjectName}`);
    } else {
      await prisma.examTemplate.create({
        data: {
          name: t.templateName,
          rules: t.rules as any,
          subjectId: subject.id
        }
      });
      console.log(`Created template for ${t.subjectName}`);
    }
  }
  
  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
