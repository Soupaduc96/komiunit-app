export interface Send {
  id: string;
  senderId: string;
  recipientId: string;
  recipientName?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  lastSent?: string;
}
