import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4000';
app.use(cors({
    origin: corsOrigin,
    credentials: true
}))

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true , limit: "16kb"}));
app.use(cookieParser());


import userRouter from "./router/userRouter";
import adminRouter from "./router/AdminRouter";
import courseRouter from "./router/courseRouter"

app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/courses', courseRouter);


export { app };