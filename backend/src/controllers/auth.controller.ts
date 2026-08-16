import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-bacai-key';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      res.status(401).json({ error: 'البريد الإلكتروني غير مسجل في النظام' });
      return;
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      return;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      admin: { email: admin.email }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'حدث خطأ داخلي في الخادم' });
  }
};
