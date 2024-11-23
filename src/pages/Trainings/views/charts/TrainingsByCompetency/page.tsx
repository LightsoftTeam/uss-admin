import { getTrainingByCompetency, TrainingsByCompetency } from "@/services/reports"
import React, { useRef, useState } from "react"
import { CompetencyTrainingDataTable } from "./table"
import { columns } from "./columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SemesterStore } from "@/pages/Semesters/store/SemesterStore"
import { Semester } from "@/services/semesters"
import { DownloadButton } from "@/components/DataTable/DownloadButton"
import { Exports } from "@/utils/exports"
import LoaderSemeter from "@/pages/Trainings/components/loaders/loader-semesters"
import LoaderReport from "@/pages/Trainings/components/loaders/loader-report"

function TrainingsByCompetencyPage() {
  const [data, setData] = useState<TrainingsByCompetency[]>([])
  const [loading, setLoading] = React.useState(false)
  const { semesters, loading: loadingSemesters } = SemesterStore()
  const [semesterSelected, setSemesterSelected] = React.useState<Semester>()
  const tableRef = useRef<HTMLTableElement | null>(null);

  const handleSelectSemester = async (semesterId: string) => {
    setLoading(true)
    setSemesterSelected(semesters.find((semester) => semester.id === semesterId))
    const data = await getTrainingByCompetency(semesterId)
    setData(data)
    setLoading(false)
  }

  if (loadingSemesters) {
    return <LoaderSemeter />
  }

  if (loading) {
    return <LoaderReport />
  }

  return (
    <Card className="flex flex-col w-full h-full">
      <CardHeader className="items-center pb-0 text-center">
        <CardTitle>Relación de capacitaciones generales y específicas programadas y su eficacia según su ejecución.</CardTitle>
        <CardDescription className="flex gap-4 items-center justify-center w-full">
          <select
            value={semesterSelected?.id}
            className="p-2 border border-gray-300 rounded-md"
            onChange={(e) => handleSelectSemester(e.target.value)}
          >
            <option>
              Seleccione un semestre</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
          <DownloadButton disabled={data.length < 1} onClick={() => {
            if (!tableRef.current || data.length < 1) return;
            Exports.tableToBook(tableRef.current, 'lista-docentes')
          }} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 pt-2">
        <div ref={tableRef}>
          <CompetencyTrainingDataTable columns={columns} data={data} />
        </div>
      </CardContent>
    </Card>
  )
}

export default TrainingsByCompetencyPage