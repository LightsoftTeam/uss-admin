"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getProffessorsByEmploymentType, ProffessorsByEmploymentType } from "@/services/reports"
import { Semester } from "@/services/semesters"
import { SemesterStore } from "@/pages/Semesters/store/SemesterStore"
import LoaderSemeter from "../../components/loaders/loader-semesters"
import LoaderReport from "../../components/loaders/loader-report"

let chartDataFullTime = [
  { key: "attended", count: 0, fill: "hsl(var(--chart-1))" },
  { key: "pending", count: 0, fill: "hsl(var(--chart-3))" },
]
let chartDataPartTime = [
  { key: "attended", count: 0, fill: "hsl(var(--chart-1))" },
  { key: "pending", count: 0, fill: "hsl(var(--chart-3))" },
]

const chartConfigFullTime = {
  attended: {
    label: "Participaron",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "No Participaron",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const chartConfigPartTime = {
  attended: {
    label: "Participaron",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "No Participaron",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ProfessorsByEmploymentType() {
  // const totalVisitors = React.useMemo(() => {
  //   return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  // }, [])
  const { semesters, loading: loadingSemesters } = SemesterStore()
  const [loading, setLoading] = React.useState(false)
  const [proffesorsByEmploymentType, setProffesorsByEmploymentType] = React.useState<ProffessorsByEmploymentType | null>(null)
  const [semesterSelected, setSemesterSelected] = React.useState<Semester>()

  const handleSelectSemester = async (semesterId: string) => {
    setLoading(true)
    setSemesterSelected(semesters.find((semester) => semester.id === semesterId))
    const data = await getProffessorsByEmploymentType(semesterId)
    setProffesorsByEmploymentType(data)
    chartDataFullTime = [
      { key: "attended", count: data.full_time.attended, fill: "hsl(var(--chart-1))" },
      { key: "pending", count: data.full_time.pending, fill: "hsl(var(--chart-3))" },
    ]
    chartDataPartTime = [
      { key: "attended", count: data.part_time.attended, fill: "hsl(var(--chart-1))" },
      { key: "pending", count: data.part_time.pending, fill: "hsl(var(--chart-3))" },
    ]
    setLoading(false)
  }

  const totalCountFullTime = React.useMemo(() => {
    return chartDataFullTime.reduce((acc, curr) => acc + curr.count, 0)
  }, [proffesorsByEmploymentType])
  const totalCountPartTime = React.useMemo(() => {
    return chartDataPartTime.reduce((acc, curr) => acc + curr.count, 0)
  }, [proffesorsByEmploymentType])

  if (loadingSemesters) {
    return <LoaderSemeter />
  }

  if (loading) {
    return <LoaderReport />
  }

  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Población Docente según su condición</CardTitle>
        <CardDescription>
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
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {/* Full Time */}
        <h2>Full Time</h2>
        <ChartContainer
          config={chartConfigFullTime}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Pie
              data={chartDataFullTime}
              dataKey="count"
              nameKey="key"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={0}
              label={
                ({ cx, cy, midAngle, innerRadius, outerRadius, fill, payload }) => {
                  const RADIAN = Math.PI / 180
                  const radius = 25 + innerRadius + (outerRadius - innerRadius)
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)
                  // console.log({ payload, totalCountFullTime })
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={fill}
                      fontSize={9}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {((payload.count / totalCountFullTime) * 100).toFixed(2)}%
                    </text>
                  )
                }
              }
            >
              {/* {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))} */}
              {/* <LabelList dataKey="key"
                position="outside"
                fill="#000000"
                stroke="none"
                fontSize={12} /> */}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCountFullTime.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Docentes
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Parti Time */}
        <h2>Part Time</h2>
        <ChartContainer
          config={chartConfigPartTime}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Pie
              data={chartDataPartTime}
              dataKey="count"
              nameKey="key"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={0}
              label={
                ({ cx, cy, midAngle, innerRadius, outerRadius, fill, payload }) => {
                  const RADIAN = Math.PI / 180
                  const radius = 25 + innerRadius + (outerRadius - innerRadius)
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={fill}
                      fontSize={9}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {((payload.count / totalCountPartTime) * 100).toFixed(2)}%
                    </text>
                  )
                }
              }
            >
              {/* {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))} */}
              {/* <LabelList dataKey="key"
                position="outside"
                fill="#000000"
                stroke="none"
                fontSize={12} /> */}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCountPartTime.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Docentes
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  )
}
