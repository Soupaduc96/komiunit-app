import { useCallback, useState } from 'react';
import { KomiLearnService } from '@/services/komi-learn/course-service';
import { Course, UserProgress } from '@/types/komi-learn';
import { useAuth } from './use-auth';

export const useKomiLearn = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCourses = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await KomiLearnService.getCourses(category);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCourses = useCallback(async (query: string) => {
    if (!query.trim()) return getCourses();
    setLoading(true);
    setError(null);
    try {
      const data = await KomiLearnService.searchCourses(query);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [getCourses]);

  const enrollCourse = useCallback(
    async (courseId: string): Promise<UserProgress> => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        const progress = await KomiLearnService.enrollCourse(user.id, courseId);
        setEnrolledCourses((prev) => {
          const exists = prev.some((p) => p.courseId === courseId);
          return exists ? prev : [...prev, progress];
        });
        return progress;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to enroll';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getEnrolledCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiLearnService.getUserCourses(user.id);
      setEnrolledCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrolled courses');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProgress = useCallback(
    async (courseId: string, lessonId: string): Promise<UserProgress> => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        const progress = await KomiLearnService.updateProgress(user.id, courseId, lessonId);
        setEnrolledCourses((prev) =>
          prev.map((p) => (p.courseId === courseId ? progress : p))
        );
        return progress;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update progress';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    courses,
    enrolledCourses,
    loading,
    error,
    getCourses,
    searchCourses,
    enrollCourse,
    getEnrolledCourses,
    updateProgress,
    clearError,
  };
};
