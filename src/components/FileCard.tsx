import { useNavigate } from 'react-router-dom'
import { type File } from '../types'

interface Props {
  file: File
  onDelete: (id: string) => void
}

export default function FileCard({ file, onDelete }: Props) {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-start hover:shadow-md transition-shadow">
      <div
        className="cursor-pointer flex-1"
        onClick={() => navigate(`/file/${file.id}`)}
      >
        <h3 className="font-semibold text-gray-900">{file.name}</h3>
        {file.industry && <p className="text-sm text-gray-500 mt-1">{file.industry}</p>}
        {file.direction && <p className="text-sm text-gray-400 mt-0.5">{file.direction}</p>}
      </div>
      <button
        onClick={() => {
          if (confirm(`确定删除「${file.name}」？`)) onDelete(file.id)
        }}
        className="text-gray-400 hover:text-red-500 transition-colors ml-4 text-sm"
      >
        删除
      </button>
    </div>
  )
}
