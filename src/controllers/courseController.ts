import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { PrismaClient } from '@prisma/client'
import { ApiResponse } from "../utils/ApiResponse";
import { CustomRequest } from "../schemas/CustomRequestSchema";
const prisma = new PrismaClient()


interface course {
    title: string;
    description: string;
    content: string;
    price: number;
}

const createCourses = async (req:CustomRequest, res: Response) => {
    if (!req.admin) {
        return res.status(403).json(
            { 
                message: "Only admins can create the courses"
            }
        )
    }
    const { title, description, content, price } :course = req.body;
    
    try {
        const createCourse = await prisma.course.create({
            data: {
                title,
                description,
                content,
                price,
                instructorId: req.admin?.id
            }
        })

        if (!createCourse) {
            return res.status(402).json(
                new ApiError(
                    null,
                    "Invalid credentials",
                    false
                )
            )
        }

        return res.status(201).json(
            new ApiResponse<course>(
                createCourse,
                `Congrats!! ${req.admin?.username} uh have created a course ${createCourse.title}`,
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

const getCourses = async (req: CustomRequest, res: Response) => {
    if (!req.user || !req.admin) {
        return res.status(403).json(
            {
                message: "Unauthorized request"
            }
        )
    }

    try {
        if (req.user) {
            const loggedInUser = await prisma.user.findFirst({
                where: {
                    email: req.user?.email
                }
            })
            if (!loggedInUser) {
                return res.status(403).json(
                    {
                        messsage: "User not found"
                    }
                )
            }
            const courses = await prisma.course.findMany({
                select: {
                    title: true
                }
            });

            if (!courses || courses.length === 0) {
                return res.status(200).json(
                    new ApiResponse(
                        null,
                        "No courses to show at the moment",
                        true
                    )
                )
            }
            return res.status(200).json(
                new ApiResponse(
                    courses,
                    "No courses to show at the moment",
                    true
                )
            )
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                message: "Internal server error"
            }
        )
    }

}


export {  
    getCourses,
    createCourses
}