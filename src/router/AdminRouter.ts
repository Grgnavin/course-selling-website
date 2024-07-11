import { Router } from "express";
import { createAdmin, getAdminToken } from "../controllers/adminController";
const router = Router();

// router.route('/').post(createAdmin);
router.route('/').post(createAdmin);
router.route('/token').post(getAdminToken);


export default router;