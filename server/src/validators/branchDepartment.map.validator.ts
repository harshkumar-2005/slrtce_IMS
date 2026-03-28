import zod from "zod";

const validBranchDepartmentMapping = zod.object({
  branchId: zod.number().positive(),
  departmentId: zod.number().positive(),
});


export default validBranchDepartmentMapping;