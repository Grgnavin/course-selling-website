import { Router } from "express";
import { verifyUser } from "../middleware/authMiddleware";
import { completePayment, initializeEsewa } from "../controllers/paymentController";
const router = Router();


router.route('/esewa').post(verifyUser, initializeEsewa);
router.route('/complete-payment').post(verifyUser, completePayment);



export default router;

