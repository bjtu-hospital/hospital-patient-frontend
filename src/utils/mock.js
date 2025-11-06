/**
 * 模拟数据工具 - 用于前端开发阶段
 * 
 * 使用方法：
 * import { mockApiCall } from '@/utils/mock'
 * const result = await mockApiCall(mockData, 1000) // 模拟1秒延迟
 */

/**
 * 模拟API调用
 * @param {*} data - 模拟返回的数据
 * @param {Number} delay - 延迟时间(ms)
 * @returns {Promise}
 */
export const mockApiCall = (data, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 0,
        message: 'success',
        data
      })
    }, delay)
  })
}

/**
 * 模拟API错误
 * @param {String} message - 错误信息
 * @param {Number} code - 错误码
 * @param {Number} delay - 延迟时间(ms)
 * @returns {Promise}
 */
export const mockApiError = (message = '操作失败', code = 500, delay = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject({
        code,
        message,
        data: null
      })
    }, delay)
  })
}

/**
 * 生成模拟ID
 * @param {String} prefix - 前缀
 * @returns {String}
 */
export const generateMockId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 生成模拟订单号
 * @returns {String}
 */
export const generateMockOrderNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${year}${month}${day}${random}`
}

