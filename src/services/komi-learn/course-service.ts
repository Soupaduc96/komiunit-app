import { supabase } from '@/services/supabase/client';
import {
  mapCourse,
  mapLesson,
  mapUserProgress,
  mapCourseCategory,
} from '@/services/supabase/mappers';
import { Course, Lesson, UserProgress, CourseCategory } from '@/types/komi-learn';

export class KomiLearnService {
  // ─── Courses ────────────────────────────────────────────────────────────────

  static async getCourses(category?: string): Promise<Course[]> {
    let q = supabase
      .from('courses')
      .select('*')
      .order('enrollments', { ascending: false });

    if (category) q = q.eq('level', category);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCourse);
  }

  static async getCourseById(courseId: string): Promise<Course | undefined> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapCourse(data) : undefined;
  }

  static async searchCourses(query: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,instructor_name.ilike.%${query}%`)
      .order('rating', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCourse);
  }

  static async getCourseLessons(courseId: string): Promise<Lesson[]> {
    // Column in DB is lesson_order (not order, which is a reserved word)
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('lesson_order', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapLesson);
  }

  static async getCategories(): Promise<CourseCategory[]> {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapCourseCategory);
  }

  // ─── Enrollment & Progress ─────────────────────────────────────────────────

  static async enrollCourse(userId: string, courseId: string): Promise<UserProgress> {
    // Check if already enrolled
    const existing = await this.getCourseProgress(userId, courseId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        completed_lessons: [],
        progress_percentage: 0,
        certificate_earned: false,
      })
      .select(`*, courses(*)`)
      .single();

    if (error) throw new Error(error.message);

    // Increment course enrollment count (best-effort, ignore errors)
    try {
      await supabase.rpc('increment_course_enrollments', { course_id: courseId });
    } catch { /* non-critical */ }

    return mapUserProgress(data);
  }

  static async getUserCourses(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        courses(*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapUserProgress);
  }

  static async getCourseProgress(
    userId: string,
    courseId: string
  ): Promise<UserProgress | undefined> {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`*, courses(*)`)
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapUserProgress(data) : undefined;
  }

  static async updateProgress(
    userId: string,
    courseId: string,
    completedLessonId: string
  ): Promise<UserProgress> {
    const progress = await this.getCourseProgress(userId, courseId);
    if (!progress) throw new Error('Not enrolled in this course');

    const existing = Array.isArray(progress.completedLessons)
      ? progress.completedLessons
      : [];

    const completedLessons = existing.includes(completedLessonId)
      ? existing
      : [...existing, completedLessonId];

    // Get total lesson count for accurate percentage
    const lessons = await this.getCourseLessons(courseId);
    const total = lessons.length || 1;
    const progressPercentage = Math.min(
      100,
      Math.round((completedLessons.length / total) * 100)
    );
    const certificateEarned = progressPercentage === 100;
    const completedAt = certificateEarned ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from('user_progress')
      .update({
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
        certificate_earned: certificateEarned,
        ...(completedAt ? { completed_at: completedAt } : {}),
      })
      .eq('id', progress.id)
      .select(`*, courses(*)`)
      .single();

    if (error) throw new Error(error.message);
    return mapUserProgress(data);
  }
}
