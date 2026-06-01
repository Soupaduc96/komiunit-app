import { KomiLearnService } from '@/services/komi-learn/course-service';
import { Course, Lesson, UserProgress, CourseCategory } from '@/types/komi-learn';

export class KomiLearnRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getCourses(category?: string): Promise<Course[]> {
    return KomiLearnService.getCourses(category);
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    return KomiLearnService.getCourseById(id);
  }

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    return KomiLearnService.getCourseLessons(courseId);
  }

  async getCategories(): Promise<CourseCategory[]> {
    return KomiLearnService.getCategories();
  }

  async enrollCourse(courseId: string): Promise<UserProgress> {
    return KomiLearnService.enrollCourse(this.userId, courseId);
  }

  async getEnrolledCourses(): Promise<UserProgress[]> {
    return KomiLearnService.getUserCourses(this.userId);
  }

  async getCourseProgress(courseId: string): Promise<UserProgress | undefined> {
    return KomiLearnService.getCourseProgress(this.userId, courseId);
  }

  async updateProgress(courseId: string, lessonId: string): Promise<UserProgress> {
    return KomiLearnService.updateProgress(this.userId, courseId, lessonId);
  }
}
