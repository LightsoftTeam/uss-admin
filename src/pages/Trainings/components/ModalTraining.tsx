import { useForm } from "react-hook-form";
import { MapTrainingModality, MapTrainingStatus, MapTypeTraining, TrainingBodyRequest, TrainingModality, TrainingStatus, TypeTraining } from "@/services/trainings";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { TrainingStore } from "../store/TrainingStore";
import { Input } from "@/components/ui/input";
import { SchoolStore } from "@/pages/Schools/store/SchoolStore";
import Select from 'react-select';
import { DialogDescription } from "@radix-ui/react-dialog";
import { Copy, PlusIcon, Trash2Icon } from "lucide-react";
import { DataTableParticipants } from "./participant/table";
import { columns } from "./participant/column";
import { uploadFile } from "@/services/posts";
import { SemesterStore } from "@/pages/Semesters/store/SemesterStore";
import { getQrLink } from "@/lib/utils";


function ModalTraining() {
    const { setOpen, action, loading, setLoading, open, trainingSelected, participantsDraft, competencies, setTrainingSelected, getParticipantsByTraining, crtTraining, updTraining, delTraining, searchParticipants, downloadCertificates } = TrainingStore()
    const { semesters } = SemesterStore()
    const { schools } = SchoolStore()


    const title = () => {
        switch (action) {
            case 'view':
                return 'Compartir Qr para Marcar Asistencia'
            case 'edit':
                return 'Editar Certificación'
            case 'delete':
                return 'Eliminar Certificación'
            case 'create':
                return 'Crear Certificación'
            case 'list':
                return 'Lista de Inscripciones'
            default:
                return 'Certificación'
        }
    };

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        setError,
    } = useForm<TrainingBodyRequest>({
        defaultValues: {
            name: '',
            executions: [],
        }
    })
    useEffect(() => {
        if (action === 'list') {
            getParticipantsByTraining()
        }
        if (action === 'create') {
            return reset()
        }
        if (action === 'edit') {
            if (!trainingSelected) return
            reset({
                ...trainingSelected,
                organizer: trainingSelected.organizer === 'DDA' ? 'DDA' : trainingSelected.organizer.id,
                executions: trainingSelected.executions.map((execution) => ({
                    ...execution,
                    from: execution.from.split('.')[0],
                    to: execution.to.split('.')[0]
                })),
                competencyId: trainingSelected.competencyId,
            })

        }
        return () => {
            reset()
            setTrainingSelected(null, 'none')
        }
    }, [])

    const handleOnChangeImageInput = async (e: React.ChangeEvent<HTMLInputElement>, path: 'certificateBackgroundUrl' | 'certificateSignatureUrl' | 'credentialBackgroundUrl') => {
        const file = e.target.files![0];
        try {
            setLoading(true);
            const { url } = await uploadFile(file);
            setValue(path as any, url)
        } catch (error) {
            toast.error('Ocurrió un error inesperado, intente nuevamente');
        } finally {
            setLoading(false);
        }
    }

    const onSubmit = handleSubmit(async (data, e) => {
        (e as any).preventDefault();
        if (action === 'create') {
            if (data.executions.length === 0) {
                setError('executions', {
                    type: 'required',
                    message: 'Debe existir al menos 1 registro.'
                })
                return
            }
            const executions = data.executions.map((execution) => ({
                ...execution,
                durationInMinutes: Number(execution.durationInMinutes)
            }))
            return await crtTraining({
                ...data,
                status: TrainingStatus.ACTIVE,
                executions,
            })
        }
        if (action === 'edit') {
            if (!trainingSelected) return
            await updTraining(trainingSelected.id, {
                ...data,
            })
            setTrainingSelected(null, 'none')
            setOpen(false)
            toast('Training actualizado correctamente')
            return
        }
        if (action === 'delete') {
            if (!trainingSelected) return
            return await delTraining(trainingSelected.id)
        }
    })
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className={"lg:max-w-screen-lg max-h-screen overflow-y-auto"}
                onPointerDownOutside={e => {
                    e.preventDefault()
                }}>
                <DialogHeader>
                    <DialogTitle>{title()}</DialogTitle>
                </DialogHeader>

                <DialogDescription asChild className="">
                    <form onSubmit={onSubmit} encType='multipart/form-data'>
                        <pre className="text-xs hidden">
                            <code>
                                {JSON.stringify({
                                    form: watch(), action,
                                    // errors
                                }, null, 4)}
                            </code>
                        </pre>
                        {(action === 'view') && (
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-row gap-1 items-center">
                                    <a
                                        href={`https://observatorio.uss.edu.pe/marcar-asistencia/${trainingSelected?.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        Copiar Url para Marcar Asistencia
                                    </a>
                                    <Button
                                        variant="outline"
                                        className="w-5 h-5 p-0 m-0"
                                        onClick={() => {
                                            // copiar al portapapeles
                                            navigator.clipboard.writeText(`https://observatorio.uss.edu.pe/marcar-asistencia/${trainingSelected?.id}`);
                                        }}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <img src={getQrLink(
                                        `https://observatorio.uss.edu.pe/marcar-asistencia/${trainingSelected?.id}`
                                    )} alt="" />
                                </div>
                            </div>
                        )}
                        {(action === 'list') && (
                            <div className="flex flex-col gap-3">
                                {loading && <p className="text-base font-medium text-gray-500 text-center py-5">Buscando inscripciones...</p>}
                                {/* Descargar certificados */}
                                <Button
                                    disabled={loading}
                                    onClick={() => {
                                        if (!trainingSelected) return
                                        downloadCertificates()
                                    }}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Descargar Certificados
                                </Button>
                                {participantsDraft && <>
                                    <div className="flex justify-between items-center gap-2">
                                        <Input
                                            id="search"
                                            disabled={loading}
                                            className="col-span-3"
                                            placeholder="Busqueda personalizada"
                                            onChange={(e) => searchParticipants(e.target.value)}
                                        />
                                    </div>
                                    <DataTableParticipants columns={columns} data={participantsDraft} />
                                </>}
                            </div>
                        )}
                        {action === 'delete' && (
                            <div>
                                <h1 className="py-6">
                                    ¿Estás seguro de eliminar a {trainingSelected?.name}?
                                </h1>
                            </div>
                        )}
                        {(action === 'create' || action === 'edit') && (
                            <div className="py-6 flex flex-col gap-2">
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="category" className="text-right">
                                        Semestre
                                    </Label>
                                    <Select
                                        options={
                                            semesters.map((semester) => ({
                                                value: semester.id,
                                                label: semester.name
                                            }))
                                        }
                                        {...register("semesterId", {
                                            required: {
                                                value: true,
                                                message: "Semestre es requerido.",
                                            },
                                        })}
                                        value={watch('semesterId') as any &&
                                            semesters.find((semester) => semester.id === watch('semesterId')) &&
                                        {
                                            value: watch('semesterId'),
                                            label: semesters.find((semester) => semester.id === watch('semesterId'))?.name
                                        }
                                        }
                                        isDisabled={loading}
                                        className="w-full col-span-3 z-[102]"
                                        onChange={(option) => {
                                            setValue('semesterId', option.value)
                                            setError('semesterId', {
                                                type: 'disabled'
                                            })
                                        }}
                                    />
                                    {errors.semesterId &&
                                        <span className="text-red-600 text-xs">{errors.semesterId.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="modality" className="text-right">
                                        Tipo
                                    </Label>
                                    <Select
                                        options={
                                            Object.values(TypeTraining).map((type) => ({
                                                value: type,
                                                label: MapTypeTraining[type]
                                            }))
                                        }
                                        {...register("type", {
                                            required: {
                                                value: true,
                                                message: "Tipo es requerida.",
                                            },
                                        })}
                                        value={watch('type') as any &&
                                        {
                                            value: watch('type'),
                                            label: MapTypeTraining[watch('type')]
                                        }
                                        }
                                        isDisabled={loading}
                                        className="w-full col-span-3 z-[99]"
                                        onChange={(option) => {
                                            setValue('type', option?.value)
                                            setError('type', {
                                                type: 'disabled'
                                            })
                                        }}
                                    />
                                    {errors.type &&
                                        <span className="text-red-600 text-xs">{errors.type.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="code" className="text-right">
                                        Código
                                    </Label>
                                    <Input
                                        id="code"
                                        disabled={loading}
                                        className="col-span-3"
                                        placeholder="Código"
                                        {...register('code', {
                                            required: {
                                                value: true,
                                                message: 'Código es requerido.'
                                            }
                                        })}
                                    />
                                    {errors.code &&
                                        <span className="text-red-600 text-xs">{errors.code.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="name" className="text-right">
                                        Nombre
                                    </Label>
                                    <Input
                                        id="name"
                                        disabled={loading}
                                        className="col-span-3"
                                        placeholder="Nombre"
                                        {...register('name', {
                                            required: {
                                                value: true,
                                                message: 'Nombre es requerido.'
                                            },
                                            maxLength: {
                                                value: 80,
                                                message: 'Nombre debe tener 80 caracteres como máximo.'
                                            }
                                        })}
                                    />
                                    {errors.name &&
                                        <span className="text-red-600 text-xs">{errors.name.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="description" className="text-right">
                                        Descripción
                                    </Label>
                                    <Input
                                        id="description"
                                        disabled={loading}
                                        className="col-span-3"
                                        placeholder="Descripción"
                                        {...register('description', {
                                            required: {
                                                value: true,
                                                message: 'Descripción es requerido.'
                                            },
                                            maxLength: {
                                                value: 80,
                                                message: 'Descripción debe tener 80 caracteres como máximo.'
                                            }
                                        })}
                                    />
                                    {errors.description &&
                                        <span className="text-red-600 text-xs">{errors.description.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="capacity" className="text-right">
                                        Capacidad
                                    </Label>
                                    <Input
                                        id="capacity"
                                        disabled={loading}
                                        className="col-span-3"
                                        type="number"
                                        placeholder="Capacidad"
                                        {...register('capacity', {
                                            required: {
                                                value: true,
                                                message: 'Capacidad es requerido.'
                                            },
                                            maxLength: {
                                                value: 6,
                                                message: 'Capacidad debe tener 80 caracteres como máximo.'
                                            }
                                        })}
                                    />
                                    {errors.capacity &&
                                        <span className="text-red-600 text-xs">{errors.capacity.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <div className="flex gap-2 py-2 items-center">
                                        <Label htmlFor="chronograme" className="text-right">
                                            Cronograma
                                        </Label>
                                        {/* Agregar execution */}
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setValue('executions', [
                                                    ...(watch('executions') || []),
                                                    {
                                                        from: '',
                                                        to: '',
                                                        place: '',
                                                        durationInMinutes: 0,
                                                    }
                                                ])
                                            }}
                                            className="bg-uss-green-700 hover:bg-uss-green-800 text-white font-bold rounded duration-300 p-0 m-0 h-6 w-6">
                                            <PlusIcon size={14} />
                                        </Button>
                                    </div>
                                    {watch('executions')?.map((_execution, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="flex flex-col gap-1">
                                                <Input
                                                    id={`from-${index}`}
                                                    disabled={loading}
                                                    className="col-span-3"
                                                    type="datetime-local"
                                                    placeholder="Desde"
                                                    {...register(`executions.${index}.from`, {
                                                        required: {
                                                            value: true,
                                                            message: 'Desde es requerido.'
                                                        }
                                                    })}
                                                />
                                                {errors?.executions?.[index]?.from &&
                                                    <span className="text-red-600 text-xs">{errors?.executions?.[index]?.from?.message}</span>
                                                }
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Input
                                                    id={`to-${index}`}
                                                    disabled={loading}
                                                    className="col-span-3"
                                                    type="datetime-local"
                                                    placeholder="Hasta"
                                                    {...register(`executions.${index}.to`, {
                                                        required: {
                                                            value: true,
                                                            message: 'Hasta es requerido.'
                                                        }
                                                    })}
                                                />
                                                {errors?.executions?.[index]?.to &&
                                                    <span className="text-red-600 text-xs">{errors?.executions?.[index]?.to?.message}</span>
                                                }
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Input
                                                    id={`place-${index}`}
                                                    disabled={loading}
                                                    className="col-span-3"
                                                    type="text"
                                                    placeholder="Lugar o Link"
                                                    {...register(`executions.${index}.place`, {
                                                        required: {
                                                            value: true,
                                                            message: 'Lugar o Link es requerido.'
                                                        }
                                                    })}
                                                />
                                                {errors?.executions?.[index]?.place &&
                                                    <span className="text-red-600 text-xs">{errors?.executions?.[index]?.place?.message}</span>
                                                }
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Input
                                                    id={`durationInMinutes-${index}`}
                                                    disabled={loading}
                                                    className="col-span-3"
                                                    type="number"
                                                    placeholder="Duración en horas"
                                                    {...register(`executions.${index}.durationInMinutes`, {
                                                        required: {
                                                            value: true,
                                                            message: 'Duración en horas es requerido.'
                                                        }
                                                    })}
                                                />
                                                {errors?.executions?.[index]?.durationInMinutes &&
                                                    <span className="text-red-600 text-xs">{errors?.executions?.[index]?.durationInMinutes?.message}</span>
                                                }
                                            </div>
                                            {/* Eliminar fila */}
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    setValue('executions', (watch('executions') || []).filter((_, i) => i !== index))
                                                }}
                                                className="bg-red-700 hover:bg-red-800 text-white font-bold rounded duration-300">
                                                <Trash2Icon size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    {/* Si el arreglo de execution está vacío, setError de que debe existir al menos 1 registro */}
                                    {errors.executions &&
                                        <span className="text-red-600 text-xs">{errors.executions.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="category" className="text-right">
                                        Escuela
                                    </Label>
                                    <Select
                                        options={
                                            schools.map((school) => ({
                                                value: school.id,
                                                label: school.name
                                            }))
                                        }
                                        {...register("organizer", {
                                            required: {
                                                value: true,
                                                message: "Escuela es requerida.",
                                            },
                                        })}
                                        value={watch('organizer') as any &&
                                            schools.find((school) => school.id === watch('organizer')) &&
                                        {
                                            value: watch('organizer'),
                                            label: schools.find((school) => school.id === watch('organizer'))?.name
                                        }
                                        }
                                        isDisabled={loading}
                                        className="w-full col-span-3 z-[102]"
                                        onChange={(option) => {
                                            setValue('organizer', option.value)
                                            setError('organizer', {
                                                type: 'disabled'
                                            })
                                        }}
                                    />
                                    {errors.organizer &&
                                        <span className="text-red-600 text-xs">{errors.organizer.message}</span>
                                    }
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="category" className="text-right">
                                        Competencia
                                    </Label>
                                    <Select
                                        options={
                                            competencies.map((school) => ({
                                                value: school.id,
                                                label: school.name
                                            }))
                                        }
                                        {...register("competencyId", {
                                            required: {
                                                value: true,
                                                message: "Competencia es requerida.",
                                            },
                                        })}
                                        value={watch('competencyId') as any &&
                                            competencies.find((c) => c.id === watch('competencyId')) &&
                                        {
                                            value: watch('competencyId'),
                                            label: competencies.find((c) => c.id === watch('competencyId'))?.name
                                        }
                                        }
                                        isDisabled={loading}
                                        className="w-full col-span-3 z-[101]"
                                        onChange={(option) => {
                                            setValue('competencyId', option.value)
                                            setError('competencyId', {
                                                type: 'disabled'
                                            })
                                        }}
                                    />
                                    {errors.competencyId &&
                                        <span className="text-red-600 text-xs">{errors.competencyId.message}</span>
                                    }
                                </div>
                                {(action === 'edit') && (
                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="status" className="text-right">
                                            Status
                                        </Label>
                                        <Select
                                            options={
                                                Object.values(TrainingStatus).map((status) => ({
                                                    value: status,
                                                    label: MapTrainingStatus[status]
                                                }))
                                            }
                                            {...register("status", {
                                                required: {
                                                    value: true,
                                                    message: "Escuela es requerida.",
                                                },
                                            })}
                                            value={watch('status') as any &&
                                            {
                                                value: watch('status'),
                                                label: MapTrainingStatus[watch('status') as TrainingStatus]
                                            }
                                            }
                                            isDisabled={loading}
                                            className="w-full col-span-3 z-[100]"
                                            onChange={(option) => {
                                                setValue('status', option?.value as string)
                                                setError('status', {
                                                    type: 'disabled'
                                                })
                                            }}
                                        />
                                        {errors.status &&
                                            <span className="text-red-600 text-xs">{errors.status.message}</span>
                                        }
                                    </div>
                                )}
                                <div className="flex flex-col items-start gap-2">
                                    <Label htmlFor="modality" className="text-right">
                                        Modalidad
                                    </Label>
                                    <Select
                                        options={
                                            Object.values(TrainingModality).map((modality) => ({
                                                value: modality,
                                                label: MapTrainingModality[modality]
                                            }))
                                        }
                                        {...register("modality", {
                                            required: {
                                                value: true,
                                                message: "Escuela es requerida.",
                                            },
                                        })}
                                        value={watch('modality') as any &&
                                        {
                                            value: watch('modality'),
                                            label: MapTrainingModality[watch('modality') as TrainingModality]
                                        }
                                        }
                                        isDisabled={loading}
                                        className="w-full col-span-3 z-[99]"
                                        onChange={(option) => {
                                            setValue('modality', option?.value as string)
                                            setError('modality', {
                                                type: 'disabled'
                                            })
                                        }}
                                    />
                                    {errors.modality &&
                                        <span className="text-red-600 text-xs">{errors.modality.message}</span>
                                    }
                                </div>

                                <div className="flex flex-col gap-2 border border-slate-600 p-4 mt-6 rounded-lg relative">
                                    <span className="absolute left-3 -top-2 text-slate-600 bg-white px-2 text-xs">Recursos para certificado</span>
                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="certificateOrganizer" className="text-right">
                                            Organizado por
                                        </Label>
                                        <Input
                                            id="certificateOrganizer"
                                            disabled={loading}
                                            className="col-span-3"
                                            placeholder="Organizado por"
                                            {...register('certificateOrganizer', {
                                                required: {
                                                    value: true,
                                                    message: 'Organizado por es requerido.'
                                                }
                                            })}
                                        />
                                        {errors.certificateOrganizer &&
                                            <span className="text-red-600 text-xs">{errors.certificateOrganizer.message}</span>
                                        }
                                    </div>
                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="background" className="text-right">
                                            Fondo del certificado
                                        </Label>
                                        <Input disabled={loading} id="background" type="file" name="media" onChange={
                                            (e) => handleOnChangeImageInput(e, 'certificateBackgroundUrl')
                                        } />
                                        <Input
                                            disabled={loading}
                                            value={watch('certificateBackgroundUrl') || ''}
                                            className="hidden"
                                            {...register('certificateBackgroundUrl', {
                                                required: {
                                                    value: true,
                                                    message: 'Imagen de fondo es requerida.'
                                                },
                                            })}
                                        />
                                        {errors.certificateBackgroundUrl &&
                                            <span className="text-red-600 text-xs">{errors.certificateBackgroundUrl.message}</span>
                                        }
                                        {watch('certificateBackgroundUrl') && (
                                            <img src={watch('certificateBackgroundUrl')} alt="background" className="h-24 w-24 object-contain" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="signature" className="text-right">
                                            Firma
                                        </Label>
                                        <Input disabled={loading} id="signature" type="file" name="media" onChange={
                                            (e) => handleOnChangeImageInput(e, 'certificateSignatureUrl')
                                        } />
                                        <Input
                                            disabled={loading}
                                            value={watch('certificateSignatureUrl') || ''}
                                            className="hidden"
                                            {...register('certificateSignatureUrl', {
                                                required: {
                                                    value: true,
                                                    message: 'Imagen de firma es requerida.'
                                                },
                                            })}
                                        />
                                        {errors.certificateSignatureUrl &&
                                            <span className="text-red-600 text-xs">{errors.certificateSignatureUrl.message}</span>
                                        }
                                        {watch('certificateSignatureUrl') && (
                                            <img src={watch('certificateSignatureUrl')} alt="background" className="h-24 w-24 object-contain" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="date" className="text-right">
                                            Fecha de emisión
                                        </Label>
                                        <Input
                                            id="date"
                                            disabled={loading}
                                            className="col-span-3"
                                            type="date"
                                            placeholder="Fecha de emisión"
                                            {...register('certificateEmisionDate', {
                                                required: {
                                                    value: true,
                                                    message: 'Fecha de emisión es requerida.'
                                                }
                                            })}
                                        />
                                        {errors.certificateEmisionDate &&
                                            <span className="text-red-600 text-xs">{errors.certificateEmisionDate.message}</span>
                                        }
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border border-slate-600 p-4 mt-6 rounded-lg relative">
                                    <span className="absolute left-3 -top-2 text-slate-600 bg-white px-2 text-xs">Recursos para Credencial a Compartir</span>

                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="credentialTextToShare" className="text-right">
                                            Texto en publicación
                                        </Label>
                                        <Input
                                            id="credentialTextToShare"
                                            disabled={loading}
                                            className="col-span-3"
                                            placeholder="Texto en publicación"
                                            {...register('credentialTextToShare', {
                                                required: false,
                                                maxLength: {
                                                    value: 180,
                                                    message: 'Texto en publicación debe tener 180 caracteres como máximo.'
                                                }
                                            })}
                                        />
                                        {errors.credentialTextToShare &&
                                            <span className="text-red-600 text-xs">{errors.credentialTextToShare.message}</span>
                                        }
                                    </div>

                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="credentialBackgroundUrl" className="text-right">
                                            Fondo de la Credencial
                                        </Label>
                                        <Input disabled={loading} id="credentialBackgroundUrl" type="file" name="media" onChange={
                                            (e) => handleOnChangeImageInput(e, 'credentialBackgroundUrl')
                                        } />
                                        <Input
                                            disabled={loading}
                                            value={watch('credentialBackgroundUrl') || ''}
                                            className="hidden"
                                            {...register('credentialBackgroundUrl', {
                                                required: false
                                            })}
                                        />
                                        {errors.credentialBackgroundUrl &&
                                            <span className="text-red-600 text-xs">{errors.credentialBackgroundUrl.message}</span>
                                        }
                                        {watch('credentialBackgroundUrl') && (
                                            <img src={watch('credentialBackgroundUrl')} alt="background" className="h-24 w-24 object-contain" />
                                        )}
                                    </div>

                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="credentialHelpText" className="text-right">
                                            Texto en credencial
                                        </Label>
                                        <Input
                                            id="credentialHelpText"
                                            disabled={loading}
                                            className="col-span-3"
                                            placeholder="Texto en credencial"
                                            {...register('credentialHelpText', {
                                                required: false,
                                                maxLength: {
                                                    value: 80,
                                                    message: 'Texto en credencial debe tener 80 caracteres como máximo.'
                                                }
                                            })}
                                        />
                                        {errors.credentialHelpText &&
                                            <span className="text-red-600 text-xs">{errors.credentialHelpText.message}</span>
                                        }
                                    </div>

                                    <div className="flex flex-col items-start gap-2">
                                        <Label htmlFor="credentialLogos" className="text-right">
                                            Logos (máx 4)
                                        </Label>
                                        <Input
                                            id="credentialLogos"
                                            disabled={loading}
                                            className="col-span-3"
                                            type="file"
                                            multiple
                                            accept="image/png, image/jpeg"
                                            onChange={async (e) => {
                                                const files = e.target.files;
                                                if (!files) return;
                                                if (files.length > 4) {
                                                    toast.error('Sólo se permiten 4 logos');
                                                    return;
                                                }
                                                try {
                                                    setLoading(true);
                                                    const urls = await Promise.all(Array.from(files).map(async (file) => {
                                                        const { url } = await uploadFile(file);
                                                        return url;
                                                    }))
                                                    setValue('credentialLogos', urls)
                                                } catch (error) {
                                                    toast.error('Ocurrió un error inesperado, intente nuevamente');
                                                    // limpiar el input
                                                    e.target.value = '';
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            {watch('credentialLogos')?.map((url, index) => (
                                                <div key={index} className="flex  gap-2 items-center">
                                                    <img src={url} alt="" className="h-12 w-12 object-contain" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {(action === 'create' || action === 'edit') && (
                            <DialogFooter className="pt-4">
                                <Button
                                    disabled={loading}
                                    type="submit"
                                    className="bg-uss-green-700 hover:bg-uss-green-800 text-white font-bold py-2 px-4 rounded duration-300">
                                    Guardar
                                </Button>
                                <Button
                                    onClick={() => setOpen(!open)}
                                    className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded duration-300">
                                    Cancelar
                                </Button>
                            </DialogFooter>
                        )}
                    </form>
                </DialogDescription>

            </DialogContent>
        </Dialog>
    )
}

export default ModalTraining