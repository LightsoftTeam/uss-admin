import { api } from "./api";
import { Competency } from "./competencies";
import { Professor } from "./professors";
import { School } from "./schools";
import { User } from "./users";
export enum TrainingStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
export type MapTrainingStatusType = {
  [key in TrainingStatus]: string;
};
export const MapTrainingStatus: MapTrainingStatusType = {
  [TrainingStatus.ACTIVE]: "Activo",
  [TrainingStatus.INACTIVE]: "Inactivo",
};
export enum TrainingModality {
  PRESENTIAL = "presential",
  VIRTUAL = "virtual",
  SEMIPRESENTIAL = "semipresential",
}
export type MapTrainingModalityType = {
  [key in TrainingModality]: string;
};
export const MapTrainingModality: MapTrainingModalityType = {
  [TrainingModality.PRESENTIAL]: "Presencial",
  [TrainingModality.VIRTUAL]: "Virtual",
  [TrainingModality.SEMIPRESENTIAL]: "Semipresencial",
};
export enum RoleInscription {
  ASSISTANT = "assistant",
  SPEAKER = "speaker",
  ORGANIZER = "organizer",
}
// export enum MapRoleInscription {
//   assistant = "Asistente",
//   speaker = "Ponente",
//   organizer = "Organizador",
// }
export const MapRoleInscription: {
  [key in RoleInscription]: string;
} = {
  [RoleInscription.ASSISTANT]: "Asistente",
  [RoleInscription.SPEAKER]: "Ponente",
  [RoleInscription.ORGANIZER]: "Organizador",
};

export enum TypeTraining {
  EXTRA = "extra",
  SCHEDULED = "scheduled",
}
export const MapTypeTraining: {
  [key in TypeTraining]: string;
} = {
  [TypeTraining.EXTRA]: "Extraordinaria",
  [TypeTraining.SCHEDULED]: "Programada",
};

export interface Training {
  competencyId: string;
  code: string;
  name: string;
  organizer: "DDA" | School;
  status: TrainingStatus;
  modality: TrainingModality;
  executions: Execution[];
  competency: Competency;
  createdAt: string;
  background?: string;
  signature?: string;
  issueDate?: string;
  type: TypeTraining;
  id: string;
}

export enum AttendanceStatus {
  PENDING = "pending",
  ATTENDED = "attended",
}
export enum MapAttendanceStatus {
  pending = "Pendiente",
  attended = "Verificado",
}

export interface Attendance {
  id: string;
  participantId: string;
  status: string;
  createdAt: string;
}
export interface Execution {
  from: string;
  to: string;
  id: string;
  place: string;
  durationInMinutes: number;
  attendance: Attendance[];
}
export interface TrainingBodyRequest {
  competencyId: string;
  code: string;
  name: string;
  organizer: string;
  description: string;
  capacity: number;
  status: string;
  modality: string;
  semesterId: string;
  type: TypeTraining;
  certificateOrganizer: string;
  certificateBackgroundUrl?: string;
  certificateSignatureUrl?: string;
  certificateEmisionDate?: string;
  executions: Partial<Execution>[];
  credentialBackgroundUrl?: string;
  credentialTextToShare?: string;
  credentialHelpText?: string;
  credentialLogos?: string[];
}

export const getTrainings = async (): Promise<Training[]> => {
  const { data } = await api.get<Training[]>("/training");
  return data;
};

export const createTraining = async (
  Training: TrainingBodyRequest
): Promise<Training> => {
  const { data } = await api.post<Training>("/training", Training);
  return data;
};

export const updateTraining = async (
  id: string,
  Training: TrainingBodyRequest
): Promise<Training> => {
  const { data } = await api.put<Training>(`/training/${id}`, Training);
  return data;
};

export const deleteTraining = async (id: string): Promise<void> => {
  await api.delete(`/training/${id}`);
};

export interface Participant {
  id: string;
  foreignId: string;
  roles: RoleInscription[];
  attendanceStatus: AttendanceStatus;
  certificates: Certificate[];
  user: User;
  executions: ParticipantExecution[];
}
export interface ParticipantExecution extends Execution {
  participantAttend: boolean;
}

export interface Certificate {
  id: string;
  duration: number;
  emisionDate: string;
  trainingFromDate: string;
  trainingToDate: string;
  url: string;
  role: RoleInscription;
}

export interface ResourcesCredential {
  bg: string;
  band: string;
}

// {{url}}/api/app-configuration
export const getResourcesCredential =
  async (): Promise<ResourcesCredential> => {
    const { data } = await api.get<ResourcesCredential>("/app-configuration");
    return data;
  };

// {{url}}/api/app-configuration/:code
export const updateResource = async (
  code: "bg" | "band",
  url: string
): Promise<any> => {
  const { data } = await api.patch(`/app-configuration/${code}`, {
    value: url,
  });
  return data;
};

// {{url}}/api/training/:id/participants
export const getParticipants = async (id: string): Promise<Participant[]> => {
  const { data } = await api.get<Participant[]>(`/training/${id}/participants`);
  return data;
};

// {{url}}/api/training/participants/:participantId/complete
export const completeStatusOfParticipant = async (
  participantId: string
): Promise<Participant> => {
  const { data } = await api.post(
    `/training/participants/${participantId}/complete`
  );
  return data;
};

// {{url}}/api/training/:id/download-certificates
export const downloadCertificates = async (id: string): Promise<void> => {
  try {
    const response = await api.get(`/training/${id}/download-certificates`, {
      responseType: "blob", // Indicar que se espera un blob como respuesta
    });

    // Crear una URL para el blob
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Crear un enlace temporal para descargar el archivo
    const link = document.createElement("a");
    link.href = url;

    // Extraer el nombre del archivo del encabezado "content-disposition"
    const contentDisposition = response.headers["content-disposition"];
    const fileName = contentDisposition
      ? contentDisposition.split("filename=")[1].replace(/"/g, "") // Obtener el nombre del archivo y limpiar comillas dobles
      : "certificates.zip"; // Nombre predeterminado si no se proporciona uno en la respuesta

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Limpiar el enlace y la URL del blob
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
  }
};

export interface SingleTraining extends Training {
  participant: Participant;
}
export interface TrainingByDocument {
  professor: Professor;
  trainings: SingleTraining[];
}

// {{url}}/api/training/by-document/:documentType/:documentNumber
export const getTrainingsByDocument = async (
  documentType: string = "dni",
  documentNumber: number
): Promise<TrainingByDocument> => {
  const { data } = await api.get<TrainingByDocument>(
    `/training/by-document/${documentType}/${documentNumber}`
  );
  return data;
};
