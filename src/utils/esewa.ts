import { $Enums } from "@prisma/client";
import axios from "axios";
import crypto from "crypto";
import { EsewaRedirectData } from "../controllers/paymentController";

type PaymentHashRequest = {
    amount: number;
    transaction_uuid: string;
}

interface DecodedData {
    transaction_code: string;
    status: string;
    total_amount: number;
    transaction_uuid: string;
    product_code: string;
    signed_field_names: string;
    signature: string;
}

export async function getEsewaPaymentHash({ amount, transaction_uuid }: PaymentHashRequest) {
    try {
        const data: any = `total_amount=${Number(amount)},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
        const secretKey = process.env.ESEWA_SECRET_KEY;
        const hash: any = crypto
            .createHmac("sha256", secretKey as string)
            .update(data)
            .digest("base64");
        return {
        signature: hash,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
}
type ResponseData = {
    transaction_code: string,
    status: string,
    total_amount: string,
    transaction_uuid: string,
    product_code: string,
    signed_field_names: string,
    signature: string
  }

export async function verifyEsewaPayment(encodedData: string) {
    try {
        // decoding base64 code revieved from esewa
        let decodedData: any = atob(encodedData);
        decodedData = JSON.parse(decodedData);
        let headersList = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };

    const data = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${Number(decodedData.total_amount)},transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;
    console.log("Decoded data: ",decodedData);
    const secretKey = process.env.ESEWA_SECRET_KEY;
    const hash = crypto
    .createHmac("sha256", secretKey as string)
    .update(data)
    .digest("base64");
    console.log("Hash:",hash);
    console.log(decodedData.signature)
    if (hash !== decodedData.signature) {
        throw { message: "Invalid Info", decodedData };
    }
        console.log(hash);
        console.log(decodedData.signature);
    let reqOptions = {
        url: `${process.env.ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`,
        method: "GET",
        headers: headersList,
    };
    let response = await axios.request(reqOptions);
    console.log("ResponseData: ", response);
    if (
        response.data.status !== "COMPLETE" ||
        response.data.transaction_uuid !== decodedData.transaction_uuid ||
        Number(response.data.total_amount) !== Number(decodedData.total_amount)
    ) {
        throw { message: "Invalid Info", decodedData };
    }
    return { response: response.data, decodedData };
    } catch (error) {
        console.log(error);
        throw error;
    }
}