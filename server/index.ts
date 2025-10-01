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
app.use(cors());

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

      // 3. 사용자 기존 투표 조회 (있으면 업데이트, 없으면 생성)
      const existingVote = await db.collection('votes').findOne({
        agendaId: new ObjectId(agendaId),
        userId: new ObjectId(userId),
      });

      let savedVote: any = null;
      if (existingVote) {
        // 기존 투표가 있으면 선택지만 변경하고 타임스탬프 갱신
        await db.collection('votes').updateOne(
          { _id: existingVote._id },
          { $set: { optionId, timestamp: new Date() } }
        );
        savedVote = await db.collection('votes').findOne({ _id: existingVote._id });
      } else {
        // 기존 투표가 없으면 새로 생성
        const insertResult = await db.collection('votes').insertOne({
          agendaId: new ObjectId(agendaId),
          optionId,
          userId: new ObjectId(userId),
          timestamp: new Date(),
        });
        savedVote = await db.collection('votes').findOne({ _id: insertResult.insertedId });
      }

      if (savedVote) {
        // 모든 클라이언트에 브로드캐스트 (프론트에서 동일 유저/안건 투표는 덮어씀)
        io.emit('voteUpdate', {
          ...savedVote,
          id: savedVote._id.toString(),
          agendaId: savedVote.agendaId.toString(),
          userId: savedVote.userId.toString(),
        });
      }

    } catch (e) {
      console.error('Error processing vote:', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
  });

  // 채팅방 입장
  socket.on('joinRoom', (agendaId) => {
    socket.join(agendaId);
    console.log(`Socket ${socket.id} joined room ${agendaId}`);
  });

  // 채팅방 퇴장
  socket.on('leaveRoom', (agendaId) => {
    socket.leave(agendaId);
    console.log(`Socket ${socket.id} left room ${agendaId}`);
  });

  // 채팅 메시지 수신 및 브로드캐스트
  socket.on('chatMessage', (data) => {
    const { agendaId, message } = data;
    const user = socket.data.user;

    if (!user) {
      return; // 인증되지 않은 사용자
    }

    const messagePayload = {
      id: new ObjectId().toHexString(), // 고유 메시지 ID
      message,
      sender: {
        id: user.userId,
        name: user.name,
      },
      timestamp: new Date(),
    };

    socket.broadcast.to(agendaId).emit('chatMessage', messagePayload);
    console.log(`Message broadcast to room ${agendaId}:`, messagePayload);
  });
});

const PORT = process.env.PORT || 4000;

// MongoDB 연결 후 서버 시작
connectToServer().then(() => {
  server.listen(PORT, () => {
    console.log(`서버가 실행 중입니다 (포트: ${PORT})`);
  });
});
