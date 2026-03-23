import zod from "zod";

const staffDataSchema = zod.object({
  // Department and position as string names/codes
  department: zod.string().min(1, "Department is required"),
  position: zod.string().min(1, "Position is required"),
});

export default staffDataSchema;

export type StaffData = zod.infer<typeof staffDataSchema>;
