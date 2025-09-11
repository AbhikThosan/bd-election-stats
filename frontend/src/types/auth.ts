export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "editor";
}

export type LoginFormValues = Pick<User, "email"> & {
  password: string;
};

export type RegisterFormValues = Omit<User, "id"> & {
  password: string;
};

export type AuthFormValues = LoginFormValues | RegisterFormValues;
