import { Router } from "express";
import { PointsController } from "../controllers/point.controller.js";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.use(AuthService.authenticate);

router.post("/add", AuthService.authorizeAdmin, PointsController.add);
router.post("/transfer", PointsController.transfer);
router.post("/burn", PointsController.burn);

router.get("/balance/:userId", PointsController.balance);
router.get("/history/:userId", PointsController.history);

export default router;
