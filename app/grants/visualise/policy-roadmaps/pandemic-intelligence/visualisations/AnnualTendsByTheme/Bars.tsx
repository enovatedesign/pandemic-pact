import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Bar, BarChart, Tooltip } from "recharts"

import { rechartBaseTooltipProps } from "@/app/helpers/tooltip"

import { pandemicIntelligenceThemeColours } from "@/app/helpers/colours"

import { AnnualTrendsChartData, AxisLabel } from "./types"
import { SelectOption } from "@/scripts/types/generate"

import RechartTrendsTooltipContent from "@/app/components/RechartTrendsTooltipContent"

interface Props {
  chartData: AnnualTrendsChartData
  bars: SelectOption[]
  tickFormatter: any
  displayKnownFinancialCommitments: boolean
  yAxisLabel: AxisLabel
}
const Bars = ({
  chartData,
  bars,
  tickFormatter,
  displayKnownFinancialCommitments,
  yAxisLabel
}: Props) => {
  
  return (
    <div className="w-full">  
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
              dataKey="year"
              label={{
                  value: 'Year of Award Start',
                  position: 'bottom',
                  offset: 0,
              }}
          />

          <YAxis
              tickFormatter={tickFormatter}
              label={yAxisLabel}
          />

          <Tooltip
            content={props => (
              <RechartTrendsTooltipContent
                props={props}
                chartData={chartData}
                formatValuesToDollars={displayKnownFinancialCommitments}
              />
            )}
            {...rechartBaseTooltipProps}
          />

          {bars.map(({ value, label }) => (
            <Bar
                key={`bar-${value}`}
                dataKey={label}
                fill={pandemicIntelligenceThemeColours[value]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Bars

// [
//     {
//         "year": "2020",
//         "Pathogen: natural history, transmission and diagnostics": 2193412680.810001,
//         "Animal and environmental research and research on diseases vectors": 150489157.53,
//         "Epidemiological studies": 949214895.9899999,
//         "Clinical characterisation and management": 3214559863.6299996,
//         "Infection prevention and control": 977270908.9799999,
//         "Therapeutics research, development and implementation": 2185059400.8800006,
//         "Vaccines research, development and implementation": 3207581119.0400004,
//         "Research to inform ethical issues": 52149589.82000001,
//         "Policies for public health, disease control & community resilience": 1401780004.9199996,
//         "Secondary impacts of disease, response & control measures": 2138572296.1500008,
//         "Health Systems Research": 722888472.89,
//         "Research on Capacity Strengthening": 213406225.74
//     },
//     {
//         "year": "2021",
//         "Pathogen: natural history, transmission and diagnostics": 1232498475.0399995,
//         "Animal and environmental research and research on diseases vectors": 131352435.29000002,
//         "Epidemiological studies": 556666226.65,
//         "Clinical characterisation and management": 1600902471.0700006,
//         "Infection prevention and control": 61187016.50000001,
//         "Therapeutics research, development and implementation": 762270070.9299998,
//         "Vaccines research, development and implementation": 2311709936.8200006,
//         "Research to inform ethical issues": 11896255.100000001,
//         "Policies for public health, disease control & community resilience": 295906719.77,
//         "Secondary impacts of disease, response & control measures": 1372840469.4100003,
//         "Health Systems Research": 280227773.9499999,
//         "Research on Capacity Strengthening": 26317380.22
//     },
//     {
//         "year": "2022",
//         "Pathogen: natural history, transmission and diagnostics": 672409637.53,
//         "Animal and environmental research and research on diseases vectors": 66044843.83,
//         "Epidemiological studies": 259762203.26999995,
//         "Clinical characterisation and management": 473890236.52999985,
//         "Infection prevention and control": 46985558.65999999,
//         "Therapeutics research, development and implementation": 861027266.71,
//         "Vaccines research, development and implementation": 762323803.85,
//         "Research to inform ethical issues": 15912160.11,
//         "Policies for public health, disease control & community resilience": 254600938.68000004,
//         "Secondary impacts of disease, response & control measures": 369016168.7000001,
//         "Health Systems Research": 219061368.93000007,
//         "Research on Capacity Strengthening": 16436597.690000001
//     },
//     {
//         "year": "2023",
//         "Pathogen: natural history, transmission and diagnostics": 402376455.6199997,
//         "Animal and environmental research and research on diseases vectors": 82220815.40999998,
//         "Epidemiological studies": 226415460.72000006,
//         "Clinical characterisation and management": 248584709.07000008,
//         "Infection prevention and control": 32584808.6,
//         "Therapeutics research, development and implementation": 232111928.66000006,
//         "Vaccines research, development and implementation": 1119100406.3600001,
//         "Research to inform ethical issues": 6931929.8100000005,
//         "Policies for public health, disease control & community resilience": 127090271.58,
//         "Secondary impacts of disease, response & control measures": 671964883.5799999,
//         "Health Systems Research": 246370917.24000004,
//         "Research on Capacity Strengthening": 4250954.85
//     },
//     {
//         "year": "2024",
//         "Pathogen: natural history, transmission and diagnostics": 390434414.8100002,
//         "Animal and environmental research and research on diseases vectors": 100002093.05999994,
//         "Epidemiological studies": 210422150.60999995,
//         "Clinical characterisation and management": 182718536.22999993,
//         "Infection prevention and control": 26164560.15,
//         "Therapeutics research, development and implementation": 294360208.6700001,
//         "Vaccines research, development and implementation": 901316182.02,
//         "Research to inform ethical issues": 2598421.07,
//         "Policies for public health, disease control & community resilience": 104319862.61999999,
//         "Secondary impacts of disease, response & control measures": 97747193.72,
//         "Health Systems Research": 70551216.08,
//         "Research on Capacity Strengthening": 15030421.129999999
//     },
//     {
//         "year": "2025",
//         "Pathogen: natural history, transmission and diagnostics": 158975889.13000003,
//         "Animal and environmental research and research on diseases vectors": 36813502.8,
//         "Epidemiological studies": 91943586.29,
//         "Clinical characterisation and management": 26581470.270000003,
//         "Infection prevention and control": 2204140.67,
//         "Therapeutics research, development and implementation": 66462528.45000001,
//         "Vaccines research, development and implementation": 163017987.68,
//         "Research to inform ethical issues": 8046560.34,
//         "Policies for public health, disease control & community resilience": 36282387.85999999,
//         "Secondary impacts of disease, response & control measures": 35425068.980000004,
//         "Health Systems Research": 30399532.97,
//         "Research on Capacity Strengthening": 1865520
//     },
//     {
//         "year": "2026",
//         "Pathogen: natural history, transmission and diagnostics": 2644244.7,
//         "Animal and environmental research and research on diseases vectors": 0,
//         "Epidemiological studies": 0,
//         "Clinical characterisation and management": 0,
//         "Infection prevention and control": 0,
//         "Therapeutics research, development and implementation": 3987718.46,
//         "Vaccines research, development and implementation": 2938903.16,
//         "Research to inform ethical issues": 0,
//         "Policies for public health, disease control & community resilience": 0,
//         "Secondary impacts of disease, response & control measures": 0,
//         "Health Systems Research": 0,
//         "Research on Capacity Strengthening": 0
//     },
//     {
//         "year": "2027",
//         "Pathogen: natural history, transmission and diagnostics": 1864781.77,
//         "Animal and environmental research and research on diseases vectors": 0,
//         "Epidemiological studies": 0,
//         "Clinical characterisation and management": 0,
//         "Infection prevention and control": 0,
//         "Therapeutics research, development and implementation": 0,
//         "Vaccines research, development and implementation": 1954531.14,
//         "Research to inform ethical issues": 0,
//         "Policies for public health, disease control & community resilience": 0,
//         "Secondary impacts of disease, response & control measures": 0,
//         "Health Systems Research": 0,
//         "Research on Capacity Strengthening": 0
//     }
// ]