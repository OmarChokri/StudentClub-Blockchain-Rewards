import { Router } from "express";
import { MemberController } from "../controllers/member.controller.js";

const router = Router();


router.get("/", MemberController.getAllMembers);
router.get("/:id", MemberController.getMemberById);
router.post("/add", MemberController.addMember);
router.put("/:id", MemberController.updateMember);
router.delete("/:id", MemberController.deleteMember);
router.get("/email/:email", MemberController.getMemberByEmail);

export default router;
