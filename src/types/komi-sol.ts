export interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'published' | 'draft';
  author: string;
  authorId?: string;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  count: number;
}

export interface UserTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
