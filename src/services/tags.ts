import { api } from "./api";

export interface Tag {
  id: number;
  name: string;
}
export const getTags = async (search?: string): Promise<string[]> => {
  const { data } = await api.get(`/tags?search=${search || ''}`);
  return data as string[];
};

export const createTag = async (name: string): Promise<Tag> => {
  const { data } = await api.post(`/tags`, { name });
  return data as Tag;
};