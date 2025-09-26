import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Request 인터페이스를 확장하여 user 속성을 추가합니다.
interface AuthenticatedRequest extends Request {
  user?: any;
}

const JWT_SECRET = 'your-super-secret-key-that-should-be-in-env';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // 토큰이 없음
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403); // 토큰이 유효하지 않음
    }
    req.user = user;
    next();
  });
};
