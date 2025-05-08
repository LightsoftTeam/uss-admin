"use client"

import { Button } from "@/components/ui/button"
import { MapRoleInscription, MapTrainingModality, SingleTraining } from "@/services/trainings"
import { ColumnDef } from "@tanstack/react-table"
import { SearchTrainingStore } from "../../store/SearchTrainingStore"

export const columns: ColumnDef<SingleTraining>[] = [
    {
        accessorKey: "code",
        header: "Código",
    },
    {
        accessorKey: "name",
        header: "Nombre",
    },
    {
        accessorKey: "organizer",
        header: "Organizador",
        cell(props) {
            const { organizer } = props.row.original
            return organizer === "DDA" ? "DDA" : organizer.name
        },
    },
    {
        accessorKey: "modality",
        header: "Modalidad",
        cell: (props) => MapTrainingModality[props.row.original.modality],
    },
    {
        accessorKey: "participant",
        header: "Estado",
        cell: (props) => {
            const { participant } = props.row.original
            return participant.certificates?.length ? "Aprobado" : "Pendiente"
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const { participant } = row.original
            const loading = SearchTrainingStore(state => state.loading)
            const downloadCertificate = SearchTrainingStore(state => state.downloadCertificate)

            if (!participant.certificates?.length) return <></>

            return (
                // Descargar certificado
                <>
                    {participant.roles && (
                        <div className="flex flex-row gap-1">
                            {participant.roles.map((role) => (
                                <Button
                                    key={role + participant.id}
                                    size={"sm"}
                                    className="bg-blue-500 hover:bg-blue-500 hover:bg-opacity-80"
                                    disabled={loading}
                                    onClick={() => {
                                        if (!participant) return
                                        downloadCertificate({
                                            trainingId: row.original.id,
                                            participantId: participant.id,
                                            role,
                                        })
                                    }}
                                >
                                    <span className="text-xs">Certificado {MapRoleInscription[role]}</span>
                                    {loading && <span className="ml-2">
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" />
                                            <path className="opacity-75" d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z" />
                                        </svg>
                                    </span>}
                                </Button>
                            ))}
                        </div>
                    )}
                </>
            )
        },
    },
]
