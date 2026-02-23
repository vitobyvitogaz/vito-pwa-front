export const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || rows.length === 0) return

  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(';'),
    ...rows.map(row =>
      headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        const str = String(value).replace(/"/g, '""')
        return str.includes(';') || str.includes('\n') || str.includes('"') ? `"${str}"` : str
      }).join(';')
    )
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}