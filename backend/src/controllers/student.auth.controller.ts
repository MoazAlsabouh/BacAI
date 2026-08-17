import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'bacai-super-secret-key-student';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'الرجاء إدخال جميع الحقول المطلوبة' });
      return;
    }

    const existingStudent = await prisma.student.findUnique({ where: { email } });
    if (existingStudent) {
      res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    const token = jwt.sign({ studentId: student.id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, student: { id: student.id, name: student.name, email: student.email } });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const token = jwt.sign({ studentId: student.id }, JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token, student: { id: student.id, name: student.name, email: student.email } });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // This assumes an authMiddleware sets req.user
    const studentId = (req as any).user?.studentId;
    if (!studentId) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!student) {
      res.status(404).json({ error: 'الحساب غير موجود' });
      return;
    }

    res.status(200).json({ student });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات المستخدم' });
  }
};
