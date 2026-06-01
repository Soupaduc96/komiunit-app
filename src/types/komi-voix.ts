export interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  contactName: string;
  contactPhone: string;
  contactAvatar?: string;
  addedAt: string;
  updatedAt: string;
}

export interface CallLog {
  id: string;
  callerId: string;
  recipientId: string;
  duration: number; // in seconds
  status: 'completed' | 'missed' | 'rejected';
  startedAt: string;
  endedAt?: string;
}

export interface VoiceMessage {
  id: string;
  senderId: string;
  recipientId: string;
  duration: number; // in seconds
  audioUrl: string;
  transcription?: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}
