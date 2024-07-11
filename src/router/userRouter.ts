import { verifyUser } from './../middleware/authMiddleware';
import { createUser, loginUser } from "../controllers/userController";
import { Router } from "express";

const router = Router();

router.route('/').post(createUser);
router.route('/login').post(verifyUser, loginUser);


export default router;
