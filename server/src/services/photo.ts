import db from '../db/index.js';
import type { Photo, Album } from '../models/index.js';

export class PhotoService {
  getByAlbumId(albumId: number) {
    return db.prepare(
      'SELECT * FROM photos WHERE album_id = ? ORDER BY created_at DESC'
    ).all(albumId);
  }

  create(albumId: number, url: string, filename: string, size: number) {
    const result = db.prepare(
      'INSERT INTO photos (album_id, url, filename, size) VALUES (?, ?, ?, ?)'
    ).run(albumId, url, filename, size);

    // 更新相册封面
    const photo = db.prepare('SELECT url FROM photos WHERE id = ?').get(result.lastInsertRowid) as Photo;
    db.prepare('UPDATE albums SET cover_url = ? WHERE id = ?').run(photo.url, albumId);

    return this.getById(result.lastInsertRowid as number);
  }

  getById(id: number) {
    return db.prepare('SELECT * FROM photos WHERE id = ?').get(id);
  }

  delete(id: number, userId: number) {
    const photo = this.getById(id) as Photo | undefined;
    if (!photo) {
      throw new Error('图片不存在');
    }

    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(photo.album_id) as Album | undefined;
    if (!album || album.user_id !== userId) {
      throw new Error('无权限删除');
    }

    db.prepare('DELETE FROM photos WHERE id = ?').run(id);

    // 如果删的是封面，更新封面
    if (album.cover_url === photo.url) {
      const remaining = db.prepare('SELECT url FROM photos WHERE album_id = ? LIMIT 1').get(album.id) as Photo | undefined;
      db.prepare('UPDATE albums SET cover_url = ? WHERE id = ?').run(remaining?.url || null, album.id);
    }

    return { success: true };
  }
}