/**
 * Data mappers: Supabase snake_case rows → app camelCase types.
 * Every mapper returns undefined when given null/undefined input.
 */

import { Send, Recipient } from '@/types/komi-send';
import { Solution, SolutionCategory, UserTicket } from '@/types/komi-sol';
import { Product, CartItem, Cart, Order, ProductCategory } from '@/types/komi-marche';
import { Course, Lesson, UserProgress, CourseCategory } from '@/types/komi-learn';
import { Contact, CallLog, VoiceMessage } from '@/types/komi-voix';
import { Wallet, Transaction, TransactionType, TransactionStatus } from '@/types/wallet';

// ─── User ────────────────────────────────────────────────────────────────────

export function mapUser(row: any) {
  if (!row) return undefined;
  return {
    id: row.id,
    email: row.email ?? '',
    fullName: row.full_name ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    phone: row.phone ?? undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

// ─── KomiSend ────────────────────────────────────────────────────────────────

export function mapSend(row: any): Send {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    recipientName: row.recipient?.full_name ?? row.recipient_name ?? undefined,
    amount: parseFloat(row.amount ?? 0),
    status: row.status as Send['status'],
    description: row.description ?? undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapRecipient(row: any): Recipient {
  return {
    id: row.id,
    name: row.full_name ?? row.name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? undefined,
    avatar: row.avatar_url ?? undefined,
    lastSent: row.last_sent ?? undefined,
  };
}

// ─── KomiSol ─────────────────────────────────────────────────────────────────

export function mapSolution(row: any): Solution {
  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    category: row.category ?? '',
    status: row.status as Solution['status'],
    author: row.author_name ?? row.author ?? 'KomiUnit Team',
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapSolutionCategory(row: any): SolutionCategory {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    icon: row.icon ?? undefined,
    count: row.count ?? 0,
  };
}

export function mapUserTicket(row: any): UserTicket {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? '',
    description: row.description ?? '',
    status: row.status as UserTicket['status'],
    priority: row.priority as UserTicket['priority'],
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

// ─── KomiMarché ──────────────────────────────────────────────────────────────

export function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    price: parseFloat(row.price ?? 0),
    discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
    imageUrl: row.image_url ?? '',
    category: row.category ?? '',
    stock: row.stock ?? 0,
    rating: parseFloat(row.rating ?? 0),
    reviews: row.reviews ?? 0,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapCartItem(row: any): CartItem {
  return {
    id: row.id,
    productId: row.product_id,
    product: row.products ? mapProduct(row.products) : ({} as Product),
    quantity: row.quantity ?? 1,
    addedAt: row.added_at ?? '',
  };
}

export function mapCart(userId: string, items: CartItem[]): Cart {
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
  return {
    id: userId,
    userId,
    items,
    totalAmount,
    updatedAt: new Date().toISOString(),
  };
}

export function mapOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    items: (row.order_items ?? []).map((oi: any) => ({
      id: oi.id,
      productId: oi.product_id,
      product: oi.products ? mapProduct(oi.products) : ({} as Product),
      quantity: oi.quantity,
      addedAt: row.created_at ?? '',
    })),
    totalAmount: parseFloat(row.total_amount ?? 0),
    status: row.status as Order['status'],
    shippingAddress: row.shipping_address ?? '',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapProductCategory(row: any): ProductCategory {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    icon: row.icon ?? undefined,
    count: row.count ?? 0,
  };
}

// ─── KomiLearn ───────────────────────────────────────────────────────────────

export function mapCourse(row: any): Course {
  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    instructorId: row.instructor_id ?? '',
    instructorName: row.instructor_name ?? '',
    coverImageUrl: row.cover_image_url ?? undefined,
    price: parseFloat(row.price ?? 0),
    duration: row.duration ?? 0,
    level: row.level as Course['level'],
    rating: parseFloat(row.rating ?? 0),
    enrollments: row.enrollments ?? 0,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapLesson(row: any): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title ?? '',
    description: row.description ?? '',
    content: row.content ?? '',
    videoUrl: row.video_url ?? undefined,
    duration: row.duration ?? 0,
    order: row.lesson_order ?? row.order ?? 0,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapUserProgress(row: any): UserProgress {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    course: row.courses ? mapCourse(row.courses) : undefined,
    completedLessons: row.completed_lessons ?? [],
    progressPercentage: row.progress_percentage ?? 0,
    certificateEarned: row.certificate_earned ?? false,
    startedAt: row.started_at ?? '',
    completedAt: row.completed_at ?? undefined,
    updatedAt: row.updated_at ?? '',
  };
}

export function mapCourseCategory(row: any): CourseCategory {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    icon: row.icon ?? undefined,
    count: row.count ?? 0,
  };
}

// ─── KomiVoix ────────────────────────────────────────────────────────────────

export function mapContact(row: any): Contact {
  return {
    id: row.id,
    userId: row.user_id,
    contactUserId: row.contact_user_id,
    contactName: row.contact_name ?? '',
    contactPhone: row.contact_phone ?? '',
    contactAvatar: row.contact_avatar ?? undefined,
    addedAt: row.added_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapCallLog(row: any): CallLog {
  return {
    id: row.id,
    callerId: row.caller_id,
    recipientId: row.recipient_id,
    duration: row.duration ?? 0,
    status: row.status as CallLog['status'],
    startedAt: row.started_at ?? '',
    endedAt: row.ended_at ?? undefined,
  };
}

export function mapVoiceMessage(row: any): VoiceMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    duration: row.duration ?? 0,
    audioUrl: row.audio_url ?? '',
    transcription: row.transcription ?? undefined,
    isRead: row.is_read ?? false,
    sentAt: row.sent_at ?? '',
    readAt: row.read_at ?? undefined,
  };
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export function mapWallet(row: any): Wallet {
  if (!row) throw new Error('mapWallet: received null row');
  return {
    id: row.id,
    userId: row.user_id,
    balance: parseFloat(row.balance ?? 0),
    currency: row.currency || 'USD',
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    walletId: row.wallet_id,
    userId: row.user_id,
    type: row.type as TransactionType,
    amount: parseFloat(row.amount ?? 0),
    balanceAfter: parseFloat(row.balance_after ?? 0),
    description: row.description ?? undefined,
    referenceId: row.reference_id ?? undefined,
    referenceType: row.reference_type ?? undefined,
    status: row.status as TransactionStatus,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at ?? '',
  };
}
