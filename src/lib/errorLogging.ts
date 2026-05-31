export interface ErrorLogPayload {
  message: string;
  name: string;
  stack?: string;
  componentStack?: string;
  info?: Record<string, unknown>;
  userAgent: string;
  url: string;
  timestamp: string;
}

const errorEndpoint = import.meta.env.VITE_ERROR_LOG_ENDPOINT;

export async function logErrorBoundaryEvent(
  error: Error,
  componentStack?: string,
  info?: Record<string, unknown>,
) {
  const payload: ErrorLogPayload = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    componentStack,
    info,
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    timestamp: new Date().toISOString(),
  };

  console.error('ErrorBoundary caught:', payload);

  if (!errorEndpoint) {
    return;
  }

  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(errorEndpoint, body);
      return;
    }

    await fetch(errorEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch (reportError) {
    console.error('Error logging failed:', reportError);
  }
}
