import { Role } from "@prisma/client";

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 4,
  TEACHER: 3,
  STAFF: 3,
  STUDENT: 1,
};

export const getRoleRank = (role: Role): number => {
  return ROLE_HIERARCHY[role];
};

export const canManageRole = (actorRole: Role, targetRole: Role): boolean => {
  return getRoleRank(actorRole) > getRoleRank(targetRole);
};

export const hasAtLeastRole = (actorRole: Role, minimumRole: Role): boolean => {
  return getRoleRank(actorRole) >= getRoleRank(minimumRole);
};
