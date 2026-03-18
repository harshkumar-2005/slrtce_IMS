import zod from "zod";

const teacherDataSchema = zod.object({
  department: zod.enum([
    "COMPUTER_SCIENCE",
    "ELECTRONICS",
    "MECHANICAL",
    "CIVIL",
    "ELECTRICAL",
    "SCIENCE",
    "ADMINISTRATION",
  ]),
  designation: zod.enum([
    "PROFESSOR",
    "ASSISTANT_PROFESSOR",
    "HOD",
    "LECTURER",
  ]),
});

export default teacherDataSchema;

export type TeacherData = {
    department: string;
    designation: string;
}