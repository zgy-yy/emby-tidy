import axios from 'axios'

/** 与后端统一的异常响应格式 */
export interface ApiErrorBody {
  success: false
  statusCode: number
  error: string
  message: string
}

const axiosInstance = axios.create({
  baseURL: 'api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 统一处理接口错误：提取后端返回的 message，以 Error 形式抛出便于页面展示
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data as ApiErrorBody | undefined
    const message =
      data?.message ??
      err.message ??
      `请求失败${err.response?.status ? ` (${err.response.status})` : ''}`
    return Promise.reject(new Error(message))
  },
)

function get(url: string, params?: any) {
  return axiosInstance.get(url, { params })
}

function post(url: string, data: any) {
    return axiosInstance.post(url, data)
}

function put(url: string, data: any) {
    return axiosInstance.put(url, data)
}

function del(url: string, params?: any) {
    return axiosInstance.delete(url, { params })
}

/** 从 catch 到的 error 中取出用于展示的文案（与后端 message 或网络错误一致） */
export function getApiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export { get, post, put, del }