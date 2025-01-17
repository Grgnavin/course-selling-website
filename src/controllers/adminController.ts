import bcrypt  from 'bcrypt';
import { $Enums, PrismaClient, Role } from '@prisma/client';
import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { generateSixDigits } from '../schemas/signupAdminSchema';
import { generateToken, UserData } from '../utils/GenerateToken';
import * as z  from "zod";
import { adminSigninSchema } from '../schemas/signinAdminschema';
const prisma = new PrismaClient();


type Admin = {
    username: string;
    password: string;
    email: string;
    token: number;
}

type LoginAdmin = {
    email: string;
    password: string;
    token: number;
}

interface admin {
    id: number;
    username: string;
    email: string;
    password: string;
    role: $Enums.Role;
    token: number;
    createdAt: Date;
}

interface userResponse {
    user: {
        id: number;
        username: string;
        email: string;
    } | null;
}

const createAdmin = async(req: Request, res: Response) => {
    const { username, password, email, token }: Admin = req.body;

    if (!username.trim() || !password.trim() || !email.trim() || !token) {
        return res.status(402).json(
            new ApiError(
                null,
                "Credentials are required",
                false
            )
        )
    }

    try {
        const existingAdmin = await prisma.admin.findFirst({
            where: {
                token,
            }
        })
        if(existingAdmin){
            return res.status(401).json(
                {
                    message: "Admin already logged in"
                }
                )
        }
        const hashedPassword = await bcrypt.hash(password, 10) as string;
        const admin = await prisma.admin.create({
            data: {
                username,
                email,
                password: hashedPassword,
                token
            }
        })
        if (!admin) {
            return res.status(401).json(
                new ApiError(
                    null,
                    "Wrong credentials",
                    false
                )
            )
        }
        return res.status(201)
                .json(
                    new ApiResponse<admin>(
                        admin,
                        "Admin created sucessfully",
                        true
                    )
                )
    } catch (error) {
        console.error(error);
        prisma.$disconnect();
        res.status(500).json(
            new ApiError(
                null, 
                "Internal server error",
                false
            )
        );
    }
}

const loginAdmin = async(req: Request, res: Response) => {
    const { email, password, token }: LoginAdmin = req.body;

    if (!email || !password || !token) {
        return res.status(401).json(
            {
                message: "Credentials are required"
            }
        )
    }

    try {
        const admin = await prisma.admin.findFirst({
            where: {
                token,
            }
        })
        
        if (!admin) {
            return res.status(401).json(
                {
                    message: "Admin doesn't exits"
                }
            )
        }
        
        const isPassValid = await bcrypt.compare(password, admin.password);
        
        if (!isPassValid) {
            return res.status(401).json(
                {
                    message: "Invalid user password"
                }
            )
        }
        
        const Token = await generateToken(admin);
        const user = await prisma.admin.findUnique({
            where: {
                id: admin.id
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
        console.log(Token.accessToken);
        
        return res.status(200)
                .cookie("accessToken", Token.accessToken, options)
                .cookie("refreshToken", Token.accessToken, options)
                .cookie("adminToken", Token.accessToken, options)
                .json(
                    new ApiResponse<{ user: typeof user }>(
                        {
                            user
                        },
                        `Welcome back admin Mr.${user?.username}`,
                        true
                    )
                )
    } catch (error) {
        console.log(error);
        prisma.$disconnect();
        return res.status(500).json(
            {
                message: "Internal server error"
            }
            )
    }
}
const getAdminToken = async(req: Request, res: Response)=> {
    return res.status(201).json(
        new ApiResponse(
            generateSixDigits(),
            "Here is your token",
            true
        )
    )
}

export { 
    getAdminToken,
    createAdmin,
    loginAdmin
}