import { verifyUser } from './../middleware/authMiddleware';
import { Router } from "express";
import { createAdmin, getAdminToken, loginAdmin } from "../controllers/adminController";
const router = Router();

// router.route('/').post(createAdmin);
router.route('/').post(createAdmin);
router.route('/token').post(getAdminToken);
router.route('/login').post(verifyUser, loginAdmin);


export default router;