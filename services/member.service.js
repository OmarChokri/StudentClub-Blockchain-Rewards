import { User } from "../models/user.model.js";

export class MemberService {
  static async addMember({ username, role,password,email,walletAddress, }) {
    return await User.create({ username,role, password, email, joinedAt: new Date(),walletAddress  });
  }

  static async getMembers() {
    return await User.find().sort({ joinedAt: -1 });
  }

  static async getMemberById(id) {
    return await User.findById(id);
  }

  static async updateMember(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteMember(id) {
    return await User.findByIdAndDelete(id);
  }
}
