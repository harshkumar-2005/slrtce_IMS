import zod from "zod";
import { SubjectType } from "@prisma/client";

const validSubject = zod.object({
    name: zod.string().min(2, "Subject name is required"),

    code: zod.string().min(2, "Subject code is required").optional(),
    
    branchDepartmentId: zod.number().int().positive("Branch Department ID must be a positive integer"),

    credits: zod.number().int().positive("Credits must be a positive integer"),

    type: zod.enum(SubjectType, "Subject type must be either THEORY, PRACTICAL or LAB"),

    semesterId: zod.number().int().positive("Semester ID must be a positive integer"),
});

export default validSubject;