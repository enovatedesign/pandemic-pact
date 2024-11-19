import { ReactNode } from "react";

export interface ChartProps {
    data: any[]
    categories: { value: string; label: string }[]
    showingAllResearchCategories: boolean
    imageExportLegend: ReactNode
}