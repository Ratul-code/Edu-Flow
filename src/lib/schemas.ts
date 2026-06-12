import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

const requiredText = (fieldName: string, max: number, message: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(max, message);

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date (YYYY-MM-DD).")
  .optional()
  .or(z.literal(""));

const requiredDate = z
  .string()
  .trim()
  .min(1, "Admission date is required.")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date (YYYY-MM-DD).");

const timeString = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}$/, "Enter a valid time.");

const nonNegativeNumber = (message: string) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      const numberValue = Number(value || 0);
      return Number.isFinite(numberValue) ? numberValue : Number.NaN;
    })
    .pipe(z.number().min(0, message));

const requiredNonNegativeNumber = (fieldName: string, message: string) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required.`)
    .transform((value) => {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : Number.NaN;
    })
    .pipe(z.number("Enter a valid amount.").min(0, message));

const positiveNumber = (message: string) =>
  z
    .string()
    .trim()
    .min(1, "Amount is required.")
    .transform((value) => Number(value))
    .pipe(z.number().positive(message));

const signedNumber = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    const numberValue = Number(value || 0);
    return Number.isFinite(numberValue) ? numberValue : Number.NaN;
  })
  .pipe(z.number("Enter a valid amount."));

export type FormState = {
  errors?: Record<string, string | string[]>;
  message?: string;
};

export const initialFormState: FormState = {};

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const studentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name is too long."),
  phone: requiredText("Phone", 20, "Phone number is too long."),
  guardian_name: requiredText("Guardian name", 100, "Guardian name is too long."),
  guardian_phone: requiredText("Guardian phone", 20, "Guardian phone is too long."),
  institution: requiredText("Institution", 150, "Institution name is too long."),
  class_level: requiredText("Class level", 50, "Class level is too long."),
  medium: optionalText(50, "Medium is too long."),
  group_name: optionalText(50, "Group is too long."),
  admission_date: requiredDate,
  status: z.enum(["active", "archived"]).default("active"),
  notes: optionalText(1000, "Notes are too long."),
  tags: optionalText(500, "Tags are too long."),
});

export type StudentFormData = z.infer<typeof studentSchema>;

export const teacherSchema = z.object({
  name: requiredText("Name", 100, "Name is too long."),
  phone: requiredText("Phone", 20, "Phone number is too long."),
  subject_specialty: requiredText(
    "Subject specialty",
    100,
    "Subject specialty is too long."
  ),
  default_monthly_salary: requiredNonNegativeNumber(
    "Default monthly salary",
    "Salary must be 0 or more."
  ),
  status: z.enum(["active", "archived"]),
  notes: optionalText(1000, "Notes are too long."),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;

export const batchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Batch name is required.")
    .max(100, "Batch name is too long."),
  class_level: requiredText("Class level", 50, "Class level is too long."),
  subject: requiredText("Subjects", 100, "Subjects are too long."),
  monthly_fee: nonNegativeNumber("Monthly fee must be 0 or more."),
  medium: optionalText(50, "Medium is too long."),
  group_name: optionalText(50, "Group is too long."),
  status: z.enum(["active", "archived"]).default("active"),
});

export type BatchFormData = z.infer<typeof batchSchema>;

export const batchAssignmentSchema = z.object({
  student_ids: z
    .array(z.string().uuid("Invalid student id."))
    .min(1, "Select at least one student."),
  joined_at: optionalDate,
});

export const studentBatchFeeOverrideSchema = z.object({
  fee_override: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      if (!value) return null;

      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : Number.NaN;
    })
    .pipe(z.number().min(0, "Fee override must be 0 or more.").nullable()),
});

export const classScheduleSchema = z
  .object({
    subject: z
      .string()
      .trim()
      .min(1, "Subject is required.")
      .max(100, "Subject is too long."),
    weekday: z
      .string()
      .trim()
      .transform((value) => Number(value))
      .pipe(z.number().int().min(0).max(6)),
    teacher_id: z.string().uuid("Invalid teacher id.").optional().or(z.literal("")),
    start_time: timeString,
    end_time: timeString,
    room_name: optionalText(100, "Room name is too long."),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "End time must be after start time.",
    path: ["end_time"],
  });

export const ledgerMonthSchema = z.object({
  month: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}(-\d{2})?$/, "Enter a valid month."),
});

export const billingSettingsSchema = z.object({
  billing_mode: z.enum(["prepaid", "postpaid"], {
    error: "Select prepaid or postpaid payment.",
  }),
  payment_start_day: z
    .string()
    .trim()
    .min(1, "Payment start day is required.")
    .transform((value) => Number(value))
    .pipe(
      z
        .number("Enter a valid payment start day.")
        .int("Payment start day must be a whole number.")
        .min(1, "Payment start day must be at least 1.")
        .max(15, "Payment start day cannot be after day 15.")
    ),
  grace_period_days: z
    .string()
    .trim()
    .min(1, "Grace period is required.")
    .transform((value) => Number(value))
    .pipe(
      z
        .number("Enter a valid grace period.")
        .int("Grace period must be a whole number.")
        .min(0, "Grace period cannot be less than 0 days.")
        .max(15, "Grace period cannot be more than 15 days.")
    ),
});

export const tenantProfileSchema = z.object({
  address: optionalText(500, "Address is too long."),
  contact_phone: optionalText(20, "Contact phone is too long."),
  email: optionalText(100, "Email is too long.")
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address.",
    }),
  name: requiredText("Center name", 100, "Center name is too long."),
  secondary_phone: optionalText(20, "Secondary phone is too long."),
});

export const academicGroupSchema = z.object({
  name: requiredText("Group name", 50, "Group name is too long."),
});

export const teacherPaymentSettingsSchema = z.object({
  payment_system: z.enum(["prepaid", "postpaid"], {
    error: "Select prepaid or postpaid payment.",
  }),
});

export const feePaymentSchema = z.object({
  amount: positiveNumber("Amount must be greater than zero."),
  method: z.enum(["cash", "bkash", "nagad", "bank", "card", "other"], {
    error: "Select a valid payment method.",
  }),
  payment_date: optionalDate,
  note: optionalText(500, "Note is too long."),
});

export const salaryPaymentSchema = feePaymentSchema;

export const salaryLedgerSchema = z.object({
  expected_salary: nonNegativeNumber("Expected salary must be 0 or more."),
  adjustment_amount: signedNumber,
});

export const classLevelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Class level name is required.")
    .max(50, "Class level name is too long."),
});

export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of errors.issues) {
    const path = issue.path.join(".");
    if (path && !fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  return fieldErrors;
}

export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): z.infer<T> {
  const result = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!result.success) {
    throw new Error(validationMessage(result.error));
  }

  return result.data;
}

export function parseMultiValueFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData,
  multiKeys: string[]
): z.infer<T> {
  const values: Record<string, FormDataEntryValue | FormDataEntryValue[]> =
    Object.fromEntries(formData.entries());

  for (const key of multiKeys) {
    values[key] = formData.getAll(key);
  }

  const result = schema.safeParse(values);

  if (!result.success) {
    throw new Error(validationMessage(result.error));
  }

  return result.data;
}

function validationMessage(error: z.ZodError) {
  const messages = Object.values(formatZodErrors(error)).flat();

  return messages.length ? messages.join(" ") : "Invalid form submission.";
}
