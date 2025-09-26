import express from 'express';
import { getDb } from '../db/conn';
import { ObjectId } from 'mongodb';

const router = express.Router();
const collectionName = 'agendas';

// GET: 모든 안건 조회
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const agendas = await db.collection(collectionName).find({}).toArray();
    
    // MongoDB _id를 id로 변환하여 프론트엔드와 호환성 유지
    res.json(agendas.map(agenda => ({ ...agenda, id: agenda._id.toHexString() })));
  } catch (e) {
    res.status(500).send('Error fetching agendas');
  }
});

// POST: 새 안건 생성
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { title, options } = req.body;
    
    if (!title || !options) {
      return res.status(400).send('Title and options are required');
    }

    const newAgenda = {
      title,
      options: options.map((opt: { text: string }) => ({ ...opt, id: new ObjectId().toHexString() })),
      isActive: true, // 생성 시 기본 활성 상태
      createdAt: new Date(),
    };

    const result = await db.collection(collectionName).insertOne(newAgenda);
    res.status(201).json({ ...newAgenda, id: result.insertedId.toHexString() });
  } catch (e) {
    res.status(500).send('Error creating agenda');
  }
});

// PUT: 안건 수정 (예: 투표 마감)
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Agenda not found');
    }

    res.status(200).send('Agenda updated successfully');
  } catch (e) {
    res.status(500).send('Error updating agenda');
  }
});

// DELETE: 안건 삭제
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send('Agenda not found');
    }

    res.status(200).send('Agenda deleted successfully');
  } catch (e) {
    res.status(500).send('Error deleting agenda');
  }
});

export default router;