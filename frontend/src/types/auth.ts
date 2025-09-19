export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "editor";
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId?: string;
}

export type LoginFormValues = Pick<User, "email"> & {
  password: string;
};

export type RegisterFormValues = Omit<User, "id"> & {
  password: string;
};
