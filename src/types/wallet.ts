export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_out'
  | 'transfer_in'
  | 'payment'
  | 'refund';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
