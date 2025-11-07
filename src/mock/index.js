/**
 * Mock 数据统一导出
 */

// 预约相关
export * from './appointment'

// 用户相关
export * from './user'

/**
 * Mock 数据配置
 */
export const mockConfig = {
  // 是否启用 Mock 数据（开发时true，对接后端后改为false）
  enabled: true,
  
  
  delay: 0  
}

/**
 * 模拟异步请求的延迟
 */
export const mockDelay = (ms = mockConfig.delay) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

