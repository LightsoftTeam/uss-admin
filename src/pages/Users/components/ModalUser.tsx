import { useForm } from "react-hook-form";
import { MapRoleUser, RoleUserSelect, UserBodyRequest } from "@/services/users";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import Select from 'react-select';
import { toast } from "sonner";
import { uploadFile } from "@/services/posts";
import { UserStore } from "../store/UserStore";
import { Input } from "@/components/ui/input";
import { MapProfessorEmploymentType, ProfessorDocumentType, ProfessorEmploymentType } from "@/services/professors";
import { Loader } from "lucide-react";
import { SchoolStore } from "@/pages/Schools/store/SchoolStore";

function ModalUser() {
    const { setOpen, action, loading, open, userSelected, setUserSelected, crtUser, updUser, setLoading, delUser, countries } = UserStore()

    const schools = SchoolStore(state => state.schools)
    const getListSchools = SchoolStore(state => state.getData)
    const loadSchools = SchoolStore(state => state.loading)

    useEffect(() => {
        getListSchools()
    }, [])

    const title = () => {
        switch (action) {
            case 'edit':
                return 'Editar Usuario'
            case 'delete':
                return 'Eliminar Usuario'
            case 'create':
                return 'Crear Usuario'
            default:
                return 'Usuario'
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
    } = useForm<UserBodyRequest>({
        defaultValues: {
            email: '',
            image: '',
            name: '',
            password: '',
            role: 'user',
        }
    })
    useEffect(() => {
        if (action === 'create') {
            return reset()
        }
        if (action === 'edit') {
            if (!userSelected) return
            reset({
                ...userSelected,
                documentType: userSelected.documentType || undefined,
            })
        }
        return () => {
            reset()
            setUserSelected(null, 'none')
        }
    }, [])
    const handleOnChangeImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        try {
            setLoading(true);
            const { url } = await uploadFile(file);
            setValue('image', url)
        } catch (error) {
            toast.error('Ocurrió un error inesperado, intente nuevamente');
        } finally {
            setLoading(false);
        }
    }
    const onSubmit = handleSubmit(async (data, e) => {
        (e as any).preventDefault();
        if (action === 'create') {
            return await crtUser(data)
        }
        if (action === 'edit') {
            if (!userSelected) return
            await updUser(userSelected.id, data)
            setUserSelected(null, 'none')
            setOpen(false)
            toast.success('Usuario actualizado correctamente')
            return
        }
        if (action === 'delete') {
            if (!userSelected) return
            await delUser(userSelected.id)
            toast.success('Usuario eliminado correctamente')
        }
    })

    useEffect(() => {
        setValue('documentType', watch('role') === 'professor' ? ProfessorDocumentType.DNI : undefined)
        return () => {
            setValue('documentType', undefined)
        }
    }, [watch('role')])
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
                            <p>¿Estás seguro de eliminar este usuario?</p>
                        </div>
                    )}
                    {action !== 'delete' && (
                        <div className="py-6 flex flex-col gap-2">
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
                                <Label htmlFor="title" className="text-right">
                                    Password
                                </Label>
                                <Input
                                    id="title"
                                    value={watch('password')}
                                    disabled={loading}
                                    className="col-span-3"
                                    placeholder="Password"
                                    {...register('password', {
                                        required: {
                                            value: action === 'create',
                                            message: 'Password es requerido.'
                                        },
                                    })}
                                />
                                {errors.password &&
                                    <span className="text-red-600 text-xs">{errors.password.message}</span>
                                }
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="title" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="title"
                                    value={watch('email')}
                                    disabled={loading}
                                    className="col-span-3"
                                    placeholder="Email"
                                    {...register('email', {
                                        required: {
                                            value: true,
                                            message: 'Email es requerido.'
                                        },
                                        maxLength: {
                                            value: 80,
                                            message: 'Email debe tener 80 caracteres como máximo.'
                                        }
                                    })}
                                />
                                {errors.email &&
                                    <span className="text-red-600 text-xs">{errors.email.message}</span>
                                }
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="picture">Cargar Imagen</Label>
                                {loading ? (
                                    <div className="w-full flex justify-center">
                                        Subiendo imagen...
                                        <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500'></div>
                                    </div>
                                ) : ''}
                                {watch('image') && (
                                    <img src={watch('image')!} alt="Imagen" className="h-36 w-auto object-cover transition-all hover:scale-105" />
                                )}
                                <Input disabled={loading} id="picture" type="file" name="media" onChange={handleOnChangeImageInput} />
                                <Input
                                    disabled={loading}
                                    value={watch('image') || ''}
                                    className="hidden"
                                    {...register('image', {
                                        required: {
                                            value: true,
                                            message: 'Imagen es requerida.'
                                        },
                                    })}
                                />
                                {errors.image &&
                                    <span className="text-red-600 text-xs">{errors.image.message}</span>
                                }
                            </div>
                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="podcastUrl" className="text-right">
                                    Rol
                                </Label>
                                <Select
                                    options={
                                        Object.values(RoleUserSelect).map((modality) => ({
                                            value: modality,
                                            label: MapRoleUser[modality]
                                        }))
                                    }
                                    {...register("role", {
                                        required: {
                                            value: true,
                                            message: "Escuela es requerida.",
                                        },
                                    })}
                                    value={watch('role') as any &&
                                    {
                                        value: watch('role'),
                                        label: MapRoleUser[watch('role') as RoleUserSelect]
                                    }
                                    }
                                    isDisabled={loading}
                                    className="w-full col-span-3 z-[99]"
                                    onChange={(option) => {
                                        setValue('role', option?.value as string)
                                        setError('role', {
                                            type: 'disabled'
                                        })
                                    }}
                                />
                                {errors.role &&
                                    <span className="text-red-600 text-xs">{errors.role.message}</span>
                                }
                            </div>

                            {/* Is Professor */}
                            {watch('role') === 'professor' && (
                                <>
                                    <div className="grid w-full gap-1.5">
                                        <Label>
                                            Número de DNI
                                        </Label>
                                        <Input
                                            type="text" placeholder="Ingresa Número de DNI"
                                            disabled={loading}
                                            {...register('documentNumber', {
                                                required: {
                                                    value: watch('role') === 'professor',
                                                    message: 'Número de DNI requerido'
                                                },
                                                pattern: {
                                                    value: /^[0-9]{8}$/,
                                                    message: 'Número de DNI no válido'
                                                },
                                            })}
                                        />
                                        <span className="text-red-500 text-xs">{errors.documentNumber && (
                                            <>{errors.documentNumber.message}</>
                                        )}</span>
                                    </div>
                                    <div className="grid w-full gap-1.5">
                                        <Label>
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
                                                    value: watch('role') === 'professor',
                                                    message: "Tipo es requerido.",
                                                },
                                            })}
                                            value={watch('employmentType') as any &&
                                            {
                                                value: watch('employmentType'),
                                                label: MapProfessorEmploymentType[watch('employmentType') || ProfessorEmploymentType.FULL_TIME]
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
                                    <div className="grid w-full gap-1.5">
                                        <div className='flex gap-1 items-center'>
                                            <Label htmlFor="schoolId" className="">
                                                Escuela
                                            </Label>
                                            {loadSchools && (
                                                <Loader size={14} className="animate-spin text-blue-600" />
                                            )}
                                        </div>
                                        <Select
                                            options={
                                                schools.map((school) => ({
                                                    value: school.id,
                                                    label: school.name
                                                }))
                                            }
                                            {...register("schoolId", {
                                                required: {
                                                    value: watch('role') === 'professor',
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
                                            isDisabled={loading || loadSchools}
                                            className="w-full z-[99]"
                                            onChange={(option) => {
                                                setValue('schoolId', option.value)
                                                setError('schoolId', {
                                                    type: 'disabled'
                                                })
                                            }}
                                        />
                                        <span className="text-red-500 text-xs">{errors.schoolId && (
                                            <>{errors.schoolId.message}</>
                                        )}</span>
                                    </div>
                                </>
                            )}
                            {/* End Is Professor */}

                            <div className="flex flex-col items-start gap-2">
                                <Label htmlFor="countries" className="text-right">
                                    País
                                </Label>
                                <Select
                                    options={
                                        countries.map((country) => ({
                                            value: country.code,
                                            label: country.name
                                        }))
                                    }
                                    {...register("countryCode", {
                                        required: {
                                            value: true,
                                            message: "País es requerido.",
                                        },
                                    })}
                                    value={watch('countryCode') as any &&
                                        countries.find((c) => c.code === watch('countryCode')) &&
                                    {
                                        value: watch('countryCode'),
                                        // label: countries.find((c) => c.code === watch('countryCode'))?.name,
                                        label: (
                                            <span className="text-bold flex gap-1">
                                                <img src={countries.find((c) => c.code === watch('countryCode'))?.icon} alt={countries.find((c) => c.code === watch('countryCode'))?.name} className="w-6 h-6" />
                                                {countries.find((c) => c.code === watch('countryCode'))?.name}
                                            </span>
                                        ),
                                    }
                                    }
                                    isDisabled={loading}
                                    className="w-full col-span-3 z-[98]"
                                    onChange={(option) => {
                                        setValue('countryCode', option?.value as string)
                                        setError('countryCode', {
                                            type: 'disabled'
                                        })
                                    }}
                                />
                                {errors.countryCode &&
                                    <span className="text-red-600 text-xs">{errors.countryCode.message}</span>
                                }
                            </div>

                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            disabled={loading}
                            type="submit"
                            className="bg-uss-green-700 hover:bg-uss-green-800 text-white font-bold py-2 px-4 rounded duration-300">
                            {action === 'delete' ? 'Eliminar' : 'Guardar'}
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

export default ModalUser