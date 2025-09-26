import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 개발 중 모든 도메인 허용 (실제 배포 시 도메인 제한 필요)
    methods: ['GET', 'POST']
  }
});

// 클라이언트 연결 시 처리
io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id);

  // 클라이언트가 투표 제출 시 이벤트 처리하기
  socket.on('voteSubmit', (voteData) => {
    console.log('받은 투표 데이터:', voteData);

    // 받아서 다시 모든 클라이언트에 투표 업데이트 이벤트 전송하기
    io.emit('voteUpdate', voteData);
  });

  // 클라이언트 연결 해제 시 로그찍기
  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
  });
});

// 서버 시작
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO 서버 실행 중 (포트: ${PORT})`);
});
