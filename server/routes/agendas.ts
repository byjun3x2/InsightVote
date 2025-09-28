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

    const { tag } = req.query;
    const filter: any = {};

    if (tag) {
      filter.tags = tag;
    }

    // 마감 시간이 지났지만 여전히 활성 상태인 안건들을 찾아 비활성화시킵니다.
    const now = new Date();
    await db.collection(collectionName).updateMany(
      { isActive: true, deadline: { $ne: null, $lt: now } },
      { $set: { isActive: false } }
    );

    const agendas = await db.collection(collectionName).aggregate([
      { $match: filter }, // 태그 필터링
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
    const { title, options, deadline, voteLimit, startTime, tags } = req.body;
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
      tags: tags || [], // 태그가 없으면 빈 배열로 저장
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

    const { isActive } = req.body;
    await db.collection(collectionName).updateOne({ _id: new ObjectId(id) }, { $set: { isActive } });

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

    // 소유권 확인 디버깅
    console.log('--- Deleting Agenda ---');
    console.log('Agenda Creator ID (type):', typeof agenda.creatorId, agenda.creatorId);
    console.log('User ID from Token (type):', typeof userId, userId);
    
    if (agenda.creatorId && typeof agenda.creatorId.toHexString === 'function') {
      console.log('Agenda Creator ID (string):', agenda.creatorId.toHexString());
    }


    // 소유권 확인
    if (agenda.creatorId.toHexString() !== userId) {
      console.log('Ownership check FAILED.');
      return res.status(403).send('Forbidden: You do not own this agenda');
    }
    
    console.log('Ownership check PASSED.');


    await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
    // 관련된 투표도 삭제
    await db.collection('votes').deleteMany({ agendaId: new ObjectId(id) });

    res.status(200).send('Agenda deleted successfully');
  } catch (e) {
    res.status(500).send('Error deleting agenda');
  }
});

export default router;
