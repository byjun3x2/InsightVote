import express from 'express';
import { getDb } from '../db/conn';

const router = express.Router();
const collectionName = 'users';

// GET: 모든 사용자 목록 조회 (id, username, name)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    // 비밀번호를 제외한 필드만 선택하여 반환
    const users = await db.collection(collectionName).find({}, {
      projection: { password: 0 }
    }).toArray();
    
    res.json(users.map(user => ({ ...user, id: user._id.toHexString() })));
  } catch (e) {
    res.status(500).send('Error fetching users');
  }
});

export default router;
