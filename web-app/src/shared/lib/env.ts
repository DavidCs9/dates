/**
 * Utility function to get required environment variables
 * Throws an error if the variable is missing or empty
 */
export function getRequiredEnv(varName: string): string {
  const value = process.env[varName];

  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${varName}. ` +
        `Please check your .env.local file and ensure this variable is set.`,
    );
  }

  return value;
}

/**
 * Utility function to get optional environment variables with a default value
 */
export function getOptionalEnv(varName: string, defaultValue: string): string {
  const value = process.env[varName];
  return value && value.trim() !== "" ? value : defaultValue;
}
