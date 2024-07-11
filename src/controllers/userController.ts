import { signupSchema } from './../schemas/signUpSchema';
import { PrismaClient } from '@prisma/client';
import router, { Request, Response } from 'express';
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

const createUser = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { username, password, email }: User = req.body as signupSchema;

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
        const hashedPassword = await bcrypt.hash(password, 10) as string;
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword
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

// const createAdmin = async(req: Request, res: Response) => {

// }

export {
    createUser
}