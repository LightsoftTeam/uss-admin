import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RequestsProffesorStore } from "../store/UserStore";
import { MapProfessorDocumentType, MapProfessorEmploymentType } from "@/services/professors";

function ModalUser() {
    const { setOpen, action, loading, open, userSelected, changeRoleRequest } = RequestsProffesorStore()

    const title = () => {
        switch (action) {
            case 'view':
                return 'Ver Datos de Profesor'
            case 'accept':
                return 'Aceptar Solicitud'
            case 'reject':
                return 'Denegar Solicitud'
            default:
                return 'Solicitud de Profesor'
        }
    };

    const {
        handleSubmit,
        watch,
        setValue,
    } = useForm<{
        action: 'accept' | 'reject'
    }>({
        defaultValues: {
            action: undefined,
        }
    })

    const onSubmit = handleSubmit(async (data, e) => {
        (e as any).preventDefault();
        if (action === 'accept' || action === 'reject') {
            return await changeRoleRequest(data.action)
        }
    })

    useEffect(() => {
        if (!action) return
        if (action === 'accept') return setValue('action', 'accept')
        if (action === 'reject') return setValue('action', 'reject')
    }, [action])


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
                    {action === 'view' && userSelected && (
                        <div>
                            <div className="flex flex-row gap-2 items-center">
                                <img
                                    className="w-12 h-12 rounded-lg object-cover"
                                    src={userSelected?.image || "https://avatars.githubusercontent.com/u/93000567"}
                                    alt={userSelected?.name}
                                />
                                <span className="text-xs font-semibold">{userSelected?.name}</span>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <span className="text-xs font-semibold">{userSelected?.email}</span>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <span className="text-xs font-semibold">{MapProfessorDocumentType[userSelected?.documentType!]}</span>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <span className="text-xs font-semibold">{userSelected?.documentNumber}</span>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <span className="text-xs font-semibold">{MapProfessorEmploymentType[userSelected?.employmentType!]}</span>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <span className="text-xs font-semibold">{userSelected?.school?.name}</span>
                            </div>
                        </div>
                    )}
                    {action !== 'view' && (
                        <div>
                            <p>
                                {action === 'accept' ? '¿Estás seguro de aceptar la solicitud?' : '¿Estás seguro de rechazar la solicitud?'}
                            </p>
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