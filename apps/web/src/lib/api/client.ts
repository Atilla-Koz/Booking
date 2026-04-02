const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type ApiEnvelope<T> = {
  data: T;
  message: string;
  statusCode: number;
};

type AccessTokenPayload = {
  sub: string;
  email?: string;
};

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

const parseAccessTokenPayload = (token: string): AccessTokenPayload | null => {
  try {
    const [, payloadPart] = token.split('.');
    if (!payloadPart) {
      return null;
    }
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = globalThis.atob(padded);
    const payload = JSON.parse(decoded) as AccessTokenPayload;
    if (!payload.sub) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

const buildHeaders = (headers?: HeadersInit): Headers => {
  const normalized = new Headers(headers);
  if (!normalized.has('Content-Type')) {
    normalized.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    normalized.set('Authorization', `Bearer ${accessToken}`);
  }
  return normalized;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      setAccessToken(null);
      return null;
    }
    const body = (await response.json()) as ApiEnvelope<{ accessToken: string }>;
    setAccessToken(body.data.accessToken);
    return body.data.accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
};

export const bootstrapSession = async (): Promise<{ userId: string } | null> => {
  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return null;
  }
  const payload = parseAccessTokenPayload(refreshedToken);
  if (!payload) {
    return null;
  }
  return { userId: payload.sub };
};

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
  retryOnUnauthorized = true,
): Promise<ApiEnvelope<T>> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(init?.headers),
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return apiRequest<T>(path, init, false);
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = (await response.json()) as {
        message?: string | string[];
      };
      if (Array.isArray(errorBody.message) && errorBody.message.length > 0) {
        message = errorBody.message.join(', ');
      } else if (typeof errorBody.message === 'string') {
        message = errorBody.message;
      }
    } catch {
      // Keep fallback message when error body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as ApiEnvelope<T>;
};
