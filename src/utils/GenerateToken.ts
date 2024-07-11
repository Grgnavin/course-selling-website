import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface TokenPayload{
    id: number,
    role: Role
}

export type UserData = {
    id: number,
    username: string,
    email: string,
    password: string,
    role: Role
}

const generateAccesstoken = (user:TokenPayload): string => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1h' })
}

const generateRefreshtoken = (user:TokenPayload): string => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7h' })
}

const generateAdmintoken = (user:TokenPayload): string => {
    return jwt.sign(user, process.env.ADMIN_TOKEN_SECRET as string, { expiresIn: '1d' })
}

export async function generateToken(user: UserData) {
    const tokenPayload: TokenPayload = {
        id: user.id,
        role: user.role
    };

    const accessToken = generateAccesstoken(tokenPayload);
    const refreshToken = generateRefreshtoken(tokenPayload);

    if (user.role === Role.ADMIN) {
        const adminToken = generateAdmintoken(tokenPayload);
        return{ adminToken, accessToken, refreshToken }
    }
    return { accessToken, refreshToken }
}