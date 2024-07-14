import  jwt  from 'jsonwebtoken';
import { NextFunction, Response } from "express"
import { ApiError } from "../utils/ApiError";
import { Prisma, PrismaClient } from '@prisma/client/edge';
import { CustomRequest } from '../schemas/CustomRequestSchema';
const prisma = new PrismaClient();


export const verifyUser = async(req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers['authorization']?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json(
                new ApiError(
                    null, 
                    "Unauthorized Request", 
                    false
                ));
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: number, role: string, token?: number };
        console.log("Decoded token: ", decoded);
        
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
                throw new ApiError(
                    null,
                    "Admin not found",
                    false
                )
            }
            req.admin = admin;
            console.log("ReqAdmin::", req.admin);
            next();
        }else if(decoded?.role === "USER"){
            const user = await prisma.user.findFirst({
                where: {
                    id: decoded?.id
                }
            })
            if (!user) {
                throw new ApiError(
                    null,
                    "User not found",
                    false
                )
            }
            req.user = user;
            next();
        }

    } catch (error) {
        console.log(error);
        throw new ApiError(
            null,
            "Token has expired",
            false
        )
    }
}
