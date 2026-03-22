import argon2 from "argon2";
import jsonwebtoken from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import { AuthRequest } from "../types/auth.types.js";
import { Response } from "express";
import { OtpType, Role } from "@prisma/client";
import prisma from "../lib/prisma.js";
import nodemailer from "nodemailer";
import { generateOtp, hashOtp, verifyOtpHash } from "../utils/otp.utils.js";

export const loginService = async (
  validUser: { email: string; password: string; role: Role },
  req: AuthRequest,
) => {
  const user = await prisma.user.findFirst({
    where: {
      email: validUser.email,
      role: validUser.role,
    },
  });

  if (!user) throw new Error("User not found");

  const isMatch = await argon2.verify(user.password, validUser.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const payload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = jsonwebtoken.sign(payload, envConfig.ACCESS_TOKEN, {
    expiresIn: "15m",
  });

  const refreshToken = jsonwebtoken.sign(payload, envConfig.REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id, isRevoked: false },
    data: { isRevoked: true },
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    },
  });

  return { user, accessToken, refreshToken };
};

export const profileService = async (userId: string) => {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      teacherProfile: true,
      adminProfile: true,
      staffProfile: true,
    },
  });
  if (!profile) {
    throw new Error("profile not found");
  }
  return profile;
};

export const resetPasswordService = async (
  userId: string,
  newPassword: string,
  oldPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await argon2.verify(user!.password, oldPassword);
  if (!isMatch) throw new Error("Incorrect old password");

  const hashedPassword = await argon2.hash(newPassword);

  return await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

export const logoutService = async (req: AuthRequest, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Delete token from DB
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  // Clear cookies
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return true;
};

export const refreshTokenService = async (token: string, req: AuthRequest) => {
  // 1. Verify JWT
  let decoded: any;
  try {
    decoded = jsonwebtoken.verify(token, envConfig.REFRESH_TOKEN);
  } catch {
    throw new Error("Invalid refresh token");
  }

  // 2. Check DB
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken || storedToken.isRevoked) {
    throw new Error("Token revoked or not found");
  }

  if (new Date() > storedToken.expiresAt) {
    throw new Error("Token expired");
  }

  // 3. Issue new tokens
  if (!decoded || typeof decoded !== "object" || !decoded.id || !decoded.role) {
    throw new Error("Malformed token payload");
  }
  const payload = {
    id: decoded.id,
    role: decoded.role,
  };

  const newAccessToken = jsonwebtoken.sign(payload, envConfig.ACCESS_TOKEN, {
    expiresIn: "15m",
  });

  const newRefreshToken = jsonwebtoken.sign(payload, envConfig.REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  // 4. Rotate token
  await prisma.refreshToken.update({
    where: { token },
    data: {
      isRevoked: true,
      replacedByToken: newRefreshToken,
    },
  });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: decoded.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent:
        req.headers && typeof req.headers["user-agent"] === "string"
          ? req.headers["user-agent"]
          : "unknown",
      ipAddress: typeof req.ip === "string" ? req.ip : "unknown",
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const sendEmailService = async (userEmail: string, Userotp: string) => {
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  const userId = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
    select: {
      id: true,
    },
  });

  await prisma.otp.create({
    data: {
      email: userEmail,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      type: OtpType.EMAIL_VERIFICATION,
      userId: userId?.id,
    },
  });

  const mailOptions = {
    from: envConfig.SMTP_HOST,
    to: userEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  const transporter = nodemailer.createTransport({
    service: envConfig.SMTP_SERVICE,
    auth: {
      user: envConfig.SMTP_HOST,
      pass: envConfig.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail(mailOptions);

  return true;
};

export const verifyEmailService = async (userEmail: string, otp: string) => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email: userEmail,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP");
  }

  if (otpRecord.isUsed == true) {
    throw new Error("OTP already used");
  }

  const isMatch = await argon2.verify(otpRecord.otp, otp);

  if (!isMatch) {
    throw new Error("Invalid OTP");
  }

  // Mark OTP as used
  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return true;
};
