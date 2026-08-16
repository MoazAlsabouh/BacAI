import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json(subjects);
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'فشل في جلب المواد الدراسية' });
  }
};

export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'اسم المادة مطلوب' });
      return;
    }

    // Check if subject already exists
    const existing = await prisma.subject.findFirst({
      where: { name: name.trim() }
    });

    if (existing) {
      res.status(400).json({ error: 'هذه المادة موجودة مسبقاً' });
      return;
    }

    const newSubject = await prisma.subject.create({
      data: { name: name.trim() }
    });

    res.status(201).json(newSubject);
  } catch (error: any) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'فشل في إنشاء المادة الدراسية' });
  }
};
