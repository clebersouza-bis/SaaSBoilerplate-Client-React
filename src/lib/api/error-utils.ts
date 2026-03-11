import { AxiosError } from 'axios';

type TranslateFn = (key: string, variables?: any) => string;

interface ErrorMessageOptions {
  t?: TranslateFn;
  hasTranslation?: (key: string) => boolean;
  fallbackMessage?: string;
}

interface ProblemDetailsLike {
  title?: string;
  code?: string;
  detail?: string;
  message?: string;
  errors?: string[] | Record<string, string[]>;
}

export function extractApiErrorMessage(
  error: unknown,
  options: ErrorMessageOptions = {}
): string {
  const { t, hasTranslation, fallbackMessage = 'An unexpected error occurred' } = options;
  const axiosError = error as AxiosError<ProblemDetailsLike>;
  const data = axiosError.response?.data;

  if (!data) {
    return fallbackMessage;
  }

  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const code = typeof data.code === 'string' ? data.code.trim() : '';
  const detail = typeof data.detail === 'string' ? data.detail.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';

  if (Array.isArray(data.errors) && data.errors.length > 0 && typeof data.errors[0] === 'string') {
    return data.errors[0];
  }

  if (data.errors && typeof data.errors === 'object') {
    const firstFieldErrors = Object.values(data.errors).find(
      (fieldErrors) => Array.isArray(fieldErrors) && fieldErrors.length > 0
    );

    if (firstFieldErrors?.[0]) {
      return firstFieldErrors[0];
    }
  }

  const businessCode = title || code;

  if (businessCode && t && hasTranslation) {
    const translationKey = `apiErrors.${businessCode}`;
    if (hasTranslation(translationKey)) {
      return t(translationKey);
    }
  }

  return detail || message || title || code || fallbackMessage;
}
