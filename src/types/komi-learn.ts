export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  coverImageUrl?: string;
  price: number;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  enrollments: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  completedLessons: string[]; // lesson IDs
  progressPercentage: number;
  certificateEarned: boolean;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  count: number;
}
