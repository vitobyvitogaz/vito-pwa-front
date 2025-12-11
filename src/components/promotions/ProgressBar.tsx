// src/components/promotions/ProgressBar.tsx
interface ProgressBarProps {
  percentage: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
      <div
        className="bg-gradient-to-r from-orange-500 to-pink-600 h-4 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, percentage)}%` }}
      />
    </div>
  )
}