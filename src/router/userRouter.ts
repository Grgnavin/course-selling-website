import { createUser } from "../controllers/userController";
import { Router } from "express";

const router = Router();

router.route('/').post(createUser);

export default router;
