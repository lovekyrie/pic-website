import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();
const authService = new AuthService();

// 注册
router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }
  try {
    const result = authService.register(username, password);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// 登录
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '请填写用户名和密码' });
  }
  try {
    const result = authService.login(username, password);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

// 获取当前用户
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = authService.getUserById(req.userId!);
  res.json(user);
});

export default router;