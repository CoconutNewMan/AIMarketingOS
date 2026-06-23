import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAdmin } from '../_shared/auth.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { supabase } = await verifyAdmin(req)
    const url = new URL(req.url)
    const segments = url.pathname.replace('/admin/', '').split('/')
    const resource = segments[0]
    const resourceId = segments[1]

    // GET /admin/stats
    if (resource === 'stats' && req.method === 'GET') {
      const [{ count: userCount }, { count: fileCount }, { count: callCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('files').select('*', { count: 'exact', head: true }),
        supabase.from('file_data').select('*', { count: 'exact', head: true }),
      ])
      return new Response(JSON.stringify({ userCount, fileCount, callCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /admin/users
    if (resource === 'users' && req.method === 'GET' && !resourceId) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PATCH /admin/users/:id
    if (resource === 'users' && req.method === 'PATCH' && resourceId) {
      const updates = await req.json()
      const allowed = ['tier', 'token_balance', 'is_admin', 'max_files']
      const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))
      const { data, error } = await supabase.from('users').update(filtered).eq('id', resourceId).select().single()
      if (error) throw new Error(error.message)
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE /admin/users/:id
    if (resource === 'users' && req.method === 'DELETE' && resourceId) {
      const { error: deleteError } = await supabase.from('users').delete().eq('id', resourceId)
      if (deleteError) throw new Error(deleteError.message)
      await supabase.auth.admin.deleteUser(resourceId)
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /admin/files
    if (resource === 'files' && req.method === 'GET' && !resourceId) {
      const { data } = await supabase
        .from('files')
        .select('*, users(email)')
        .order('created_at', { ascending: false })
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE /admin/files/:id
    if (resource === 'files' && req.method === 'DELETE' && resourceId) {
      await supabase.from('files').delete().eq('id', resourceId)
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /admin/orders
    if (resource === 'orders' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(email)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    if (err instanceof Response) return err
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
