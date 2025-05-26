import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket;

  if (!socket) {
    res.status(500).json({ success: false, message: 'Socket tidak tersedia' });
    return;
  }

  const anySocket = socket as any;

  if (!anySocket.server.io) {
    console.log('🔌 Memulai WebSocket server');

    const io = new Server(anySocket.server, {
      path: '/api/socket',
    });

    io.on('connection', (socket) => {
      console.log('✅ Client terhubung');

      socket.on('message', (msg) => {
        console.log('📩 Pesan diterima:', msg);
        io.emit('message', msg);
      });

      // Ketika ada event user klik
      socket.on('user-klik', (data) => {
        const enrichedData = {
          message: `User ${data.user} melakukan klik`,
          detail: {
            user: data.user,
            country: data.country,
            source: data.source,
            gadget: data.gadget,
            ip: data.ip,
          },
          clickedAt: new Date().toISOString(),
        };

        console.log('⚡ user-klik diterima:', enrichedData);

        // Broadcast ke semua client kecuali pengirim
        socket.broadcast.emit('user-klik', enrichedData);
      });

      socket.on('disconnect', () => {
        console.log('❌ Client terputus');
      });
    });

    anySocket.server.io = io;
  } else {
    console.log('ℹ️ WebSocket server sudah berjalan');
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
