import ModalProfessor from "./components/ModalProfessor"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Professor } from "@/services/professors"
import { DataTable } from "@/components/DataTable/DataTable"
import { ExtraColumn } from "@/types/columns"
import { DeleteIcon, EditIcon } from "@/components/DataTable/TableIcons"
import { ProfessorStore } from "./store/ProfessorStore"

const columns = [
    {
        field: "name",
        headerName: "Nombres",
        className: ""
    },
    {
        field: "documentNumber",
        headerName: "Nº Documento",
        className: ""
    },
    {
        field: "employmentType",
        headerName: "Tipo",
        className: ""
    },
    {
        field: "email",
        headerName: "Email",
        className: ""
    },
];

function ProfessorsPage() {
    const { open, setOpen, getData, tableProfessors: tableAuthorities, loading, setProfessorSelected } = ProfessorStore()
    useEffect(() => {
        getData();
    }, [])

    const extraColumns: ExtraColumn[] = [
        {
            headerName: 'Acciones',
            field: 'actions',
            render: (row: Professor) => {
                return (
                    <div className="w-fit flex flex-row gap-1">
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent'
                            onClick={() => setProfessorSelected(row, 'edit')}>
                            <EditIcon />
                        </Button>
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent'
                            onClick={async () => setProfessorSelected(row, 'delete')}>
                            <DeleteIcon />
                        </Button>
                    </div>
                )
            }
        }
    ]


    return (
        <main className="flex flex-col gap-4 p-4">
            <section className="">
                <h1 className="text-2xl font-semibold">Listado de Profesores</h1>
            </section>

            <section className="flex flex-row justify-between items-center gap-2">
                <div className="invisible">
                    Filtros
                </div>
                <div>
                    <Button
                        onClick={() => {
                            setProfessorSelected(null, 'create')
                            setOpen(true)
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Nuevo Profesor
                    </Button>
                    {open && <ModalProfessor />}
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

export default ProfessorsPage