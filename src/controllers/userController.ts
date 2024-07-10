import { PrismaClient } from '@prisma/client';
import router, { Request, Response } from 'express';
const prisma = new PrismaClient();

export interface User {
    username: string;
    password: string;
    email: string;
}

const createUser = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { username, password, email }: User = req.body as User;

        if (!username || !password || !email) {
            return res.status(400).json({
                msg: "Missing the required fields"
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if(existingUser) return res.json({ message: "Already Logged in" })

        const user: User = await prisma.user.create({
            data: {
                email,
                username,
                password
            }, select: {
                email: true,
                username: true,
                password: true
            }
        });

        res.status(201).json({
            user,
            msg: "User created successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};

export {
    createUser
}