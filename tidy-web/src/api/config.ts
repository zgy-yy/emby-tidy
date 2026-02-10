import { get, post } from '@/net'

const API_BASE = '/config'

export interface Config {
  log: {
    level: string
    toFile: boolean
    logDir: string
  }
  ai: {
    model: string
    baseUrl: string
    apiKey: string
    recursionLimit?: number
  }
  tmdb: {
    key: string
  }
  folders: Array<{
    path: string
  }>
}

/**
 * 获取配置
 */
export async function getConfig(): Promise<Config> {
  const response = await get(`${API_BASE}/find`)
  return response.data
}

/**
 * 设置配置
 */
export async function setConfig(config: Config) {
  const response = await post(`${API_BASE}/set`, { config })
  return response.data
}
