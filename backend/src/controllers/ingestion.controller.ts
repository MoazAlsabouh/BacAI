import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const uploadMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { subjectId, type } = req.body;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!subjectId || !type) {
      res.status(400).json({ error: 'subjectId and type are required' });
      return;
    }

    // Upload file directly to Gemini to save RAM
    const uploadResult = await ai.files.upload({
      file: file.path,
      config: {
        mimeType: file.mimetype || 'text/plain',
      }
    });

    // Create the SourceMaterial record first
    const sourceMaterial = await prisma.sourceMaterial.create({
      data: {
        title: file.originalname,
        type: type, // BOOK, PAST_EXAM, SUMMARY, TEMPLATE
        subjectId: subjectId,
      }
    });

    let systemPrompt = '';

    if (type === 'TEMPLATE') {
      systemPrompt = `
      أنت خبير في المناهج السورية (البكالوريا).
      المهمة: تحليل هذا القالب الامتحاني الوزاري واستخراج هيكلته الدقيقة وتحويلها إلى JSON.
      المخرج يجب أن يكون JSON صالح يحتوي على مصفوفة sections.
      مثال:
      {
        "sections": [
          { "title": "أولاً: اختر الإجابة الصحيحة", "type": "MCQ", "count": 10, "marksPerQuestion": 2 },
          { "title": "ثانياً: أجب عن الأسئلة", "type": "ESSAY", "count": 3, "marksPerQuestion": 10 }
        ]
      }`;
    } else {
      systemPrompt = `
      أنت خبير تعليمي في المناهج السورية (البكالوريا).
      المهمة: استخراج وتوليد أسئلة امتحانية من الملف المرفق.
      - صنف كل سؤال إلى: MCQ (أتمتة)، ESSAY (مقالي)، MATH (مسألة).
      - حدد الصعوبة من 1 إلى 5.
      - استنتج مواضيع السؤال وضعها في مصفوفة topics (مثل ["نواس مرن", "طاقة"]).
      - للأسئلة المقالية والمسائل، وفر rubric واضح.
      - للـ MCQ، وفر 4 options و correctAnswer.
      المخرج JSON مصفوفة من الأسئلة:
      [ { "type": "MCQ", "difficulty": 3, "content": "السؤال...", "topics": ["موضوع1"], "options": ["خيار1","خيار2"], "correctAnswer": "خيار1" } ]
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [{ 
        role: 'user', 
        parts: [
          { text: systemPrompt },
          { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } }
        ] 
      }],
      config: { responseMimeType: "application/json" }
    });

    // Clean up file from Gemini after processing
    if (uploadResult.name) {
      await ai.files.delete({ name: uploadResult.name });
    }

    const generatedText = response.text;
    if (!generatedText) throw new Error("No text generated from AI");
    
    const parsedData = JSON.parse(generatedText);

    if (type === 'TEMPLATE') {
      await prisma.examTemplate.create({
        data: {
          name: file.originalname.replace('.txt', ''),
          rules: parsedData,
          subjectId: subjectId
        }
      });
    } else {
      // It's questions
      const questionsData = parsedData.map((q: any) => ({
        type: q.type,
        difficulty: q.difficulty,
        content: q.content,
        options: q.options || [],
        correctAnswer: q.correctAnswer || null,
        rubric: Array.isArray(q.rubric) ? q.rubric.join('\n') : (q.rubric || null),
        topics: q.topics || [],
        subjectId: subjectId,
        sourceId: sourceMaterial.id
      }));

      await prisma.question.createMany({
        data: questionsData
      });
    }

    res.status(200).json({ 
      message: 'Processing complete', 
      sourceId: sourceMaterial.id,
      parsedDataPreview: type === 'TEMPLATE' ? parsedData : parsedData.slice(0, 2)
    });

  } catch (error) {
    console.error('Error processing material:', error);
    res.status(500).json({ error: 'Failed to process material via AI' });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete temporary file:', err);
      }
    }
  }
};
