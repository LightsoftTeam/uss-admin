"use client"

import { Button } from "@/components/ui/button"
import { AttendanceStatus, MapAttendanceStatus, MapRoleInscription, Participant } from "@/services/trainings"
import { ColumnDef } from "@tanstack/react-table"
import { TrainingStore } from "../../store/TrainingStore"
import { formatDateTimeRange } from "@/lib/utils"

export const columns: ColumnDef<Participant>[] = [
    {
        accessorKey: "professor",
        header: "Participante",
        cell(props) {
            const { user } = props.row.original
            return (
                <div className="flex flex-col gap-[1px]">
                    <span className="text-base font-semibold">
                        {user.name}
                    </span>
                    <span className="text-sm font-normal">
                        DNIº {user.documentNumber}
                    </span>
                    <span className="text-xs font-normal">
                        {user.email}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "executions",
        header: "Asistencias",
        cell({ row }) {
            // Lista de horarios y muestra por cada asistencia si fue verificada o no
            const { executions } = row.original
            return (
                <div className="flex flex-col gap-1">
                    {executions.map((execution) => {
                        const { date, time } = formatDateTimeRange(execution.from, execution.to)
                        return (
                            <div key={execution.id} className="flex flex-col gap-1">
                                <span className="text-xs font-semibold">
                                    {date} - {time}
                                </span>
                                <div className="flex gap-1">
                                    {/* execution.participantAttend */}
                                    {execution.participantAttend ? (
                                        <span className="text-sm text-green-500">
                                            Verificado
                                        </span>
                                    ) : (
                                        <span className="text-sm text-red-500">
                                            Pendiente
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        },
    },
    {
        accessorKey: "roles",
        header: "Roles",
        cell({ row }) {
            const { roles } = row.original
            return (
                <div className="flex flex-col gap-1">
                    {roles.map((role) => {
                        return (
                            <div key={role} className="flex gap-1">
                                <span className="text-xs font-semibold">
                                    {MapRoleInscription[role]}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )
        },
    },
    {
        accessorKey: "attendanceStatus",
        header: "Estado",
        cell: (props) => MapAttendanceStatus[props.row.original.attendanceStatus],
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const participant = row.original
            const { downloadCertificate, verifyAttendance, loading } = TrainingStore()

            return (
                // Descargar certificado
                <div className="flex gap-y-1">
                    {participant.certificates && (
                        <div className="flex flex-row gap-1">
                            {participant.certificates.map((certificate) => (
                            <Button
                                key={certificate.id}
                                disabled={loading}
                                size={"sm"}
                                className="bg-blue-500 hover:bg-blue-500 hover:bg-opacity-80"
                                onClick={() => {
                                    if (!participant) return
                                    downloadCertificate(certificate)
                                }}
                            >
                                <span className="text-xs">Certificado {MapRoleInscription[certificate.role]}</span>
                            </Button>
                        ))}
                        </div>
                    )}
                    {participant.attendanceStatus === AttendanceStatus.PENDING && (
                        <Button
                            disabled={loading}
                            size={"sm"}
                            className="bg-green-500 hover:bg-green-500 hover:bg-opacity-80"
                            onClick={() => {
                                if (!participant) return
                                verifyAttendance(participant)
                            }}
                        >
                            <span className="text-xs">Verificar</span>
                        </Button>
                    )}
                </div>
            )
        },
    },
]
