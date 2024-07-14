import { UserData } from './../utils/GenerateToken';
import { adminSignupSchema, generateSixDigits } from './../schemas/signupAdminSchema';
import { signupSchema } from './../schemas/signUpSchema';
import router, { Request, Response } from 'express';
import bcrypt from "bcrypt";
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/GenerateToken';
import { PrismaClient, Role } from '@prisma/client'
const prisma = new PrismaClient();

type LoginUser = {
    email: string;
    password: string;
    token: number;
}

interface userReponse {
    userData: {
        email: string;
        id: number;
        username: string;
    } | null
}

const createUser = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const { username, password, email } = req.body as signupSchema;

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
                "User created Successfully",
                true
            )
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            new ApiError(
                null, 
                "Internal server error",
                false
            )
        );
    }
};

const loginUser = async(req: Request, res: Response) => {
    const { email, password }: LoginUser = req.body;

    if (!email || !password) {
        return res.status(401).json(
            new ApiError(
                null,
                "Credentials are required",
                false
            )
        )
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(401).json(
                new ApiError(
                    null,
                    "User doesn't exits",
                    false
                )
            )
        }
        
        const isPassValid = await bcrypt.compare(password, user.password);
        
        if (!isPassValid) {
            return res.status(401).json(
                new ApiError(
                    null,
                    "Invalid user password",
                    false
                )
            )
        }
        
        const Token = await generateToken(user);
        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id
            }, select: {
                id: true,
                username: true,
                email: true,
            }
        })

        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
                .cookie("accessToken", Token.accessToken, options)
                .cookie("refreshToken", Token.accessToken, options)
                .json(
                    new ApiResponse<userReponse>(
                        {
                            userData: existingUser
                        },
                        `Welcome back ${existingUser?.username}`,
                        true
                    )
                )
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            new ApiError(
                null,
                "Internal server error",
                false
            )
        )
    }
}

export {
    createUser,
    loginUser
}