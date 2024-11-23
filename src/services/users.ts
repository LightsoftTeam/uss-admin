import { api } from "./api";
import { ProfessorEmploymentType, ProfessorDocumentType } from './professors';
import { School } from "./schools";

export enum RoleUser {
  ADMIN = "admin",
  USER = "user",
  AUTHOR = "author",
  EVENT_MANAGER = "event_manager",
  PROFESSOR = "professor",
}
export enum RoleUserSelect {
  USER = "user",
  AUTHOR = "author",
  EVENT_MANAGER = "event_manager",
  PROFESSOR = "professor",
}
export const MapRoleUser: Record<RoleUser | RoleUserSelect, string> = {
  [RoleUser.ADMIN]: "Administrador",
  [RoleUser.AUTHOR]: "Autor",
  [RoleUserSelect.USER]: "Usuario",
  [RoleUserSelect.EVENT_MANAGER]: "Gestor de Capacitaciones",
  [RoleUserSelect.PROFESSOR]: "Profesor",
};
export interface Country {
  code: string;
  name: string;
  icon: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleUser;
  image: string;
  isActive: boolean;
  country: Country;
  // Professor
  employmentType?: ProfessorEmploymentType;
  documentType?: ProfessorDocumentType;
  documentNumber?: string;
  school?: School;
  slug?: string;
}

export const getCountries = async (): Promise<Country[]> => {
  const { data } = await api.get(`/countries`);
  return data as Country[];
};
export const getUsers = async (
  roles?: string,
  onlyPendingRole?: boolean
): Promise<User[]> => {
  const { data } = await api.get("/users", {
    params: { roles, onlyPendingRole },
  });
  return data as User[];
};

export interface UserBodyRequest {
  name: string;
  email: string;
  password: string;
  image: string;
  role: string;
  countryCode: string;
  documentType?: ProfessorDocumentType;
  documentNumber?: string;
  employmentType?: ProfessorEmploymentType;
  schoolId?: string;
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

// {{url}}/api/users/:id/change-role-request
export const changeRoleRequest = async (
  id: string,
  action: 'accept' | 'reject'
): Promise<void> => {
  await api.post(`/users/${id}/change-role-request`, { action });
};