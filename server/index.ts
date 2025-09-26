import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectToServer } from './db/conn';
import agendaRouter from './routes/agendas'; // 별도 라우터 사용 시

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 개발 환경이므로 모든 출처 허용. 배포 시 제한 권장
    methods: ['GET', 'POST'],
  },
});

// CORS 미들웨어 설정
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

// API 라우터 등록
app.use('/api/agendas', agendaRouter);

// Socket.IO 연결 및 이벤트 처리
io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id);

  socket.on('voteSubmit', (voteData) => {
    console.log('받은 투표 데이터:', voteData);

    // 여기에 투표 데이터 검증/처리 로직 추가 가능

    // 받은 투표를 모든 클라이언트에 브로드캐스트
    io.emit('voteUpdate', voteData);
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
