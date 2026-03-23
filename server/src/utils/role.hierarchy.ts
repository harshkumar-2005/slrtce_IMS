import { RoleValue } from "../constants/auth.constants.js";

export const ROLE_HIERARCHY: Record<RoleValue, number> = {
  ADMIN: 4,
  TEACHER: 3,
  STAFF: 3,
  STUDENT: 1,
};

export const getRoleRank = (role: RoleValue): number => {
  return ROLE_HIERARCHY[role];
};

export const canManageRole = (
  actorRole: RoleValue,
  targetRole: RoleValue,
): boolean => {
  return getRoleRank(actorRole) > getRoleRank(targetRole);
};

export const hasAtLeastRole = (
  actorRole: RoleValue,
  minimumRole: RoleValue,
): boolean => {
  return getRoleRank(actorRole) >= getRoleRank(minimumRole);
};
