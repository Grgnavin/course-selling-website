import bcrypt  from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';
import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { generateSixDigits } from '../schemas/signupAdminSchema';
import { generateToken } from '../utils/GenerateToken';
const prisma = new PrismaClient();


type Admin = {
    username: string;
    password: string;
    email: string;
    token: string;
}


const createAdmin = async(req: Request, res: Response) => {
    const { username, password, email, token }: Admin = req.body;

    if (!username.trim() || !password.trim() || !email.trim() || !token.trim()) {
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
                token: parseInt(token),
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
                token: parseInt(token)
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
        const Token = await generateToken(admin);
        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(201)
                .cookie("accessToken", Token.accessToken, options)
                .cookie("refreshToken", Token.accessToken, options)
                .cookie("adminToken", Token.accessToken, options)
                .json(
                    new ApiResponse(
                        {
                            data: admin, Token
                        },
                        "Ädmin created sucessfully",
                        true
                    )
                )
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
    createAdmin
}