import { AuthService } from "../services/auth.service.js";

export const signup = async (req, res) => {
  try {
    const user = await AuthService.signup(req.body);
    res.status(201).json({ message: "User created", user });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const signin = async (req, res) => {
  try {
    const user = await AuthService.signin(req.body);
    res.status(200).json({ message: "Login success", user });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};
