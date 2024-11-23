import { School, SchoolBodyRequest, createSchool, updateSchool, getSchools, deleteSchool } from "@/services/schools";
import { ActionsTypes } from "@/types/general";
import { toast } from "sonner";
import { create } from "zustand";

interface TableSchools {
  [key: string | number]: string | number | JSX.Element;
  id: string;
  order: number;
}
type State = {
  schools: School[];
  tags: string[];
  tableSchools: TableSchools[];
  SchoolSelected: School | null;
  action: ActionsTypes;
  loading: boolean;
  open: boolean;
};

type Actions = {
  getData: () => Promise<void>;
  setSchoolSelected: (School: School | null, action: ActionsTypes) => void;
  crtSchool: (body: SchoolBodyRequest) => Promise<void>;
  updSchool: (id: string, body: SchoolBodyRequest) => Promise<void>;
  delSchool: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
};

const mapSchoolsToTableSchools = (schools: School[]): TableSchools[] => {
  return schools.map((School, idx) => ({
    name: School.name,
    id: School.id,
    order: idx + 1,
  }));
}

export const SchoolStore = create<State & Actions>((set) => ({
  schools: [],
  tags: [],
  tableSchools: [],
  SchoolSelected: null,
  action: 'none',
  loading: false,
  open: false,
  getData: async () => {
    try {
      set({ loading: true });
      const schools = await getSchools();
      set({ schools });
      const tableschools = mapSchoolsToTableSchools(schools);
      set({ tableSchools: tableschools });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente");
    } finally {
      set({ loading: false });
    }
  },
  setSchoolSelected(School, action) {
    const id = School?.id;
    const SchoolSelected = SchoolStore.getState().schools.find((School) => School.id === id);
    set({ SchoolSelected, action, open: !!id });
  },
  crtSchool: async (body) => {
    try {
      set({ loading: true });
      const newSchool = await createSchool(body);
      set({ schools: [newSchool, ...SchoolStore.getState().schools] });
      set({ tableSchools: mapSchoolsToTableSchools(SchoolStore.getState().schools) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
    } finally {
      set({ loading: false });
    }
  },
  updSchool: async (id, body) => {
    try {
      set({ loading: true });
      const updatedSchool = await updateSchool(id, body);
      const updatedSchools = SchoolStore.getState().schools.map((School) =>
        School.id === updatedSchool.id ? updatedSchool : School
      );
      set({ schools: updatedSchools });
      set({ tableSchools: mapSchoolsToTableSchools(updatedSchools) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
    } finally {
      set({ loading: false });
    }
  },
  delSchool: async (id) => {
    try {
      set({ loading: true });
      await deleteSchool(id);
      const updatedSchools = SchoolStore.getState().schools.filter((School) => School.id !== id);
      set({ schools: updatedSchools });
      set({ tableSchools: mapSchoolsToTableSchools(updatedSchools) });
      set({ open: false });
      toast.success("Autoridad eliminada correctamente");
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
    } finally {
      set({ loading: false });
    }
  },
  setLoading: (loading) => set({ loading }),
  setOpen: (open) => set({ open }),
}));
