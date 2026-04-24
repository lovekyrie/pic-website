import { Router, Request, Response } from 'express';
import { AlbumService } from '../services/album.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
const albumService = new AlbumService();

// 获取所有相册（公开）
router.get('/', (_req: Request, res: Response) => {
  const albums = albumService.getAll();
  res.json(albums);
});

// 获取单个相册
router.get('/:id', (req: Request, res: Response) => {
  const album = albumService.getById(Number(req.params.id));
  if (!album) {
    return res.status(404).json({ error: '相册不存在' });
  }
  res.json(album);
});

// 创建相册（需登录）
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: '请填写相册名称' });
  }
  const album = albumService.create(name, description || '', req.userId!);
  res.json(album);
});

// 删除相册（需登录）
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    albumService.delete(Number(req.params.id), req.userId!);
    res.json({ success: true });
  } catch (e: any) {
    res.status(403).json({ error: e.message });
  }
});

export default router;