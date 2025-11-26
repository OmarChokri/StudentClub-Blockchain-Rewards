import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
static async signup({ email, password, username, role, walletAddress }) {

  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already used");
  console.log("Wallet Address during signup:", email, password, username, role, walletAddress);
    if (!walletAddress) throw new Error("Wallet address required");
  const existsWallet = await User.findOne({ walletAddress });
    if (existsWallet) throw new Error("Wallet address already linked to a user");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    username,
    password: hashedPassword,
    role: role || "member", // par défaut "member"
    walletAddress,
  });

  await newUser.save();

  // Générer JWT directement à l'inscription
  const token = jwt.sign(
    { id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { user: newUser, token };
}

  // Connexion avec JWT
  static async signin({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    // Générer JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { user, token };
  }

static authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

static authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
}


  // Middleware pour vérifier rôle admin
  static authorizeAdmin(req, res, next) {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  }
}
