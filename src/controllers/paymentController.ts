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

const initializeEsewa = async (req: Request, res: Response) => {
    try {
        const { courseId, Price } = req.body;

        const course: course = await prisma.course.findUnique({
            where: {
                id: courseId
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
            amount: Price,
            transaction_uuid: (purchaseCourseData.id).toString()
        })

      // Respond with payment details
        res.json({
            success: true,
            payment: paymentInitiate,
            purchaseCourseData,
        });
    } catch (error) {
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

const completePayment =  async (req: Request, res: Response) => {
    const data: DataType = req.query.data; // Data received from eSewa's redirect
    const paymentInfo = await verifyEsewaPayment(data);
    try {
      // Verify payment with eSewa

        // Find the purchased item using the transaction UUID
        const purchasedItemData = await PurchasedItem.findById(
            paymentInfo.response.transaction_uuid
        );

        if (!purchasedItemData) {
            return res.status(500).json({
            success: false,
            message: "Purchase not found",
            });
        }

      // Create a new payment record in the database
        const paymentData = await Payment.create({
            pidx: paymentInfo.decodedData.transaction_code,
            transactionId: paymentInfo.decodedData.transaction_code,
            productId: paymentInfo.response.transaction_uuid,
            amount: purchasedItemData.totalPrice,
            dataFromVerificationReq: paymentInfo,
            apiQueryFromUser: req.query,
            paymentGateway: "esewa",
            status: "success",
        });

      // Update the purchased item status to 'completed'
        await PurchasedItem.findByIdAndUpdate(
            paymentInfo.response.transaction_uuid,
            { $set: { status: "completed" } }
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