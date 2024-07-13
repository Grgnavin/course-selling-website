import { Router } from "express";
import { createCourses, getCourses } from "../controllers/courseController";
import { verifyUser } from "../middleware/authMiddleware";

const router = Router();

router.route('/').get(verifyUser ,getCourses);
router.route('/').post(verifyUser ,createCourses);


export default router;