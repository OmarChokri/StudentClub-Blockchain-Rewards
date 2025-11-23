import { Router } from "express";
import { MemberController } from "../controllers/member.controller.js";
import { AuthService } from "../services/auth.service.js";

const router = Router();

router.use(AuthService.authenticate);
router.use(AuthService.authorizeAdmin);

router.get("/", MemberController.getAllMembers);
router.get("/:id", MemberController.getMemberById);
router.post("/add", MemberController.addMember);
router.put("/:id", MemberController.updateMember);
router.delete("/:id", MemberController.deleteMember);

export default router;
