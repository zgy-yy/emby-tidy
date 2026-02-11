import { post } from '@/net'

/**
 * 请求服务重启（进程退出后由 Docker/进程管理器拉起重启）
 */
export function restartServer() {
  return post('/restart', {})
}
