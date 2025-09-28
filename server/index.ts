import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { getDb } from './db/conn';
import { ObjectId } from 'mongodb';
import { connectToServer } from './db/conn';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import agendaRouter from './routes/agendas';
import votesRouter from './routes/votes';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-key-that-should-be-in-env';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 개발 환경이므로 모든 출처 허용. 배포 시 제한 권장
    methods: ['GET', 'POST'],
  },
});

// Socket.IO 인증 미들웨어
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    // 소켓에 사용자 정보를 저장하여 이후 이벤트 핸들러에서 사용
    socket.data.user = decoded;
    next();
  });
});

// CORS 미들웨어 설정
app.use(cors({ origin: ['http://localhost:3000', 'http://192.168.35.103:3000'] }));

app.use(express.json());

// API 라우터 등록
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/agendas', agendaRouter);
app.use('/api/votes', votesRouter);

// Socket.IO 연결 및 이벤트 처리
io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id, 'User:', socket.data.user?.email);

  socket.on('voteSubmit', async (voteData) => {
    const db = getDb();
    const { agendaId, optionId } = voteData;
    const userId = socket.data.user?.userId;

    if (!userId) {
      return console.error('Vote submitted by unauthenticated user');
    }

    try {
      const agenda = await db.collection('agendas').findOne({ _id: new ObjectId(agendaId) });

      if (!agenda) {
        return console.error(`Agenda with id ${agendaId} not found`);
      }

      // 1. 투표 기간 확인 (시작 시간 및 마감 시간)
      const now = new Date();
      if (agenda.startTime && new Date(agenda.startTime) > now) {
        console.log(`Vote rejected: Agenda ${agendaId} has not started yet.`);
        return;
      }
      if (agenda.deadline && new Date(agenda.deadline) < now) {
        console.log(`Vote rejected: Agenda ${agendaId} has passed its deadline.`);
        return;
      }

      // 2. 선착순 투표 제한 확인
      if (agenda.voteLimit && agenda.voteLimit > 0) {
        const voteCount = await db.collection('votes').countDocuments({ agendaId: new ObjectId(agendaId) });
        if (voteCount >= agenda.voteLimit) {
          console.log(`Vote rejected: Agenda ${agendaId} has reached its vote limit.`);
          return;
        }
      }

      // 3. 중복 투표 확인
      const existingVote = await db.collection('votes').findOne({
        agendaId: new ObjectId(agendaId),
        userId: new ObjectId(userId),
      });

      if (existingVote) {
        console.log(`User ${userId} already voted on agenda ${agendaId}`);
        return;
      }

      // 새 투표 기록
      const result = await db.collection('votes').insertOne({
        agendaId: new ObjectId(agendaId),
        optionId,
        userId: new ObjectId(userId),
        timestamp: new Date(),
      });

      // 방금 삽입한 투표 데이터를 다시 조회하여 클라이언트에 전달 (데이터 형식 일관성)
      const newVote = await db.collection('votes').findOne({ _id: result.insertedId });

      if (newVote) {
        console.log('받은 투표 데이터:', voteData, 'From user:', userId);

        // 받은 투표를 모든 클라이언트에 브로드캐스트
        io.emit('voteUpdate', {
          ...newVote,
          id: newVote._id.toString(),
          agendaId: newVote.agendaId.toString(),
          userId: newVote.userId.toString(),
        });
      }

    } catch (e) {
      console.error('Error processing vote:', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

// MongoDB 연결 후 서버 시작
connectToServer().then(() => {
  server.listen(PORT, () => {
    console.log(`서버가 실행 중입니다 (포트: ${PORT})`);
  });
});
