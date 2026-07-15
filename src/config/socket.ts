import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected to WebSocket: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitTaskEvent = (actionType: 'created' | 'updated' | 'status_updated' | 'deleted', taskData: any): void => {
  if (io) {
    io.emit('task_updated', {
      action: actionType,
      timestamp: new Date(),
      data: taskData,
    });
    console.log(`Broadcasted real-time event: task_updated [Action: ${actionType}]`);
  } else {
    console.warn('Socket.io is not initialized yet. Skipping broadcast.');
  }
};
