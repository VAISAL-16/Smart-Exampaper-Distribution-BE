import "dotenv/config";
import jwt from "jsonwebtoken";

export const createAuthToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id || user.id),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || "secure_exam_jwt_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

export const verifyAuthToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET || "secure_exam_jwt_secret");
