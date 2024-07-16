import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4000';
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

import userRouter from './router/userRouter';
import AdminRouter from './router/AdminRouter';
import courseRouter from './router/courseRouter';
import PaymentRouter from './router/PaymentRouter';

app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', AdminRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/payment', PaymentRouter);

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});


export { app }