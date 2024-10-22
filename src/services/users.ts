import { api } from "./api";

export enum RoleUser {
  ADMIN = "admin",
  USER = "user",
  AUTHOR = "author",
  EVENT_MANAGER = "event_manager",
}
export enum RoleUserSelect {
  USER = "user",
  AUTHOR = "author",
  EVENT_MANAGER = "event_manager",
}
export const MapRoleUser: {
  [key: string]: string;
} = {
  [RoleUser.ADMIN]: "Administrador",
  [RoleUser.AUTHOR]: "Autor",
  [RoleUserSelect.USER]: "Usuario",
  [RoleUserSelect.EVENT_MANAGER]: "Gestor de Capacitaciones",
};
export interface Country {
  code: string
  name: string
  icon: string
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleUser;
  image: string;
  isActive: boolean;
  country: Country;
}

export const getCountries = async (): Promise<Country[]> => {
  const { data } = await api.get(`/countries`);
  return data as Country[];
};
export const getUsers = async (role?: string): Promise<User[]> => {
  const { data } = await api.get(`/users${role ? "?role=" + role : ""}`);
  return data as User[];
};

export interface UserBodyRequest {
  name: string;
  email: string;
  password: string;
  image: string;
  role: string;
  countryCode: string;
}
export const createUser = async (body: UserBodyRequest): Promise<User> => {
  const { data } = await api.post(`/users`, body);
  return data as User;
};

export const updateUser = async (
  id: string,
  body: UserBodyRequest
): Promise<User> => {
  const { data } = await api.put(`/users/${id}`, body);
  return data as User;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.post(`/users/${id}/toggle-active-state`);
};
