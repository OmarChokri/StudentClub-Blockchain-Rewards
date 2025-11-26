import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

export class MemberService {
  static async addMember({ username, role,password,email,walletAddress, }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return await User.create({ username,role, password: hashedPassword, email, joinedAt: new Date(),walletAddress  });
  }

  static async getMembers() {
    return await User.find().sort({ joinedAt: -1 });
  }

  static async getMemberById(id) {
    return await User.findById(id);
  }

  static async getMemberByEmail(email) {
    return await User.findOne({ email });
  }

  static async updateMember(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteMember(id) {
    return await User.findByIdAndDelete(id);
  }
}
