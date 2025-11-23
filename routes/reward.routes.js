import { Router } from "express";
import { RewardController } from "../controllers/reward.controller.js";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.use(AuthService.authenticate);

router.post("/add", AuthService.authorizeAdmin, RewardController.add);
router.get("/", RewardController.getAll);
router.post("/redeem", RewardController.redeem);

export default router;
