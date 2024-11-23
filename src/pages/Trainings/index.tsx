import ModalTraining from "./components/ModalTraining"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Training } from "@/services/trainings"
import { DataTable } from "@/components/DataTable/DataTable"
import { ExtraColumn } from "@/types/columns"
import { DeleteIcon, EditIcon } from "@/components/DataTable/TableIcons"
import { TrainingStore } from "./store/TrainingStore"
import { BookIcon, LoaderIcon, QrCode } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { SemesterStore } from "../Semesters/store/SemesterStore"
import { SchoolStore } from "../Schools/store/SchoolStore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { uploadFile } from "@/services/posts"
import { toast } from "sonner"

const columns = [
    {
        field: "code",
        headerName: "Código",
        className: ""
    },
    {
        field: "name",
        headerName: "Nombres",
        className: ""
    },
    {
        field: "organizer",
        headerName: "Organizador",
        className: ""
    },
    {
        field: "competency",
        headerName: "Competencia",
        className: ""
    },
    {
        field: "status",
        headerName: "Status",
        className: ""
    },
    {
        field: "type",
        headerName: "Tipo",
        className: ""
    },
    {
        field: "modality",
        headerName: "Modalidad",
        className: ""
    },
];

function TrainingsPage() {
    const { open, setOpen, getData, tableTrainings: tableAuthorities, loading, setTrainingSelected, resources, updateResource } = TrainingStore()
    const { getData: getSemesters } = SemesterStore()
    const { getData: getSchools } = SchoolStore()
    useEffect(() => {
        (
            async () => {
                await getSemesters()
                await getData()
                await getSchools()
            }
        )()
    }, [])
    const navigate = useNavigate()

    const extraColumns: ExtraColumn[] = [
        {
            headerName: 'Acciones',
            field: 'actions',
            render: (row: Training) => {
                return (
                    <div className="w-fit flex flex-row gap-1">
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent'
                            onClick={() => setTrainingSelected(row, 'edit')}>
                            <EditIcon />
                        </Button>
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent'
                            onClick={() => setTrainingSelected(row, 'list')}>
                            <BookIcon className="text-blue-400 p-1 border-[1px] border-blue-500  h-[30px] w-[30px] rounded-md" />
                        </Button>
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent'
                            onClick={async () => setTrainingSelected(row, 'delete')}>
                            <DeleteIcon />
                        </Button>
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent'
                            onClick={async () => {setTrainingSelected(row, 'view')}}>
                            <QrCode className="text-black border p-1 rounded-md border-black h-7 w-7" />
                        </Button>
                    </div>
                )
            }
        }
    ]
    const bandImgRef = useRef<HTMLInputElement>(null)
    const bgImgRef = useRef<HTMLInputElement>(null)
    const [loadResource, setLoadResource] = useState(false)
    return (
        <main className="flex flex-col gap-4 p-4">
            <section className="flex flex-row justify-between">
                <h1 className="text-2xl font-semibold">Listado de Capacitaciones</h1>

                <div className="w-fit px-4 flex gap-4 flex-col">
                    <h1 className="text-2xl font-semibold">Recursos credencial virtual</h1>
                    <div className="flex gap-4 justify-end">
                        <div>
                            <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img src={resources.band} alt=""
                                            className="h-16 w-12 object-contain cursor-pointer transform hover:scale-125 duration-300"
                                            onClick={() => bandImgRef.current?.click()}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Band (Tira) <br />Dimensiones: 364 × 88 px <br />Formato: PNG</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <input type="file" className="hidden" ref={bandImgRef}
                                disabled={loadResource}
                                onChange={async (e) => {
                                    const file = e.target.files![0];
                                    try {
                                        setLoadResource(true);
                                        const { url } = await uploadFile(file);
                                        await updateResource('band', url);
                                    } catch (error) {
                                        toast.error('Ocurrió un error inesperado, intente nuevamente');
                                    } finally {
                                        setLoadResource(false);
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img src={resources.bg} alt=""
                                            className="h-16 w-12 object-contain cursor-pointer transform hover:scale-125 duration-300"
                                            onClick={() => bgImgRef.current?.click()}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Fondo <br />Dimensiones: 456 × 644 px <br />Formato: PNG</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <input type="file" className="hidden" ref={bgImgRef}
                                disabled={loadResource}
                                onChange={async (e) => {
                                    const file = e.target.files![0];
                                    try {
                                        setLoadResource(true);
                                        const { url } = await uploadFile(file);
                                        await updateResource('bg', url);
                                    } catch (error) {
                                        toast.error('Ocurrió un error inesperado, intente nuevamente');
                                    } finally {
                                        setLoadResource(false);
                                    }
                                }}
                            />
                        </div>
                        {loadResource && <div className="animate-spin w-fit h-full flex items-center justify-center">
                            <LoaderIcon />
                        </div>}
                    </div>
                </div>
            </section>

            <section className="flex flex-row justify-between items-center gap-2">
                <div className="invisible">
                    Filtros
                </div>
                <div>
                    <Button
                        onClick={() => {
                            setTrainingSelected(null, 'create')
                            setOpen(true)
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Nueva Capacitación
                    </Button>
                    <Button
                        onClick={() => {
                            navigate('/capacitaciones-documento')
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ml-1 rounded">Buscar por Documento
                    </Button>
                    {open && <ModalTraining />}
                </div>
            </section>
            <div>
                <DataTable
                    columns={columns}
                    data={tableAuthorities}
                    isLoading={loading}
                    extraColumns={extraColumns}
                />
            </div>
            <section>

            </section>
        </main>
    )
}

export default TrainingsPage