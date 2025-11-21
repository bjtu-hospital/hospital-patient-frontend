/**
 * 统一请求封装 - uniapp 版本

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
 * 统一处理后端返回格式: { code: 0, message: {} } 或 { code: 非0, message: "错误信息" }
 */
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  // 请求成功
  if (statusCode === 200) {
    // 成功时 code=0, 数据在 message 字段
    if (data.code === 0) {
      // 返回 message 字段的数据
      return data.message
    } else {
      // ❌ 业务错误: code 非0, message 是错误描述字符串
      const errorMsg = typeof data.message === 'string' 
        ? data.message 
        : '操作失败'
      
      // 统一Toast提示错误
      uni.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
      
      return Promise.reject(new Error(errorMsg))
    }
  }
  
  // 未授权，跳转到登录页
  if (statusCode === 401) {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none'
    })
    
    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/auth/login'
      })
    }, 1500)
    
    return Promise.reject(new Error('未授权，请重新登录'))
  }
  
  // 其他HTTP错误 - 统一处理并提示
  const errorMessages = {
    400: '请求参数错误',
    403: '没有权限访问',
    404: '请求的资源不存在',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }
  
  const errorMsg = errorMessages[statusCode] || '请求失败'
  
  // 统一Toast提示
  uni.showToast({
    title: errorMsg,
    icon: 'none',
    duration: 2000
  })
  
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
          } else if (error.errMsg.includes('fail')) {
            errorMsg = '网络连接失败，请检查网络'
          }
        }
        
        // 统一Toast提示网络错误
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
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

