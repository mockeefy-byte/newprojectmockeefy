export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  questions: InterviewQuestion[];
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  expectedAnswer?: string;
  points: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface HR {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  experience: number; // in years
  specialization: string[];
  status: 'active' | 'inactive';
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string[];
  experience: number; // in years
  company: string;
  position: string;
  bio: string;
  rating: number; // 1-5
  totalInterviews: number;
  status: 'active' | 'inactive';
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate: number;
  createdAt: string;
  updatedAt: string;
}