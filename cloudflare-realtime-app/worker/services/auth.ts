import { generateId } from "../utils";

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

export class AuthService {
  constructor(private db: D1Database) {}

  // Simple password hashing (for demo purposes - in production use proper hashing)
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "DEMO_SALT");
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Register a new user
  async register(username: string, password: string): Promise<User | { error: string }> {
    try {
      // Check if user exists
      const existingUser = await this.findUserByUsername(username);
      if (existingUser) {
        return { error: "Username already exists" };
      }

      const userId = generateId();
      const hashedPassword = await this.hashPassword(password);
      const now = new Date().toISOString();

      await this.db.prepare(`
        INSERT INTO users (id, username, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(userId, username, hashedPassword, now).run();

      return {
        id: userId,
        username,
        created_at: now
      };
    } catch (error) {
      return { error: "Registration failed" };
    }
  }

  // Login user
  async login(username: string, password: string): Promise<User | { error: string }> {
    try {
      const hashedPassword = await this.hashPassword(password);

      const result = await this.db.prepare(`
        SELECT id, username, created_at
        FROM users
        WHERE username = ? AND password_hash = ?
      `).bind(username, hashedPassword).first();

      if (!result) {
        return { error: "Invalid username or password" };
      }

      return result as User;
    } catch (error) {
      return { error: "Login failed" };
    }
  }

  // Find user by username
  async findUserByUsername(username: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT id, username, created_at
      FROM users
      WHERE username = ?
    `).bind(username).first();

    return result as User | null;
  }

  // Find user by ID
  async findUserById(userId: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT id, username, created_at
      FROM users
      WHERE id = ?
    `).bind(userId).first();

    return result as User | null;
  }

  // Create a session
  async createSession(userId: string): Promise<Session> {
    const sessionId = generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = {
      id: sessionId,
      user_id: userId,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    await this.db.prepare(`
      INSERT INTO sessions (id, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(session.id, session.user_id, session.created_at, session.expires_at).run();

    return session;
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<Session | null> {
    const result = await this.db.prepare(`
      SELECT id, user_id, created_at, expires_at
      FROM sessions
      WHERE id = ? AND expires_at > datetime('now')
    `).bind(sessionId).first();

    return result as Session | null;
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    await this.db.prepare(`
      DELETE FROM sessions WHERE id = ?
    `).bind(sessionId).run();
  }

  // Get user from session cookie
  async getUserFromCookie(cookieHeader: string | null): Promise<User | null> {
    if (!cookieHeader) return null;

    const cookies = this.parseCookies(cookieHeader);
    const sessionId = cookies.session_id;

    if (!sessionId) return null;

    const session = await this.getSession(sessionId);
    if (!session) return null;

    return await this.findUserById(session.user_id);
  }

  // Helper to parse cookies
  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  // Create session cookie
  createSessionCookie(sessionId: string): string {
    return `session_id=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
  }

  // Clear session cookie
  clearSessionCookie(): string {
    return `session_id=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
  }
}