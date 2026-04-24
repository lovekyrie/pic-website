import db from '../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js';
import type { User } from '../models/index.js';

export class AuthService {
  register(username: string, password: string) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password) VALUES (?, ?)'
    ).run(username, hashedPassword);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
    const token = this.generateToken(user.id);

    return { user: { id: user.id, username: user.username }, token };
  }

  login(username: string, password: string) {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error('用户名或密码错误');
    }

    const token = this.generateToken(user.id);
    return { user: { id: user.id, username: user.username }, token };
  }

  private generateToken(userId: number) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  getUserById(id: number) {
    const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(id);
    if (!user) throw new Error('用户不存在');
    return user;
  }
}