import { z } from "zod/v4";

const DEFAULT_JWT_SECRET = "dev-secret-key-change-me";

const envSchema = z
	.object({
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		PORT: z.coerce.number().default(3000),
		JWT_SECRET: z
			.string()
			.min(10, "JWT_SECRET must be at least 10 characters long")
			.default(DEFAULT_JWT_SECRET),
	})
	.superRefine((value, ctx) => {
		if (value.NODE_ENV === "production" && value.JWT_SECRET === DEFAULT_JWT_SECRET) {
			ctx.addIssue({
				code: "custom",
				message:
					"Set JWT_SECRET to a strong, unique value when running in production.",
				path: ["JWT_SECRET"],
			});
		}
	});

try {
	// eslint-disable-next-line node/no-process-env
	envSchema.parse(process.env);
} catch (error) {
	if (error instanceof z.ZodError) {
		console.error(
			"Missing environment variables:",
			error.issues.flatMap((issue) => issue.path),
		);
	} else {
		console.error(error);
	}
	process.exit(1);
}

// eslint-disable-next-line node/no-process-env
export const env = envSchema.parse(process.env);
