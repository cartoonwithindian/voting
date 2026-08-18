export type UserRole = "student" | "candidate" | "administrator";

export interface MockCredentials {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    role: UserRole;
    name: string;
  } | null;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export type AuthView =
  | "login"
  | "loading"
  | "success"
  | "error"
  | "locked"
  | "forgot-password"
  | "reset-password"
  | "session-expired"
  | "unauthorized";