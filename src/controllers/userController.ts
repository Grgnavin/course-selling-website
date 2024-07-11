import { UserData } from './../utils/GenerateToken';
import { adminSignupSchema, generateSixDigits } from './../schemas/signupAdminSchema';
import { signupSchema } from './../schemas/signUpSchema';
import { PrismaClient, Role } from '@prisma/client';
import router, { Request, Response } from 'express';
import bcrypt from "bcrypt";
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/GenerateToken';
const prisma = new PrismaClient();

type Admin = {
    username: string;
    password: string;
    email: string;
    token: string;
}

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
                password: hashedPassword,
                role: Role.USER
            }, select: {
                id: true,
                email: true,
                username: true,
                password: true,
                role: true
            }
        });

        const Token = await generateToken(user);
        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(201)
            .cookie("accessToken", Token.accessToken, options)
            .cookie("refreshToken", Token.refreshToken, options)
            .json(
            new ApiResponse(
                {
                    userData: user, Token 
                },
                "User created Successfully"
            )
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            new ApiError(
                null, 
                "Internal server error"
            )
        );
    }
};



const createAdmin = async(req: Request, res: Response) => {
    const { username, password, email, token }: Admin = req.body;

    if (!username.trim() || !password.trim() || !email.trim() || !token.trim()) {
        return res.status(402).json(
            new ApiError(
                null,
                "Credentials are required"
            )
        )
    }

    try {
        const existingAdmin = await prisma.admin.findFirst({
            where: {
                email,
            }
        })
        if(existingAdmin){
            return res.status(401).json(
                new ApiError(
                    null,
                    "User already logged in"
                )
            )
        }
        const hashedPassword = await bcrypt.hash(password, 10) as string;
        const admin = await prisma.admin.create({
            data: {
                username,
                email,
                password: hashedPassword,
                token: parseInt(token)
            }
        })
        if (!admin) {
            return res.status(401).json(
                new ApiError(
                    null,
                    "Wrong credentials"
                )
            )
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(
            new ApiError(
                null, 
                "Internal server error"
            )
        );
    }
}

export {
    createUser,
    createAdmin
}