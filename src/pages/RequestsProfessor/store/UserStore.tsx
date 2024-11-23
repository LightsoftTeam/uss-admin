import { User, UserBodyRequest, createUser, updateUser, getUsers, deleteUser, Country, changeRoleRequest } from "@/services/users";
import { ActionsTypes } from "@/types/general";
import { toast } from "sonner";
import { create } from "zustand";
import { MapRoleUser } from '../../../services/users';

interface TableUsers {
  [key: string | number]: string | number | JSX.Element;
  id: string;
  name: string | JSX.Element;
  country: string | JSX.Element;
  email: string;
  role: string;
}
type State = {
  users: User[];
  countries: Country[];
  tags: string[];
  tableUsers: TableUsers[];
  userSelected: User | null;
  action: ActionsTypes;
  loading: boolean;
  open: boolean;
};

type Actions = {
  getData: () => Promise<void>;
  setUserSelected: (user: User | null, action: ActionsTypes) => void;
  crtUser: (body: UserBodyRequest) => Promise<void>;
  updUser: (id: string, body: UserBodyRequest) => Promise<void>;
  delUser: (id: string) => Promise<void>;
  changeRoleRequest: (action: 'accept' | 'reject') => Promise<void>;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
};

const mapUsersToTableUsers = (users: User[]): TableUsers[] => {
  return users.map((user) => ({
    name: (
      <div className="flex flex-row gap-2">
        <img
          className="w-12 h-12 rounded-lg object-cover"
          src={
            user.image ||
            "https://avatars.githubusercontent.com/u/93000567"
          }
          alt={user.name}
        />
        <span className="text-xs font-semibold">{user.name}</span>
      </div>
    ),
    country: (
      <div className="flex flex-row gap-2 items-center">
        <img
          className="w-8 h-8 rounded-lg object-cover"
          src={user.country?.icon}
          alt={user.country?.name}
        />
        <span className="text-xs font-semibold">{user.country?.name}</span>
      </div>
    ),
    email: user.email,
    role: MapRoleUser[user.role],
    id: user.id,
  }));
}

export const RequestsProffesorStore = create<State & Actions>()((set, get) => ({
  tags: [],
  users: [],
  countries: [],
  tableUsers: [],
  userSelected: null,
  action: 'none',
  loading: false,
  open: false,
  getData: async () => {
    try {
      set({ loading: true });
      const users = await getUsers(undefined, true);
      set({ users });
      const tableUsers = mapUsersToTableUsers(users);
      set({ tableUsers });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente");
    } finally {
      set({ loading: false });
    }
  },
  setUserSelected(user, action) {
    const userSelected = get().users.find((User) => User.id === user?.id);
    set({ userSelected, action, open: !!user?.id });
  },
  crtUser: async (body) => {
    try {
      set({ loading: true });
      const newUser = await createUser(body);
      set({ users: [newUser, ...get().users] });
      set({ tableUsers: mapUsersToTableUsers(get().users) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
    } finally {
      set({ loading: false });
    }
  },
  updUser: async (id, body) => {
    try {
      set({ loading: true });
      const updatedUser = await updateUser(id, {
        ...body,
        password: body.password === "" ? (undefined as any) : body.password
      });
      const updatedUsers = get().users.map((User) =>
        User.id === updatedUser.id ? updatedUser : User
      );
      set({ users: updatedUsers });
      set({ tableUsers: mapUsersToTableUsers(updatedUsers) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
    } finally {
      set({ loading: false });
    }
  },
  delUser: async (id) => {
    try {
      set({ loading: true });
      await deleteUser(id);
      const updatedUsers = get().users.filter((User) => User.id !== id);
      set({ users: updatedUsers });
      set({ tableUsers: mapUsersToTableUsers(updatedUsers) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
      toast.error("Ocurrió un error inesperado, intente nuevamente");
    } finally {
      set({ loading: false });
    }
  },

  changeRoleRequest: async (action) => {
    try {
      set({ loading: true });
      const userSelected = get().userSelected;
      if (!userSelected) return;
      await changeRoleRequest(userSelected.id, action);
      const updatedUsers = get().users.filter((User) => User.id !== userSelected.id);
      set({ users: updatedUsers });
      set({ tableUsers: mapUsersToTableUsers(updatedUsers) });
      set({ open: false });
    } catch (error) {
      console.error("Ocurrió un error inesperado, intente nuevamente", error);
      toast.error("Ocurrió un error inesperado, intente nuevamente");
    } finally {
      set({ loading: false });
    }
  },

  setLoading: (loading) => set({ loading }),
  setOpen: (open) => set({ open }),
}));
