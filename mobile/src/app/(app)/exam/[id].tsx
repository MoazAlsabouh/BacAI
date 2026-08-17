import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import api from '../../../api';
import { ChevronRight, CheckCircle2 } from 'lucide-react-native';

export default function ExamScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchAttempt();
  }, [id]);

  const fetchAttempt = async () => {
    try {
      const res = await api.get(`/api/student/exams/${id}`);
      setAttempt(res.data);
    } catch (err) {
      console.error(err);
      alert('فشل تحميل الامتحان');
    } finally {
      setLoading(false);
    }
  };

  const generateHTML = () => {
    if (!attempt) return '';
    
    // Inject KaTeX and styles to render the exam content beautifully
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body);"></script>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            padding: 20px;
            margin: 0;
            line-height: 1.6;
          }
          .question-card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .q-header {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .q-text {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .option {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 15px;
          }
          .textarea {
            width: 100%;
            height: 100px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px;
            font-family: inherit;
            resize: none;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        ${attempt.exam.questions.map((q: any, i: number) => `
          <div class="question-card">
            <div class="q-header">السؤال ${i + 1} - ${q.question.type === 'MCQ' ? 'أتمتة' : 'مقال/مسألة'}</div>
            <div class="q-text">${q.question.content}</div>
            ${q.question.type === 'MCQ' && q.question.options ? `
              <div>
                ${q.question.options.map((opt: string) => `
                  <div class="option">${opt}</div>
                `).join('')}
              </div>
            ` : `
              <textarea class="textarea" placeholder="اكتب إجابتك هنا..."></textarea>
            `}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronRight color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{attempt?.exam?.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <WebView 
        originWhitelist={['*']}
        source={{ html: generateHTML() }}
        style={styles.webview}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, submitted && styles.submittedBtn]}
          onPress={() => setSubmitted(true)}
          disabled={submitted || submitting}
        >
          {submitted ? (
            <View style={styles.submittedContainer}>
              <CheckCircle2 color="white" size={20} />
              <Text style={styles.submitBtnText}>تم التسليم</Text>
            </View>
          ) : (
            <Text style={styles.submitBtnText}>تسليم الامتحان</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submittedBtn: {
    backgroundColor: '#10b981',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submittedContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  }
});
