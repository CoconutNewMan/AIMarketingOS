import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { type File } from '../types'

export function useFiles(userId: string | undefined) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setFiles(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  async function createFile(name: string, industry: string, direction: string) {
    const { data, error } = await supabase
      .from('files')
      .insert({ user_id: userId, name, industry, direction })
      .select()
      .single()
    if (error) throw error
    setFiles((prev) => [data, ...prev])
    return data
  }

  async function deleteFile(id: string) {
    const { error } = await supabase.from('files').delete().eq('id', id)
    if (error) throw error
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return { files, loading, createFile, deleteFile, refetch: fetchFiles }
}
