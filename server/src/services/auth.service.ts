import argon2 from "argon2";
import jsonwebtoken from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import { AuthRequest } from "../types.js";
import { Response } from "express";
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

export const loginService = async (validUser: { email: string, password: string }) => {

    const userExist = await prisma.user.findUnique({
        where: { email: validUser.email }
    });

    if (!userExist) throw new Error("User not found");

    const passwordMatch = await argon2.verify(userExist.password, validUser.password);
    if (!passwordMatch) throw new Error("Invalid password");

    const payload = {
        id: userExist.id,
        role: userExist.role,
        email: userExist.email,
    };

    const accessToken = jsonwebtoken.sign(
        payload,
        envConfig.ACCESS_TOKEN,
        { expiresIn: "15m" }
    );

    const refreshToken = jsonwebtoken.sign(
        payload,
        envConfig.REFRESH_TOKEN,
        { expiresIn: "7d" }
    );

    // Store refresh token in DB
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: userExist.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    return {
        user: {
            id: userExist.id,
            email: userExist.email,
            role: userExist.role
        },
        accessToken,
        refreshToken
    };
};

export const profileService = async (userId: string) => {
    const profile = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            role: true,
            email: true,
            uid: true,
            phone: true,
            branch: true,

        },
    });
    if (!profile) {
        throw new Error("profile not found");
    }
    return profile;
}

export const resetPasswordService = async (userId: string, newPassword: string) => {
    const hashedPassword = await argon2.hash(newPassword);

    return await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });
};


export const logoutService = async (req: AuthRequest, res: Response) => {

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        // Delete token from DB
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
        });
    }

    // Clear cookies
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    return true;
};
