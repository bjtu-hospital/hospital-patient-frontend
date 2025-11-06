/**
 * 统一请求封装 - uniapp 版本
 * 参考管理端 axios.js 的设计
 */

const BASE_URL = 'http://localhost:8000' // 开发环境
// const BASE_URL = 'https://api.bjtu-hospital.com' // 生产环境

/**
 * 请求拦截器
 */
const requestInterceptor = (config) => {
  // 从本地存储获取 token
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  return config
}

/**
 * 响应拦截器
 */
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  // 请求成功
  if (statusCode === 200) {
    // 统一处理后端返回的数据结构
    // 假设后端返回格式为 { code: 0, data: {}, message: '' }
    if (data.code === 0 || data.success) {
      return data.data || data
    } else {
      // 业务错误
      const errorMsg = data.message || '操作失败'
      uni.showToast({
        title: errorMsg,
        icon: 'none'
      })
      return Promise.reject(new Error(errorMsg))
    }
  }
  
  // 未授权，跳转到登录页
  if (statusCode === 401) {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    uni.reLaunch({
      url: '/pages/auth/login'
    })
    return Promise.reject(new Error('未授权，请重新登录'))
  }
  
  // 其他HTTP错误
  const errorMessages = {
    400: '请求参数错误',
    403: '没有权限访问',
    404: '请求的资源不存在',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }
  
  const errorMsg = errorMessages[statusCode] || data.message || '请求失败'
  return Promise.reject(new Error(errorMsg))
}

/**
 * 统一请求方法
 */
const request = (options) => {
  // 请求拦截
  const config = requestInterceptor({
    url: BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      ...options.header
    },
    timeout: options.timeout || 10000
  })
  
  return new Promise((resolve, reject) => {
    uni.request({
      ...config,
      success: (response) => {
        try {
          const result = responseInterceptor(response)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        let errorMsg = '网络请求失败'
        
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            errorMsg = '网络超时，请检查网络连接'
          } else if (error.errMsg.includes('abort')) {
            errorMsg = '请求已取消'
          }
        }
        
        uni.showToast({
          title: errorMsg,
          icon: 'none'
        })
        reject(new Error(errorMsg))
      }
    })
  })
}

/**
 * 导出请求方法
 */
export default {
  get(url, params, options = {}) {
    return request({
      url,
      method: 'GET',
      data: params,
      ...options
    })
  },
  
  post(url, data, options = {}) {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },
  
  put(url, data, options = {}) {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },
  
  delete(url, data, options = {}) {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
}

