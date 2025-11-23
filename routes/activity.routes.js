import { Router } from "express";
import { ActivityController } from "../controllers/activity.controller.js";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.use(AuthService.authenticate);
router.use(AuthService.authorizeAdmin);

router.get("/", ActivityController.getAll);
router.get("/:id", ActivityController.getOne);
router.post("/add", ActivityController.add);
router.put("/:id", ActivityController.update);
router.delete("/:id", ActivityController.delete);
router.post("/assign", ActivityController.assignActivity);

export default router;
