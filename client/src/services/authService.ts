import { User, LoginData, RegisterData } from '../types';

class AuthService {
  private readonly USERS_KEY = 'mock_interview_users';
  private readonly CURRENT_USER_KEY = 'mock_interview_current_user';

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  login(data: LoginData): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(u => u.email === data.email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // In a real app, you'd verify the password hash
    const storedPassword = localStorage.getItem(`password_${user.id}`);
    if (storedPassword !== data.password) {
      return { success: false, message: 'Invalid password' };
    }

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, message: 'Login successful', user };
  }

  register(data: RegisterData): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    
    if (users.find(u => u.email === data.email)) {
      return { success: false, message: 'Email already exists' };
    }

    const user: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(`password_${user.id}`, data.password);
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

    return { success: true, message: 'Registration successful', user };
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  private getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }
}

export const authService = new AuthService();