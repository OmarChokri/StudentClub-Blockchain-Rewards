import { Router } from "express";
import { RewardController } from "../controllers/reward.controller.js";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.use(AuthService.authenticate);

router.post("/add", AuthService.authorizeAdmin, RewardController.add);

router.get("/", RewardController.getAll);

router.get("/:id", RewardController.getById);

router.put("/:id", AuthService.authorizeAdmin, RewardController.update);

router.delete("/:id", AuthService.authorizeAdmin, RewardController.delete);

export default router;
