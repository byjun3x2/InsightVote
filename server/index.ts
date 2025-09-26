import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 개발용 모든 도메인 허용
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id);

  socket.on('message', (msg) => {
    console.log('받은 메시지:', msg);
    io.emit('message', msg); // 연결된 모두에게 메시지 전달
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 끊김:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
