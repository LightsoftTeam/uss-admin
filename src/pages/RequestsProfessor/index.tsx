import ModalUser from "./components/ModalRequestProfessor"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User } from "@/services/users"
import { DataTable } from "@/components/DataTable/DataTable"
import { ExtraColumn } from "@/types/columns"
import { RequestsProffesorStore } from "./store/UserStore"
import { Check, Eye, Trash } from "lucide-react"

const columns = [
    {
        field: "name",
        headerName: "Nombre",
        className: "w-1/3 font-bold"
    },
    {
        field: "email",
        headerName: "Email",
        className: ""
    },
    {
        field: "role",
        headerName: "Rol",
        className: ""
    },
];

function RequestsProffesorPage() {
    const { open, getData, tableUsers, loading, setUserSelected } = RequestsProffesorStore()
    useEffect(() => {
        getData();
    }, [])

    const extraColumns: ExtraColumn[] = [
        {
            headerName: 'Acciones',
            field: 'actions',
            render: (row: User) => {
                return (
                    <div className="w-fit flex flex-row gap-1 items-center">
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent border border-blue-500 rounded-md h-7 w-7'
                            onClick={() => setUserSelected(row, 'view')}>
                            <Eye className="text-blue-600 h-5 w-5" />
                        </Button>
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent border border-green-500 rounded-md h-7 w-7'
                            onClick={async () => setUserSelected(row, 'accept')}>
                            <Check className="text-green-600 h-5 w-5" />
                        </Button>
                        <Button className='bg-transparent shadow-none p-0 hover:bg-transparent border border-red-500 rounded-md h-7 w-7'
                            onClick={async () => setUserSelected(row, 'reject')}>
                            <Trash className="text-red-600 h-5 w-5" />
                        </Button>
                    </div>
                )
            }
        }
    ]


    return (
        <main className="flex flex-col gap-4 p-4">
            <section className="">
                <h1 className="text-2xl font-semibold">Listado de Solicitudes para Docente</h1>
            </section>

            <section className="flex flex-row justify-between items-center gap-2">
                <div className="invisible">
                    Filtros
                </div>
                <div>
                    {/* <Button
                        onClick={() => {
                            setUserSelected(null, 'create')
                            setOpen(true)
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Nuevo Usuario
                    </Button> */}
                    {open && <ModalUser />}
                </div>
            </section>
            <div>
                <DataTable
                    columns={columns}
                    data={tableUsers}
                    isLoading={loading}
                    extraColumns={extraColumns}
                />
            </div>
            <section>

            </section>
        </main>
    )
}

export default RequestsProffesorPage