export type AnnualTrendsChartDatum = {
  year: string
  [key: string]: string | number
}

export type AnnualTrendsChartData = AnnualTrendsChartDatum[]

export type AxisLabel = {
    value: 'Known Financial Commitments (USD)' | 'Number of grants'
    position: 'left',
    angle: number,
    style: { textAnchor: 'middle' },
    offset: number,
}