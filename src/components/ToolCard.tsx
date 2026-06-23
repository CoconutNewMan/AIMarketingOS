import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  description: string
  icon: string
  href: string
  comingSoon?: boolean
}

export default function ToolCard({ title, description, icon, href, comingSoon }: Props) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => !comingSoon && navigate(href)}
      className={`bg-white rounded-xl border p-5 transition-all ${
        comingSoon
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md hover:border-blue-300 cursor-pointer'
      }`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      {comingSoon && (
        <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">即将推出</span>
      )}
    </div>
  )
}
