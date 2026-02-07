import type { DatabaseAdapter, User, CreateUserData } from '../types';

export class MemoryAdapter implements DatabaseAdapter {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();

  async findUserByEmail(email: string): Promise<User | null> {
    const id = this.emailIndex.get(email.toLowerCase());
    if (!id) return null;
    return this.users.get(id) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    this.emailIndex.set(data.email.toLowerCase(), id);
    
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updated = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };

    this.users.set(id, updated);

    if (data.email && data.email !== user.email) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.emailIndex.set(data.email.toLowerCase(), id);
    }

    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.emailIndex.delete(user.email.toLowerCase());
      this.users.delete(id);
    }
  }

  clear(): void {
    this.users.clear();
    this.emailIndex.clear();
  }
}
