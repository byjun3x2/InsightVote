import express, { Request } from 'express';
import { getDb } from '../db/conn';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

// Request 인터페이스를 확장하여 user 속성을 추가합니다.
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();
const collectionName = 'agendas';

// GET: 모든 안건 조회 (투표 수 포함)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const agendas = await db.collection(collectionName).aggregate([
      {
        $lookup: {
          from: 'votes',
          localField: '_id',
          foreignField: 'agendaId',
          as: 'votes'
        }
      },
      {
        $addFields: {
          voteCount: { $size: '$votes' },
          id: { $toString: '$_id' },
          creatorId: { $toString: '$creatorId' }
        }
      },
      {
        $project: {
          votes: 0, // 투표 상세 내역은 보내지 않음
          _id: 0 // id 필드를 사용하므로 _id는 제외
        }
      }
    ]).toArray();
    
    res.json(agendas);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error fetching agendas');
  }
});

// POST: 새 안건 생성 (인증 필요)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const db = getDb();
    const { title, options, deadline, voteLimit, startTime } = req.body;
    const creatorId = req.user?.userId;

    if (!title || !options) {
      return res.status(400).send('Title and options are required');
    }

    const newAgenda = {
      title,
      options: options.map((opt: { text: string }) => ({ ...opt, id: new ObjectId().toHexString() })),
      isActive: true,
      createdAt: new Date(),
      startTime,
      deadline,
      voteLimit,
      creatorId: new ObjectId(creatorId),
    };

    const result = await db.collection(collectionName).insertOne(newAgenda);
    res.status(201).json({ ...newAgenda, id: result.insertedId.toHexString() });
  } catch (e) {
    res.status(500).send('Error creating agenda');
  }
});

// PUT: 안건 수정 (예: 투표 마감) (인증 및 소유권 확인 필요)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    const agenda = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    if (!agenda) {
      return res.status(404).send('Agenda not found');
    }

    // 소유권 확인
    if (agenda.creatorId.toHexString() !== userId) {
      return res.status(403).send('Forbidden: You do not own this agenda');
    }

    res.status(200).send('Agenda updated successfully');
  } catch (e) {
    res.status(500).send('Error updating agenda');
  }
});

// DELETE: 안건 삭제 (인증 및 소유권 확인 필요)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    const agenda = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    if (!agenda) {
      return res.status(404).send('Agenda not found');
    }

    // 소유권 확인
    if (agenda.creatorId.toHexString() !== userId) {
      return res.status(403).send('Forbidden: You do not own this agenda');
    }

    res.status(200).send('Agenda deleted successfully');
  } catch (e) {
    res.status(500).send('Error deleting agenda');
  }
});

export default router;
