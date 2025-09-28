
import express from 'express';
import { getDb } from '../db/conn';

const router = express.Router();
const collectionName = 'votes';

// GET: 모든 투표 결과 조회
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const votes = await db.collection(collectionName).aggregate([
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          agendaId: { $toString: '$agendaId' },
          optionId: 1,
          userId: { $toString: '$userId' },
          timestamp: 1
        }
      }
    ]).toArray();
    res.json(votes);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error fetching votes');
  }
});

export default router;
