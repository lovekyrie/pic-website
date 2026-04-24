import db from '../db/index.js';
import type { Album } from '../models/index.js';

export class AlbumService {
  getAll() {
    return db.prepare(`
      SELECT albums.*, users.username as owner_name
      FROM albums
      JOIN users ON albums.user_id = users.id
      ORDER BY albums.created_at DESC
    `).all();
  }

  getById(id: number) {
    return db.prepare(`
      SELECT albums.*, users.username as owner_name
      FROM albums
      JOIN users ON albums.user_id = users.id
      WHERE albums.id = ?
    `).get(id);
  }

  create(name: string, description: string, userId: number) {
    const result = db.prepare(
      'INSERT INTO albums (name, description, user_id) VALUES (?, ?, ?)'
    ).run(name, description, userId);
    return this.getById(result.lastInsertRowid as number);
  }

  delete(id: number, userId: number) {
    const album = this.getById(id) as Album | undefined;
    if (!album) {
      throw new Error('相册不存在');
    }
    if (album.user_id !== userId) {
      throw new Error('无权限删除');
    }
    db.prepare('DELETE FROM photos WHERE album_id = ?').run(id);
    db.prepare('DELETE FROM albums WHERE id = ?').run(id);
    return { success: true };
  }
}