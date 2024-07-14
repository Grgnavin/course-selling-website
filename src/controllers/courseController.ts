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
                {
                    message: "Can't create course"
                }
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
            {
                message: "Internal server error"
            }
        )
    }

}

const getCourses = async (req: CustomRequest, res: Response) => {
    if (!req.user && !req.admin) {
        return res.status(403).json(
            {
                message: "Unauthorized request"
            }
        )
    }

    try {
        let courses;
        if (req.user) {
            const loggedInUser = await prisma.user.findUnique({
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
            courses = await prisma.course.findMany({
                select: {
                    title: true
                }
            });

        }else if(req.admin) {
            const loggedInAdmin = await prisma.admin.findFirst({
                where: {
                    token: req.admin?.token
                }
            })
            if (!loggedInAdmin) {
                return res.status(403).json(
                    {
                        messsage: "Admin not found"
                    }
                )
            }
            courses = await prisma.course.findMany({
                select: {
                    title: true,
                    description: true,
                    content: true,
                }
            });
        }
        
        const responseMessage = courses && courses.length > 0 
                            ? `Here are all the ${courses.length} courses`
                            : "No courses to show at the moment"; 
        return res.status(200).json(
            new ApiResponse(
                courses,
                responseMessage,
                true
            )
        )
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