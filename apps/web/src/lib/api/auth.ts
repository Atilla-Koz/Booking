import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
} from '@booking/shared';
import { apiRequest, setAccessToken } from './client';

type AuthData = {
  accessToken: string;
  userId: string;
};

export const login = async (data: LoginInput): Promise<AuthData> => {
  const validated = LoginSchema.parse(data);
  const response = await apiRequest<AuthData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(validated),
  });
  setAccessToken(response.data.accessToken);
  return response.data;
};

export const register = async (data: RegisterInput): Promise<AuthData> => {
  const validated = RegisterSchema.parse(data);
  const response = await apiRequest<AuthData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(validated),
  });
  setAccessToken(response.data.accessToken);
  return response.data;
};

export const logout = (): void => {
  void apiRequest<null>('/auth/logout', {
    method: 'POST',
  });
  setAccessToken(null);
};
