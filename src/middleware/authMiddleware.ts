import  jwt  from 'jsonwebtoken';
import { NextFunction, Response } from "express"
import { ApiError } from "../utils/ApiError";
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const verifyUser = async(req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers['authorization']?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(
                null,
                "UnAuthorized Request",
                false
            )
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        if (!decoded || typeof decoded !== 'object' || !('role' in decoded)) {
            throw new ApiError(
                null,
                "Invalid Token",
                false
            );
        }
        console.log(decoded);
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
