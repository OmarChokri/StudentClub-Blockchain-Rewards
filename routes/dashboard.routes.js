import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.use(AuthService.authenticate);

router.get("/admin", AuthService.authorizeAdmin, DashboardController.admin);
router.get("/member/:userId", DashboardController.member);

export default router;
