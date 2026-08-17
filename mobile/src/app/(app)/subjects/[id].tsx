import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../api';
import { ChevronRight, FileText } from 'lucide-react-native';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [id]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get(`/api/admin/templates?subjectId=${id}`);
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (templateId: string) => {
    try {
      // Create an exam attempt for this template
      const res = await api.post('/api/student/exams/start', {
        subjectId: id,
        templateId
      });
      const attemptId = res.data.attemptId;
      router.push(`/exam/${attemptId}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'حدث خطأ أثناء إنشاء الامتحان');
    }
  };

  const renderTemplate = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FileText color="#0ea5e9" size={24} />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <TouchableOpacity 
        style={styles.startBtn}
        onPress={() => handleStartExam(item.id)}
      >
        <Text style={styles.startBtnText}>ابدأ الامتحان الآن</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronRight color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>نماذج الامتحانات</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>لا توجد نماذج امتحانية لهذه المادة بعد</Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={renderTemplate}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    padding: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 12,
  },
  startBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
