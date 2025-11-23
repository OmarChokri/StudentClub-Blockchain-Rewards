import { Point } from "../models/point.model.js";
import { PointHistory } from "../models/pointHistory.model.js";
import { User } from "../models/user.model.js";
import { blockchain } from "../blockchain-interaction/interact.js";

export class PointsService {

  // ADD POINTS
  static async addPoints({ userId, amount, reason, activityId }) {

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // 1. BLOCKCHAIN TX
    await blockchain.givePoints(user.walletAddress, amount, reason);

    // 2. LOCAL DB UPDATE
    let point = await Point.findOne({ userId });

    if (!point) {
      point = new Point({ userId, amount: 0 });
    }

    point.amount += amount;
    await point.save();

    // 3. HISTORY
    await PointHistory.create({
      userId,
      type: "add",
      amount,
      activityId,
      reason,
      date: new Date(),
    });

    return point;
  }

  // TRANSFER POINTS
  static async transferPoints({ fromUser, toUser, amount }) {

    const senderUser = await User.findById(fromUser);
    const receiverUser = await User.findById(toUser);

    if (!senderUser || !receiverUser)
      throw new Error("User not found");

    // 1. BLOCKCHAIN TX
    await blockchain.transferPoints(receiverUser.walletAddress, amount);

    // 2. LOCAL DB
    const sender = await Point.findOne({ userId: fromUser });
    if (!sender || sender.amount < amount)
      throw new Error("Not enough balance");

    const receiver = await Point.findOne({ userId: toUser }) || new Point({ userId: toUser, amount: 0 });

    sender.amount -= amount;
    receiver.amount += amount;

    await sender.save();
    await receiver.save();

    // 3. HISTORY
    await PointHistory.create({
      userId: toUser,
      type: "transfer",
      amount,
      fromUser,
      toUser,
      date: new Date(),
    });

    return { sender, receiver };
  }

  // BURN POINTS (redeem reward)
  static async burnPoints({ userId, amount, rewardId }) {

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // 1. BLOCKCHAIN TX
    await blockchain.usePoints(amount, "reward redeem");

    // 2. UPDATE LOCAL DB
    const userPoints = await Point.findOne({ userId });
    if (!userPoints || userPoints.amount < amount)
      throw new Error("Not enough points");

    userPoints.amount -= amount;
    await userPoints.save();

    // 3. HISTORY
    await PointHistory.create({
      userId,
      type: "burn",
      amount,
      rewardId,
      date: new Date(),
    });

    return userPoints;
  }

  // GET BALANCE (BLOCKCHAIN)
  static async getBalance(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const balance = await blockchain.getBalance(user.walletAddress);

    return balance.toString();
  }

  static async getHistory(userId) {
    return await PointHistory.find({ userId }).sort({ date: -1 });
  }
}
