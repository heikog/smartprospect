const COOKIE_MUTATION_ERROR = "Cookies can only be modified in a Server Action or Route Handler";

export function swallowCookieMutationError<T extends unknown[]>(
  mutate: ((...args: T) => unknown) | undefined,
) {
  if (!mutate) {
    return undefined;
  }

  return async (...args: T) => {
    try {
      await mutate(...args);
    } catch (error) {
      if (error instanceof Error && error.message.includes(COOKIE_MUTATION_ERROR)) {
        return;
      }
      throw error;
    }
  };
}
