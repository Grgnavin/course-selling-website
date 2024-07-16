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

// interface CompletePayment {
// Amount:	500
// Tax Amount:	0
// Total Amount:	50
// Transaction UUID (Item Purchase ID):	1
// Product Code:	EPAYTEST
// Product Service Charge:	0
// Product Delivery Charge:	0
// Success URL:	http://localhost:8000/complete-payment
// Failure URL:	https://developer.esewa.com.np/failure
// signed Field Names:	total_amount,transaction_uuid,product_code
// Signature:	s50XPpnSW25Q2R3TE6dAARNIHTv40RLn2oPk/mdD334=
// Secret Key:
// }

const completePayment =  async (req: Request, res: Response) => {
    const data: any = req.query.data; // Data received from eSewa's redirect
    const paymentInfo = await verifyEsewaPayment(data);
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

        // Update the purchased item status to 'completed'
        await prisma.purchasedCourse.update(
            {
                where: {
                    id: paymentInfo.response.transaction_uuid,
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