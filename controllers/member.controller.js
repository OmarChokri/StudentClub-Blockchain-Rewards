import { MemberService } from "../services/member.service.js";

export class MemberController {
  static async getAllMembers(req, res) {
    res.json(await MemberService.getMembers());
  }

  static async getMemberById(req, res) {
    res.json(await MemberService.getMemberById(req.params.id));
  }
  static async getMemberByEmail(req, res) {
    res.json(await MemberService.getMemberByEmail(req.params.email));
  }

  static async addMember(req, res) {
    const result = await MemberService.addMember(req.body);
    res.json(result);
  }

  static async updateMember(req, res) {
    const result = await MemberService.updateMember(req.params.id, req.body);
    res.json(result);
  }

  static async deleteMember(req, res) {
    await MemberService.deleteMember(req.params.id);
    res.json({ message: "Member deleted" });
  }
}
