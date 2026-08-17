import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { jsonrepair } from 'jsonrepair';
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

    // Fix Multer mojibake (latin1 to utf8) for Arabic filenames
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

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
        title: originalName,
        type: type, // BOOK, PAST_EXAM, SUMMARY, TEMPLATE
        subjectId: subjectId
      }
    });

    let systemPrompt = '';

    if (type === 'TEMPLATE') {
      systemPrompt = `
      أنت خبير في المناهج السورية (البكالوريا).
      المهمة: تحليل هذا القالب الامتحاني الوزاري واستخراج هيكلته الدقيقة وتحويلها إلى JSON.
      **ملاحظة هامة جداً:** يجب استنتاج المواضيع أو الأفكار (topics) التي يختص بها كل قسم أو سؤال من التلميحات المكتوبة في الملف (مثال: إذا كُتب أن المسألة الأولى قد ترد في الأشعة أو معادلة مستوي، يجب إضافة هذه المواضيع في مصفوفة topics).
      **الأنواع المسموحة للـ type هي فقط:** MCQ (أتمتة/اختيار من متعدد), ESSAY (أسئلة مقالية وشرح واستنتاج), PROBLEM_SOLVING (مسائل رياضية أو فيزيائية أو كيميائية شاملة).
      المخرج يجب أن يكون JSON صالح يحتوي على مصفوفة sections.
      مثال للناتج:
      {
        "sections": [
          { "title": "أولاً: اختر الإجابة الصحيحة", "type": "MCQ", "count": 10, "marksPerQuestion": 2, "topics": ["نهايات", "مقاربات", "عقدية"] },
          { "title": "رابعاً: حل المسألتين الآتيتين", "type": "PROBLEM_SOLVING", "count": 2, "marksPerQuestion": 100, "topics": ["معادلة مستوي", "إثبات تعامد", "دراسة تغيرات"] }
        ]
      }`;
    } else {
      systemPrompt = `
      أنت خبير تعليمي في المناهج السورية (البكالوريا).
      المهمة: استخراج وتوليد أسئلة امتحانية من الملف المرفق.
      **هام جداً:** 
      1- استخرج كافة الأسئلة الممكنة التي تغطي جميع أفكار وصفحات الملف بالكامل دون استثناء (استخرج 100 سؤال على الأقل أو أكثر إن كان الملف يسمح بذلك). لا تكتفي بتقديم عينة صغيرة أبداً.
      2- **يجب** وضع كافة المتغيرات والمعادلات والرموز الرياضية بين علامتي $، ولكن **يجب** أن تكون علامة الدولار $ دائماً **داخل علامات التنصيص (Quotes)** الخاصة بالـ JSON.
      3- **هام لـ LaTeX:** عند كتابة أوامر LaTeX داخل الـ JSON، **يجب** مضاعفة الشرطة المائلة (Double Backslash).
      - **الأنواع المسموحة للـ type هي فقط:** MCQ (أتمتة), ESSAY (مقالي أو استنتاج), PROBLEM_SOLVING (مسألة رياضية أو فيزيائية شاملة بطلبات متعددة).
      - حدد الصعوبة من 1 إلى 5.
      - **مواضيع السؤال (topics):** استنتج مواضيع السؤال بدقة شديدة واستخدم نفس المصطلحات الوزارية المعتمدة في القوالب الامتحانية (مثل "دراسة تغيرات", "معادلة مماس", "وضع نسبي", "استقلال احتمالي"، الخ) وضعها في مصفوفة topics. يجب أن تكون دقيقة لتتطابق مع قوالب الامتحانات.
      - للأسئلة المقالية والمسائل، وفر rubric واضح.
      - للـ MCQ، وفر 4 options و correctAnswer.
      المخرج JSON مصفوفة من الأسئلة:
      [ { "type": "PROBLEM_SOLVING", "difficulty": 4, "content": "نص المسألة...", "topics": ["دراسة تغيرات", "معادلة مماس"], "options": null, "correctAnswer": null, "rubric": "توزع الدرجات..." } ]
      `;
    }

    // Helper to call Gemini with retry on 503 / 429
    let response: any = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await ai.models.generateContent({
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
        break; // Success, exit loop
      } catch (geminiErr: any) {
        console.warn(`Gemini attempt ${attempts} failed:`, geminiErr.message || geminiErr);
        if (attempts >= maxAttempts) {
          throw geminiErr;
        }
        // Wait 2.5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2500 * attempts));
      }
    }

    // Clean up file from Gemini after processing
    if (uploadResult.name) {
      await ai.files.delete({ name: uploadResult.name }).catch(() => {});
    }

    let generatedText = response.text;
    if (!generatedText) throw new Error("No text generated from AI");
    
    // 1. Remove markdown formatting if present
    generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Fix unescaped single backslashes used in LaTeX (e.g. \infty -> \\infty) 
    // This safely doubles single backslashes that are not escaping a quote or another backslash
    generatedText = generatedText.replace(/(?<!\\)\\(?![\\"])/g, '\\\\');

    // 3. Robust JSON Object Extractor
    // Extract individual JSON objects from the array to gracefully skip any corrupted elements
    let parsedData: any[] = [];
    
    if (type === 'TEMPLATE') {
      try {
        parsedData = JSON.parse(jsonrepair(generatedText));
      } catch (e) {
        throw new Error("فشل في قراءة القالب. يرجى التأكد من التنسيق.");
      }
    } else {
      let depth = 0;
      let start = -1;
      let inString = false;
      let escape = false;

      for (let i = 0; i < generatedText.length; i++) {
        const char = generatedText[i];
        
        if (inString) {
          if (escape) escape = false;
          else if (char === '\\') escape = true;
          else if (char === '"') inString = false;
          continue;
        }

        if (char === '"') {
          inString = true;
          continue;
        }

        if (char === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0 && start !== -1) {
            const objStr = generatedText.substring(start, i + 1);
            try {
              parsedData.push(JSON.parse(jsonrepair(objStr)));
            } catch (e) {
              console.warn("Skipped a malformed object:", e);
            }
            start = -1;
          }
        }
      }

      // Handle trailing truncated object if generation stopped abruptly
      if (depth > 0 && start !== -1) {
        const objStr = generatedText.substring(start);
        try {
          parsedData.push(JSON.parse(jsonrepair(objStr)));
        } catch (e) {
          console.warn("Skipped a trailing truncated object:", e);
        }
      }

      if (parsedData.length === 0) {
        throw new Error("لم يتم العثور على أسئلة صحيحة في مخرجات الذكاء الاصطناعي.");
      }
    }

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
      const questionsData = parsedData.map((q: any) => {
        let parsedRubric = null;
        if (typeof q.rubric === 'string') {
          parsedRubric = q.rubric;
        } else if (Array.isArray(q.rubric)) {
          parsedRubric = q.rubric.join('\n');
        } else if (q.rubric && typeof q.rubric === 'object') {
          parsedRubric = Object.values(q.rubric).join('\n');
        }

        return {
          type: q.type,
          difficulty: q.difficulty,
          content: q.content,
          options: q.options || [],
          correctAnswer: q.correctAnswer || null,
          rubric: parsedRubric,
          topics: q.topics || [],
          subjectId: subjectId,
          sourceId: sourceMaterial.id
        };
      });

      await prisma.question.createMany({
        data: questionsData
      });
    }

    res.status(200).json({ 
      message: 'Processing complete', 
      sourceId: sourceMaterial.id,
      parsedDataPreview: type === 'TEMPLATE' ? parsedData : parsedData.slice(0, 2)
    });

  } catch (error: any) {
    console.error('Error processing material:', error);
    const msg = error?.status === 503 || error?.message?.includes('high demand')
      ? 'خوادم الذكاء الاصطناعي تشهد ضغطاً مؤقتاً، يرجى المحاولة بعد لحظات.'
      : (error?.message || 'Failed to process material via AI');
    res.status(500).json({ error: msg });
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
