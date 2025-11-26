// routes/points.routes.js
import { Router } from "express";
import { PointsController } from "../controllers/point.controller.js";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.use(AuthService.authenticate); 

// Ajouter des points à un utilisateur (admin)
router.post("/add", AuthService.authorizeAdmin, PointsController.add);

// Brûler les points d’un utilisateur (sanction, correction)
router.post("/admin-burn", AuthService.authorizeAdmin, PointsController.adminBurn);

// Voir le solde d’un autre utilisateur (admin ou membre selon ta politique)
router.get("/balance/:userId", PointsController.balance);


export default router;