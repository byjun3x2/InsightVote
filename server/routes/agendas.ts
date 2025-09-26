import express from 'express';
import fs from 'fs';
import path from 'path';
import { Agenda } from '../../utils/types';

const router = express.Router();

const agendasPath = path.join(__dirname, '../data/agendas.json');
const agendas: Agenda[] = JSON.parse(fs.readFileSync(agendasPath, 'utf-8'));

// 안건 목록 조회 (활성화된 것만)
router.get('/', (req, res) => {
  res.json(agendas.filter((a) => a.isActive));
});

export default router;
