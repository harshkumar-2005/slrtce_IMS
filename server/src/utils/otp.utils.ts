import crypto from "crypto";
import argon2 from "argon2";

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // 6 digit
};

export const hashOtp = async (otp: string): Promise<string> => {
  return argon2.hash(otp);
};

export const verifyOtpHash = async (
  hashedOtp: string,
  inputOtp: string
): Promise<boolean> => {
  return argon2.verify(hashedOtp, inputOtp);
};