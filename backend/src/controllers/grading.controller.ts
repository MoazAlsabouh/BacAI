import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const { questionId, studentResponse } = req.body;

    if (!questionId || !studentResponse) {
      res.status(400).json({ error: 'questionId and studentResponse are required' });
      return;
    }

    // 1. Fetch the original question to get the correct answer or rubric
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    let earnedScore = 0;
    let aiFeedback = '';

    // 2. Standard grading for MCQ
    if (question.type === 'MCQ') {
      if (studentResponse.trim() === question.correctAnswer?.trim()) {
        earnedScore = 1; // Or fetch marksPerQuestion from the exam instance
        aiFeedback = 'إجابة صحيحة.';
      } else {
        earnedScore = 0;
        aiFeedback = `إجابة خاطئة. الإجابة الصحيحة هي: ${question.correctAnswer}`;
      }
    } 
    // 3. Semantic Grading for ESSAY or MATH
    else {
      const systemPrompt = `
      أنت مصحح امتحانات خبير في المناهج السورية (البكالوريا).
      المهمة: تقييم إجابة الطالب بناءً على "سلم التصحيح" الرسمي.
      تعليمات صارمة جداً:
      - لا تبحث عن التطابق الحرفي للكلمات. قيم المعنى الدلالي للإجابة.
      - إذا كان سلم التصحيح يشترط نقاطاً جوهرية معينة، تأكد أن الطالب أوصل الفكرة.
      - المخرج يجب أن يكون JSON صالح يحتوي على:
        1. "scorePercentage": نسبة المئوية للعلامة المستحقة (من 0 إلى 100).
        2. "feedback": تغذية راجعة مفصلة باللغة العربية تشرح للطالب ما أصاب فيه وما أخطأ أو نسيه مقارنة بسلم التصحيح.
      `;

      const promptText = `
      نص السؤال: ${question.content}
      سلم التصحيح (Rubric): ${question.rubric || 'غير متوفر'}
      إجابة الطالب: ${studentResponse}
      `;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + promptText }] }],
        config: { responseMimeType: "application/json" }
      });

      const generatedText = aiResponse.text;
      if (!generatedText) throw new Error("No text generated from AI for grading");
      
      const parsedGrading = JSON.parse(generatedText);
      
      // Assume max score is 1 for now (could be dynamic based on exam rules)
      earnedScore = (parsedGrading.scorePercentage / 100) * 1; 
      aiFeedback = parsedGrading.feedback;
    }

    // 4. Save the answer to DB
    const answer = await prisma.answer.create({
      data: {
        attemptId: attemptId,
        questionId: question.id,
        studentResponse: studentResponse,
        earnedScore: earnedScore,
        aiFeedback: aiFeedback
      }
    });

    res.status(200).json({
      message: 'تم تصحيح الإجابة وحفظها',
      result: {
        earnedScore,
        aiFeedback
      }
    });

  } catch (error: any) {
    console.error('Error in semantic grading:', error);
    res.status(500).json({ error: error.message || 'Internal server error during grading' });
  }
};
