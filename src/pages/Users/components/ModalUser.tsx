import { useForm } from "react-hook-form";
import { UserBodyRequest } from "@/services/users";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import Select from 'react-select';
import { toast } from "sonner";
import { uploadFile } from "@/services/posts";
import { UserStore } from "../store/UserStore";
import { Input } from "@/components/ui/input";

function ModalUser() {
    const { setOpen, action, loading, open, userSelected, setUserSelected, crtUser, updUser, setLoading } = UserStore()

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
            role: 'author',
        }
    })
    useEffect(() => {
        if (action === 'create') {
            return reset()
        }
        if (action === 'edit') {
            if (!userSelected) return
            reset({
                email: userSelected.email,
                image: userSelected.image,
                name: userSelected.name,
                role: userSelected.role,
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
            toast('User actualizado correctamente')
            return
        }
        if (action === 'delete') {
            if (!userSelected) return
            // return await delPost(idUserSelected.id)
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
                                    value: true,
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
                                ['author']
                                    .map(role => ({ value: role, label: role }))
                            }
                            {...register("role", {
                                required: {
                                    value: true,
                                    message: "Autor es requerido.",
                                },
                            })}
                            value={watch('role') as any &&
                                ['author'].map(post =>
                                    ({ value: post, label: post }))
                                    .find(
                                        (item) => item.value === watch('role')
                                    )}
                            isDisabled={loading}
                            className="w-full col-span-3 z-[100]"
                            onChange={(option) => {
                                setValue('role', option.value)
                                setError('role', {
                                    type: 'disabled'
                                })
                            }}
                        />
                        {errors.role &&
                            <span className="text-red-600 text-xs">{errors.role.message}</span>
                        }
                    </div>
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

export default ModalUser