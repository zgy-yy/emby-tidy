/**
 * 统一异常响应格式，所有接口异常均返回此结构
 */
export interface ExceptionResponseDto {
  success: false;
  statusCode: number;
  error: string;
  message: string;
}
