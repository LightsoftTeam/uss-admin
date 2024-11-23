import { useForm } from "react-hook-form";
import { MapProfessorEmploymentType, ProfessorBodyRequest, ProfessorDocumentType, ProfessorEmploymentType } from "@/services/professors";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { ProfessorStore } from "../store/ProfessorStore";
import { Input } from "@/components/ui/input";
import { SchoolStore } from "@/pages/Schools/store/SchoolStore";
import Select from 'react-select';

function ModalProfessor() {
    const { setOpen, action, loading, open, professorSelected, setProfessorSelected, crtProfessor, updProfessor, delProfessor } = ProfessorStore()

    const { schools, getData } = SchoolStore()

    const title = () => {
        switch (action) {
            case 'edit':
                return 'Editar Profesor'
            case 'delete':
                return 'Eliminar Profesor'
            case 'create':
                return 'Crear Profesor'
            default:
                return 'Profesor'
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
    } = useForm<ProfessorBodyRequest>({
        defaultValues: {
            name: '',
        }
    })
    useEffect(() => {
        getData()
        if (action === 'create') {
            return reset()
        }
        if (action === 'edit') {
            if (!professorSelected) return
            reset(professorSelected)
        }
        return () => {
            reset()
            setProfessorSelected(null, 'none')
        }
    }, [])
    const onSubmit = handleSubmit(async (data, e) => {
        (e as any).preventDefault();
        if (action === 'create') {
            return await crtProfessor({
                ...data,
                documentType: ProfessorDocumentType.DNI
            })
        }
        if (action === 'edit') {
            if (!professorSelected) return
            await updProfessor(professorSelected.id, {
                ...data,
                documentType: ProfessorDocumentType.DNI
            })
            setProfessorSelected(null, 'none')
            setOpen(false)
            toast('Professor actualizado correctamente')
            return
        }
        if (action === 'delete') {
            if (!professorSelected) return
            return await delProfessor(professorSelected.id)
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

                <form onSubmit={onSubmit} encType='multipart/form-data'>
                    <pre className="text-xs hidden">
                        <code>
                            {JSON.stringify({ form: watch(), action }, null, 4)}
                        </code>
                    </pre>
                    {action === 'delete' && (
                        <div>
                            <h1 className="py-6">
                                ¿Estás seguro de eliminar a {professorSelected?.name}?
                            </h1>
                        </div>
                    )}
                    {(action === 'create' || action === 'edit') && (
                        <div className="pb-6 flex flex-col gap-2">
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="title" className="text-right">
                                    Nombre
                                </Label>
                                <Input
                                    id="title"
                                    value={watch('name')}
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
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    value={watch('email')}
                                    disabled={loading}
                                    className="col-span-3"
                                    placeholder="Email"
                                    {...register('email', {
                                        // validación de tipo email
                                        pattern: {
                                            value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                                            message: 'Email no válido.'
                                        },
                                    })}
                                />
                                {errors.email &&
                                    <span className="text-red-600 text-xs">{errors.email.message}</span>
                                }
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="numdoc" className="text-right">
                                    Nº Documento
                                </Label>
                                <Input
                                    id="numdoc"
                                    value={watch('documentNumber')}
                                    disabled={loading}
                                    type="number"
                                    className="col-span-3"
                                    placeholder="Núm. Documento"
                                    {...register('documentNumber', {
                                        required: {
                                            value: true,
                                            message: 'Núm. Documento es requerido.'
                                        },
                                        maxLength: {
                                            value: 8,
                                            message: 'Nombre debe tener 8 caracteres como máximo.'
                                        },
                                        minLength: {
                                            value: 8,
                                            message: 'Nombre debe tener 8 caracteres como mínimo.'
                                        }
                                    })}
                                />
                                {errors.documentNumber &&
                                    <span className="text-red-600 text-xs">{errors.documentNumber.message}</span>
                                }
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="modality" className="text-right">
                                    Tipo
                                </Label>
                                <Select
                                    options={
                                        Object.values(ProfessorEmploymentType).map((type) => ({
                                            value: type,
                                            label: MapProfessorEmploymentType[type]
                                        }))
                                    }
                                    {...register("employmentType", {
                                        required: {
                                            value: true,
                                            message: "Tipo es requerido.",
                                        },
                                    })}
                                    value={watch('employmentType') as any &&
                                    {
                                        value: watch('employmentType'),
                                        label: MapProfessorEmploymentType[watch('employmentType')]
                                    }
                                    }
                                    isDisabled={loading}
                                    className="w-full col-span-3 z-[100]"
                                    onChange={(option) => {
                                        setValue('employmentType', option?.value)
                                        setError('employmentType', {
                                            type: 'disabled'
                                        })
                                    }}
                                />
                                {errors.employmentType &&
                                    <span className="text-red-600 text-xs">{errors.employmentType.message}</span>
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
                                    {...register("schoolId", {
                                        required: {
                                            value: true,
                                            message: "Escuela es requerida.",
                                        },
                                    })}
                                    value={watch('schoolId') as any &&
                                        schools.find((school) => school.id === watch('schoolId')) &&
                                    {
                                        value: watch('schoolId'),
                                        label: schools.find((school) => school.id === watch('schoolId'))?.name
                                    }
                                    }
                                    isDisabled={loading}
                                    className="w-full col-span-3 z-[99]"
                                    onChange={(option) => {
                                        setValue('schoolId', option.value)
                                        setError('schoolId', {
                                            type: 'disabled'
                                        })
                                    }}
                                />
                                {errors.schoolId &&
                                    <span className="text-red-600 text-xs">{errors.schoolId.message}</span>
                                }
                            </div>
                        </div>
                    )}
                    <DialogFooter>
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
                </form>

            </DialogContent>
        </Dialog>
    )
}

export default ModalProfessor