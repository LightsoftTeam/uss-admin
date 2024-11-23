"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useMemo, useRef } from "react"
import { ProfessorsResume, SchoolStatitic } from "@/services/reports"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    resumenProffesors: any[]
}

export function DataTableAssistanceBySchool<TData, TValue>({
    columns,
    data,
    resumenProffesors
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const getTotalCountProffesors = useMemo(() => {
        return (data as SchoolStatitic[]).reduce((acc, curr) => acc + curr.professorsCount, 0)
    }, [data])

    const getTotalCountProffesorsAttended = useMemo(() => {
        return (data as SchoolStatitic[]).reduce((acc, curr) => acc + curr.attended, 0)
    }, [data])

    const getTotalCountProffesorsPending = useMemo(() => {
        return (data as SchoolStatitic[]).reduce((acc, curr) => acc + curr.pending, 0)
    }, [data])

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead colSpan={2}>
                            {" "}
                        </TableHead>
                        <TableHead colSpan={2} className="text-center">
                            Docentes que participaron
                        </TableHead>
                        <TableHead colSpan={2} className="text-center">
                            Docentes que no participaron
                        </TableHead>
                        <TableHead colSpan={2} className="text-center">
                            Total de docentes
                        </TableHead>
                    </TableRow>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        <>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>

                            ))}
                            <TableRow>
                                <TableCell colSpan={2} className="text-center">
                                    TOTAL
                                </TableCell>
                                <TableCell>
                                    {getTotalCountProffesorsAttended}
                                </TableCell>
                                <TableCell>
                                    {getTotalCountProffesors > 0 ? `${((getTotalCountProffesorsAttended / getTotalCountProffesors) * 100).toFixed(2)}%` : "0%"}
                                </TableCell>
                                <TableCell>
                                    {getTotalCountProffesorsPending}
                                </TableCell>
                                <TableCell>
                                    {getTotalCountProffesors > 0 ? `${((getTotalCountProffesorsPending / getTotalCountProffesors) * 100).toFixed(2)}%` : "0%"}
                                </TableCell>
                                <TableCell>
                                    {/* <Button variant={"outline"}> */}
                                    <ListProffesors data={resumenProffesors} total={getTotalCountProffesors} />
                                    {/* </Button> */}
                                </TableCell>
                                <TableCell>
                                    100%
                                </TableCell>
                            </TableRow>
                        </>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { TableListProffesors } from "./ListProffesors/table"
import { columns } from "./ListProffesors/columns"
import { DownloadButton } from "@/components/DataTable/DownloadButton"
import { Exports } from "@/utils/exports"

function ListProffesors({
    total, data
}: { total: number, data: ProfessorsResume[] }) {

    const tableRef = useRef<HTMLTableElement | null>(null);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{total}</Button>
            </DialogTrigger>
            <DialogContent className="min-w-max overflow-auto overflow-y-auto overflow-x-auto h-full">
                <DialogHeader>
                    <DialogTitle>Lista Docentes</DialogTitle>
                    <DialogDescription>
                        {/* Make changes to your profile here. Click save when you're done. */}
                        <DownloadButton disabled={data.length < 1} onClick={() => {
                            if (!tableRef.current || data.length < 1) return;
                            Exports.tableToBook(tableRef.current, 'lista-docentes')
                        }} />
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4" ref={tableRef}>
                    <TableListProffesors data={data} columns={columns} />
                </div>
                <DialogFooter>
                    {/* <Button type="submit">Save changes</Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
