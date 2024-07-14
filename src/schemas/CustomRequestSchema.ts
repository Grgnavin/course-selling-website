import { $Enums } from '@prisma/client/edge';
import { Request } from "express";
export interface CustomRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
        password: string;
        createdAt: Date;
        role: $Enums.Role;
    } | null;
    admin?:  {
        id: number;
        username: string;
        email: string;
        password: string;
        role: $Enums.Role;
        token: number;
        createdAt: Date;
    } | null;
}
