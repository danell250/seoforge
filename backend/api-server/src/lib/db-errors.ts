export function getDatabaseErrorCode(error: unknown): string | undefined {
  const maybeError = error as {
    code?: unknown;
    cause?: { code?: unknown };
    originalCause?: { code?: unknown };
  };

  if (typeof maybeError?.code === "string") return maybeError.code;
  if (typeof maybeError?.cause?.code === "string") return maybeError.cause.code;
  if (typeof maybeError?.originalCause?.code === "string") return maybeError.originalCause.code;
  return undefined;
}

export function getDatabaseErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function isMissingRelationError(error: unknown, relationName?: string): boolean {
  const code = getDatabaseErrorCode(error);
  const message = getDatabaseErrorMessage(error);
  if (code === "42P01") {
    return relationName ? message.includes(`relation "${relationName}"`) : true;
  }
  if (!relationName) {
    return message.includes("does not exist");
  }
  return message.includes(`relation "${relationName}" does not exist`);
}
