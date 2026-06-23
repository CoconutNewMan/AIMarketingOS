export interface AppUser {
  id: string
  email: string
  tier: 'free' | 'pro' | 'enterprise'
  token_balance: number
  max_files: number
  is_admin: boolean
  created_at: string
}

export interface File {
  id: string
  user_id: string
  name: string
  industry: string | null
  direction: string | null
  created_at: string
}

export interface AnalysisContent {
  source: 'url' | 'manual'
  input_url?: string
  raw_text: string
  analysis: string
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
}

export interface CopyContent {
  analysis_id: string
  versions: {
    title: [string, string]
    body: [string, string]
    cta: [string, string]
  }
}

export interface LandingContent {
  copy_id: string
  html: string
}

export interface FileData {
  id: string
  file_id: string
  data_type: 'page_analysis' | 'copy' | 'landing_page'
  content: AnalysisContent | CopyContent | LandingContent
  created_at: string
}

export interface AdminUser extends AppUser {
  files_count?: number
}
