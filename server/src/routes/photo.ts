import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PhotoService } from '../services/photo.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { uploadToLocal } from '../services/oss.js';

const router = Router();
const photoService = new PhotoService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 获取相册中的照片
router.get('/album/:albumId', (req: Request, res: Response) => {
  const photos = photoService.getByAlbumId(Number(req.params.albumId));
  res.json(photos);
});

// 上传照片（需登录）
router.post('/upload', authMiddleware, upload.single('photo'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择图片' });
  }

  const albumId = Number(req.body.albumId);
  if (!albumId) {
    return res.status(400).json({ error: '请指定相册' });
  }

  try {
    const url = await uploadToLocal(req.file);
    const photo = photoService.create(albumId, url, req.file.originalname, req.file.size);
    res.json(photo);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 删除照片（需登录）
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    photoService.delete(Number(req.params.id), req.userId!);
    res.json({ success: true });
  } catch (e: any) {
    res.status(403).json({ error: e.message });
  }
});

export default router;