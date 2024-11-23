import { Professor, ProfessorBodyRequest, createProfessor, updateProfessor, getProfessors, deleteProfessor, MapProfessorEmploymentType } from "@/services/professors";
import { ActionsTypes } from "@/types/general";
import { toast } from "sonner";
import { create } from "zustand";

interface TableProfessors {
  [key: string | number]: string | number | JSX.Element;
  id: string;
  documentNumber: number;
  email: string;
  name: string;
  employmentType: string;
}
type State = {
  professors: Professor[];
  tags: string[];
  tableProfessors: TableProfessors[];
  professorSelected: Professor | null;
  action: ActionsTypes;
  loading: boolean;
  open: boolean;
};

type Actions = {
  getData: () => Promise<void>;
  setProfessorSelected: (Professor: Professor | null, action: ActionsTypes) => void;
  crtProfessor: (body: ProfessorBodyRequest) => Promise<void>;
  updProfessor: (id: string, body: ProfessorBodyRequest) => Promise<void>;
  delProfessor: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
};

const mapProfessorsToTableProfessors = (Professors: Professor[]): TableProfessors[] => {
  return Professors.map((Professor) => ({
    name: Professor.name,
    id: Professor.id,
    documentNumber: Professor.documentNumber,
    email: Professor.email,
    employmentType: MapProfessorEmploymentType[Professor.employmentType],
  }));
}

export const ProfessorStore = create<State & Actions>((set) => ({
  professors: [],
  tags: [],
  tableProfessors: [],
  professorSelected: null,
  action: 'none',
  loading: false,
  open: false,
  getData: async () => {
    try {
      set({ loading: true });
      const Professors = await getProfessors();
      set({ professors: Professors });
      const tableProfessors = mapProfessorsToTableProfessors(Professors);
      set({ tableProfessors: tableProfessors });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente");
    } finally {
      set({ loading: false });
    }
  },
  setProfessorSelected(Professor, action) {
    const id = Professor?.id;
    const ProfessorSelected = ProfessorStore.getState().professors.find((Professor) => Professor.id === id);
    set({ professorSelected: ProfessorSelected, action, open: !!id });
  },
  crtProfessor: async (body) => {
    try {
      set({ loading: true });
      const newProfessor = await createProfessor(body);
      set({ professors: [newProfessor, ...ProfessorStore.getState().professors] });
      set({ tableProfessors: mapProfessorsToTableProfessors(ProfessorStore.getState().professors) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
    } finally {
      set({ loading: false });
    }
  },
  updProfessor: async (id, body) => {
    try {
      set({ loading: true });
      const updatedProfessor = await updateProfessor(id, body);
      const updatedProfessors = ProfessorStore.getState().professors.map((Professor) =>
        Professor.id === updatedProfessor.id ? updatedProfessor : Professor
      );
      set({ professors: updatedProfessors });
      set({ tableProfessors: mapProfessorsToTableProfessors(updatedProfessors) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
    } finally {
      set({ loading: false });
    }
  },
  delProfessor: async (id) => {
    try {
      set({ loading: true });
      await deleteProfessor(id);
      const updatedProfessors = ProfessorStore.getState().professors.filter((Professor) => Professor.id !== id);
      set({ professors: updatedProfessors });
      set({ tableProfessors: mapProfessorsToTableProfessors(updatedProfessors) });
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
