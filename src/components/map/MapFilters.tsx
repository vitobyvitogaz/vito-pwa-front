'use client'

interface MapFiltersProps {
  filters: {
    type: string
    services: string[]
  }
  onChange: (filters: any) => void
  className?: string
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  filters,
  onChange,
  className,
}) => {
  return (
    <div className={className}>
      <select
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        className="px-4 py-2 rounded-lg border"
      >
        <option value="all">Tous</option>
        <option value="official">Points officiels</option>
        <option value="partner">Partenaires</option>
      </select>
    </div>
  )
}