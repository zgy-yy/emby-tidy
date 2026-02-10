import { get, post } from '@/net'

const API_BASE = '/watch'

/**
 * 监听目录
 */
export async function watchDirectory(path: string) {
  const response = await post(`${API_BASE}/dir`, { path })
  return response.data
}

/**
 * 获取所有监听的目录
 */
export async function getWatchDirectories(): Promise<string[]> {
  const response = await get(`${API_BASE}/all`)
  const data = response.data
  return Array.isArray(data) ? data : []
}

/**
 * 取消监听目录
 */
export async function unwatchDirectory(path: string) {
  const response = await post(`${API_BASE}/unwatch`, { path })
  return response.data
}
