import  jwt  from 'jsonwebtoken';
import { NextFunction, Response } from "express"
import { ApiError } from "../utils/ApiError";
import { PrismaClient } from '@prisma/client';
import { CustomRequest } from '../schemas/CustomRequestSchema';
const prisma = new PrismaClient();


export const verifyUser = async(req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers['authorization']?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json(
                {
                    message: "Unauthorized request"
                }
            )
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: number, role: string, token?: number };
        
        if (!decoded || typeof decoded !== 'object' || !('role' in decoded)) {
            return res.status(401).json(
                new ApiError(
                    null, 
                    "Invalid Token", 
                    false
                ));
        }
        if (decoded?.role === "ADMIN") {
            const admin = await prisma.admin.findFirst({
                where: {
                    token: decoded?.token
                }
            })
            if (!admin) {
                return res.status(402).json({
                    message: "Admin not found from middleware"
                })
            }
            req.admin = admin;
            next();
        }else if(decoded?.role === "USER"){
            const user = await prisma.user.findFirst({
                where: {
                    id: decoded?.id
                }
            })
            if (!user) {
                return res.status(402).json(
                    {
                        message: "User not found from middleware"
                    }
                )
            }
            req.user = user;
            next();
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}
