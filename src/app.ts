import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import { createServer } from 'http';
import { connectDB } from './config/db';
import { setupSwagger } from './config/swagger';
import { initSocket } from './config/socket';
import authRouter from './routes/auth.routes';
import taskRouter from './routes/task.routes';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
  origin: '*', // Allows requests from any local frontend repository port
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

setupSwagger(app);

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

initSocket(httpServer);

const bootstrap = async () => {
  await connectDB();
  
  httpServer.listen(PORT, () => {
    console.log(`Server is listening on: http://localhost:${PORT}`);
  });
};

bootstrap();
