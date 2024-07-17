import { $Enums } from '@prisma/client';
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
import { getEsewaPaymentHash, verifyEsewaPayment } from '../utils/esewa';
import { string } from 'zod';
const prisma = new PrismaClient();

type course =  {
    id: number;
    title: string;
    description: string;
    content: string;
    instructorId: number;
    price: number;
} | null

type InitializeEsewa = {
    courseId: string,
    Price: string
}

const initializeEsewa = async (req: Request, res: Response) => {
    try {
        const { courseId, Price }: InitializeEsewa = req.body;

        const course: course = await prisma.course.findFirst({
            where: {
                id: parseInt(courseId)
            }
        })

        if (!course) {
            return res.status(400).send({
                success: false,
                message: "Course not found",
        });
    }
        const purchaseCourseData = await prisma.purchasedCourse.create({
            data: {
                courseId: course.id,
                purchaseMethod: 'esewa',
                Price: course.price,
            }
        })

        const paymentInitiate = await getEsewaPaymentHash({
            amount: parseInt(Price),
            transaction_uuid: (purchaseCourseData.id).toString()
        })

        // Respond with payment details
        res.json({
            success: true,
            payment: paymentInitiate,
            purchaseCourseData,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server Error"
        });
    }
}

interface DataType<T> {
    transaction_code: T;
    status: T;
    total_amount: T;
    transaction_uuid: T;
    product_code: T;
    signed_field_names: string;
    signature: T;
}

export interface EsewaRedirectData {
    Amount?: string;
    Tax_Amount?: string;
    Total_Amount?: string;
    Transaction_UUID?: string;
    Product_Code?: string;
    Product_Service_Charge?: string;
    Product_Delivery_Charge?: string;
    Success_URL?: string;
    Failure_URL?: string;
    signed_Field_Names?: string;
    Signature?: string;
    Secret_Key?: string; // Note: It's generally not safe to pass secret keys through URLs or client-side code.
}

const completePayment =  async (req: Request, res: Response) => {
    const data =  req.query.data as string; // Data received from eSewa's redirect
    const paymentInfo = await verifyEsewaPayment(data as string);
    try {
        // Verify payment with eSewa
        // Find the purchased item using the transaction UUID
        const purchasedItemData = await prisma.purchasedCourse.findUnique(
            {
                where: {
                    id: paymentInfo.response.transaction_uuid
                }
            }
        );
        console.log("PurchasedItemData: ", purchasedItemData);
        console.log("PaymentInfo: ", paymentInfo);
        if (!purchasedItemData) {
            return res.status(500).json({
                success: false,
                message: "Purchase not found",
            });
        }

        // Create a new payment record in the database
        const paymentData = await prisma.payment.create({
            data: {
                id: paymentInfo.decodedData.transaction_code,
                transactionId: paymentInfo.decodedData.transaction_code,
                courseId: paymentInfo.response.transaction_uuid,
                amount: purchasedItemData.Price,
                dataVerificationReq: paymentInfo,
                apiQueryFromUser: req.query,
                paymenGateway: "esewa",
                status: "success",
            }
        });
        console.log("PaymentData :", paymentData);
        
        // Update the purchased item status to 'completed'
        await prisma.purchasedCourse.update(
            {
                where: {
                    id: paymentInfo.response.transaction_uuid
                },
                data: {
                    status: $Enums.Status.success
                }
            }
        );

      // Respond with success message
    res.json({
        success: true,
        message: "Payment successful",
        paymentData,
    });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "An error occurred during payment verification",
        });
    }
};

export { 
    initializeEsewa,
    completePayment
}