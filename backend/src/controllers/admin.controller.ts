import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSubjects = await prisma.subject.count();
    const totalQuestions = await prisma.question.count();
    const totalExams = await prisma.exam.count();
    const totalAttempts = await prisma.studentAttempt.count();
    
    const attempts = await prisma.studentAttempt.findMany({
      where: { totalScore: { not: null } },
      select: { totalScore: true }
    });
    
    let averageScore = 0;
    if (attempts.length > 0) {
      const sum = attempts.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
      averageScore = Math.round((sum / attempts.length) * 10) / 10;
    }

    res.status(200).json({
      totalSubjects,
      totalQuestions,
      totalExams,
      totalAttempts,
      averageScore
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

export const getSubjectStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.params;
    
    // Get all questions for this subject
    const questions = await prisma.question.findMany({
      where: { subjectId },
      select: { type: true, difficulty: true }
    });

    const questionsByType = questions.reduce((acc: any, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {});

    const questionsByDifficulty = questions.reduce((acc: any, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      totalQuestions: questions.length,
      questionsByType,
      questionsByDifficulty
    });
  } catch (error) {
    console.error('Error fetching subject stats:', error);
    res.status(500).json({ error: 'Failed to fetch subject statistics' });
  }
};

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId, type, difficulty, page = '1', limit = '50' } = req.query;
    
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (subjectId) whereClause.subjectId = String(subjectId);
    if (type) whereClause.type = String(type);
    if (difficulty) whereClause.difficulty = parseInt(String(difficulty));
    
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          subject: { select: { name: true } },
          source: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.question.count({ where: whereClause })
    ]);
    
    res.status(200).json({
      data: questions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.query;
    
    const whereClause = subjectId ? { subjectId: String(subjectId) } : {};
    
    const templates = await prisma.examTemplate.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true } }
      }
    });
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.question.delete({
      where: { id }
    });
    res.status(200).json({ message: 'تم حذف السؤال بنجاح' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'فشل في حذف السؤال' });
  }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.examTemplate.delete({
      where: { id }
    });
    res.status(200).json({ message: 'تم حذف القالب بنجاح' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'فشل في حذف القالب' });
  }
};
