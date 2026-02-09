import { get, post, del } from '@/net'

const API_BASE = '/file'

export interface FileTree {
  name: string
  path: string
  type: 'file' | 'directory'
  children: FileTree[]
}

export interface ScanResult {
  success: boolean
  fileTree: FileTree
  directory: string
  message: string
  count?: number
}

export interface TidyChunk {
  node: string
  data: Array<{
    type: string
    name: string
    content: string
  }>
}

/**
 * 扫描目录
 */
export async function scanDirectory(directory: string, recursive: boolean = true): Promise<ScanResult> {
  const response = await get(`${API_BASE}/scan`, { directory, recursive })
  return response.data
}

/**
 * 删除文件
 */
export async function deleteFile(path: string) {
  const response = await del(`${API_BASE}`, { path })
  return response.data
}

/**
 * 移动文件
 */
export async function moveFile(filePath: string, targetDirectory: string) {
  const response = await post(`${API_BASE}/move`, { filePath, targetDirectory })
  return response.data
}

/**
 * 重命名文件
 */
export async function renameFile(filePath: string, newName: string) {
  const response = await post(`${API_BASE}/rename`, { filePath, newName })
  return response.data
}

/**
 * 整理文件（流式返回）
 */
export async function tidyFile(
  path: string,
  onChunk: (chunk: TidyChunk) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): Promise<void> {
  try {
    // 使用 /api 前缀，让 Vite 代理到后端
    const response = await fetch(`/api${API_BASE}/tidy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onComplete?.()
        break
      }

      // 解码数据并添加到缓冲区
      buffer += decoder.decode(value, { stream: true })

      // 处理完整的行（NDJSON 格式：每行一个 JSON）
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行

      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk: TidyChunk = JSON.parse(line)
            onChunk(chunk)
          } catch (e) {
            console.error('Failed to parse chunk:', line, e)
          }
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)))
  }
}
