import { Response, Request } from "express";
import { AuthRequest } from "../types/auth.types.js";
import validLogin from "../validators/login.validator.js";
import {
  loginService,
  profileService,
  resetPasswordService,
  logoutService,
  refreshTokenService,
} from "../services/auth.service.js";

export const loginRoute = async (req: Request, res: Response) => {
  try {
    const validUser = validLogin.parse(req.body);

    const { user, accessToken, refreshToken } = await loginService(
      validUser,
      req,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: "login successful",
      user,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "login failed",
    });
  }
};

export const profile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const profile = await profileService(user.id);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      profile,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve profile",
    });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword, reEnterPassword, oldPassword } = req.body;

    if (!newPassword || !reEnterPassword || !oldPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    if (newPassword !== reEnterPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    await resetPasswordService(req.user.id, newPassword, oldPassword);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update password",
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    await logoutService(req, res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Logout failed",
    });
  }
};


export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new Error("No refresh token");

    const result = await refreshTokenService(token, req);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
    });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: err.message || "Refresh failed",
    });
  }
};
