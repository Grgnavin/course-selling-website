import { createAdmin, createUser } from "../controllers/userController";
import { Router } from "express";

const router = Router();

router.route('/').post(createUser);
router.route('/admin').post(createAdmin);

export default router;
