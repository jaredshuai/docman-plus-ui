import { ElMessage } from 'element-plus';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || '';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '');
  }
  return '';
}

export function isSessionError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message.includes('无效的会话') || message.includes('会话已过期');
}

export function handleApiError(
  error: unknown,
  fallbackMessage: string,
  options: {
    showMessage?: boolean;
    preferErrorMessage?: boolean;
  } = {}
): string {
  if (isSessionError(error)) {
    return '';
  }
  const message = options.preferErrorMessage ? getErrorMessage(error) || fallbackMessage : fallbackMessage;
  if (options.showMessage !== false) {
    ElMessage.error(message);
  }
  return message;
}
