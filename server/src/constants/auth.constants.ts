export const ROLE_VALUES = ["STUDENT", "TEACHER", "ADMIN", "STAFF"] as const;
export type RoleValue = (typeof ROLE_VALUES)[number];

export const ADMIN_LEVEL_VALUES = ["NORMAL", "SUPER"] as const;
export type AdminLevelValue = (typeof ADMIN_LEVEL_VALUES)[number];

export const OTP_TYPE_VALUES = [
  "LOGIN",
  "PASSWORD_RESET",
  "EMAIL_VERIFICATION",
] as const;
export type OtpTypeValue = (typeof OTP_TYPE_VALUES)[number];
