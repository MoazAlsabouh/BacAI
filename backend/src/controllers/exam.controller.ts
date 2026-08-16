import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get random items from an array
function getRandomItems<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export const generatePdfBooklet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId, templateId, examCount } = req.query;
    
    if (!subjectId || !templateId || !examCount) {
      res.status(400).json({ error: 'Missing required parameters: subjectId, templateId, examCount' });
      return;
    }

    const count = parseInt(examCount as string, 10);
    if (isNaN(count) || count < 1 || count > 50) {
      res.status(400).json({ error: 'examCount must be a number between 1 and 50' });
      return;
    }

    // 1. Fetch Template
    let template = null;
    if (templateId && templateId !== 'template-uuid') {
      template = await prisma.examTemplate.findUnique({
        where: { id: templateId as string }
      });
    } else {
      template = await prisma.examTemplate.findFirst({
        where: { subjectId: subjectId as string }
      });
    }

    if (!template) {
      res.status(404).json({ error: 'لم يتم العثور على أي قالب امتحاني لهذه المادة. يرجى من المشرف إضافة قالب.' });
      return;
    }

    // 2. Calculate average difficulty of PAST_EXAM for this subject
    const pastExamsStats = await prisma.question.aggregate({
      where: { 
        subjectId: subjectId as string,
        source: { type: 'PAST_EXAM' } 
      },
      _avg: { difficulty: true }
    });
    
    const targetDifficulty = Math.round(pastExamsStats._avg.difficulty || 3);

    // 3. Fetch all possible questions for this subject
    const allQuestions = await prisma.question.findMany({
      where: { subjectId: subjectId as string }
    });

    if (allQuestions.length === 0) {
      res.status(400).json({ error: 'No questions available in the bank for this subject' });
      return;
    }

    // 4. Generate N exams
    const rules: any = template.rules; 
    const sections = rules.sections || []; // assuming the JSON structure we planned
    const generatedExams = [];

    for (let i = 0; i < count; i++) {
      const examInstance: any = {
        examNumber: i + 1,
        sections: []
      };

      const usedQuestionIds = new Set<string>();

      for (const section of sections) {
        // Filter questions by type and close to target difficulty
        let eligibleQuestions = allQuestions.filter(q => 
          q.type === section.type && 
          Math.abs(q.difficulty - targetDifficulty) <= 1 &&
          !usedQuestionIds.has(q.id)
        );

        // Fallback if not enough questions match the exact difficulty
        let poolToUse = eligibleQuestions.length >= section.count ? eligibleQuestions : allQuestions.filter(q => q.type === section.type && !usedQuestionIds.has(q.id));

        if (poolToUse.length < section.count) {
          throw new Error(`Not enough ${section.type} questions in the bank. Need ${section.count}, found ${poolToUse.length}.`);
        }

        const selectedQuestions = getRandomItems(poolToUse, section.count);
        selectedQuestions.forEach(q => usedQuestionIds.add(q.id));
        
        examInstance.sections.push({
          title: section.title,
          marksPerQuestion: section.marksPerQuestion,
          questions: selectedQuestions
        });
      }

      generatedExams.push(examInstance);
    }

    // Return the generated exams to the frontend (The frontend will generate the actual PDF file using react-pdf)
    res.status(200).json({
      message: `Successfully generated ${count} exams based on the template.`,
      targetDifficulty,
      exams: generatedExams
    });

  } catch (error: any) {
    console.error('Error generating PDF exams:', error);
    res.status(500).json({ error: error.message || 'Internal server error during exam generation' });
  }
};

export const startOnlineExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId, templateId } = req.body;
    
    // 1. Fetch Template
    let template = null;
    if (templateId) {
      template = await prisma.examTemplate.findUnique({
        where: { id: templateId as string }
      });
    } else {
      template = await prisma.examTemplate.findFirst({
        where: { subjectId: subjectId as string }
      });
    }

    if (!template) {
      res.status(404).json({ error: 'لم يتم العثور على أي قالب امتحاني لهذه المادة. يرجى من المشرف إضافة قالب.' });
      return;
    }

    // 2. Fetch all questions for this subject
    const allQuestions = await prisma.question.findMany({
      where: { subjectId: subjectId as string }
    });

    if (allQuestions.length === 0) {
      res.status(400).json({ error: 'لا يوجد أسئلة في بنك الأسئلة لهذه المادة' });
      return;
    }

    // 3. Generate exam based on template rules
    const rules: any = template.rules; 
    const sections = rules.sections || [];
    let selectedQuestions: any[] = [];
    const usedQuestionIds = new Set<string>();

    for (const section of sections) {
      // Filter questions by type and exclude already used
      const eligibleQuestions = allQuestions.filter(q => q.type === section.type && !usedQuestionIds.has(q.id));

      if (eligibleQuestions.length < section.count) {
        throw new Error(`لا يوجد أسئلة كافية من نوع ${section.type}. مطلوب ${section.count} ومتاح ${eligibleQuestions.length} (بعد استبعاد المكرر).`);
      }

      // Pick random questions matching count
      const chosen = getRandomItems(eligibleQuestions, section.count);
      chosen.forEach(q => usedQuestionIds.add(q.id));
      selectedQuestions = [...selectedQuestions, ...chosen];
    }

    const exam = await prisma.exam.create({
      data: {
        title: `امتحان تجريبي: ${template.name}`,
        questions: {
          create: selectedQuestions.map((q, idx) => ({
            questionId: q.id,
            order: idx
          }))
        }
      }
    });

    const attempt = await prisma.studentAttempt.create({
      data: {
        examId: exam.id,
        studentName: 'طالب افتراضي'
      }
    });

    res.status(201).json({ attemptId: attempt.id });
  } catch (error: any) {
    console.error('Error starting exam:', error);
    res.status(500).json({ error: 'فشل في بدء الامتحان' });
  }
};

export const getExamAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: { question: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!attempt) {
      res.status(404).json({ error: 'محاولة الامتحان غير موجودة' });
      return;
    }

    res.status(200).json(attempt);
  } catch (error: any) {
    console.error('Error fetching exam attempt:', error);
    res.status(500).json({ error: 'فشل في جلب بيانات الامتحان' });
  }
};
