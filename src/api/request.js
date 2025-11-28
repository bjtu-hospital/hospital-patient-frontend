/**
 * 统一请求封装 - uniapp 版本
 * 支持后端 FastAPI 认证接口规范
 * 统一返回格式: { code: 0, message: ... }
 */

// 从环境变量读取 API 基础地址
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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
 * 统一处理后端返回格式: { code: 0, message: ... } 或 { code: 非0, message: "错误信息" }
 */
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  // HTTP状态码检查
  if (statusCode === 200) {
    // ✅ 成功时 code=0, 数据在 message 字段
    if (data.code === 0) {
      return data.message
    } 
    
    // ❌ 业务错误: code 非0
    const errorMsg = typeof data.message === 'string' 
      ? data.message 
      : JSON.stringify(data.message) || '操作失败'
    
    // 根据错误码进行不同处理
    switch (data.code) {
      case 400:
        // 参数错误/注册手机号重复 - 不自动Toast，由业务层处理
        break
      case 403:
        // 账号封禁 - 不自动Toast，由业务层处理（需要显示详细信息）
        break
      default:
        // 其他错误统一Toast提示
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        })
    }
    
    return Promise.reject({ code: data.code, message: errorMsg })
  }
  
  // 401 未授权 - token无效或过期
  if (statusCode === 401) {
    // 清理本地存储
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
      duration: 1500
    })
    
    // 延迟跳转到登录页
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/auth/login'
      })
    }, 1500)
    
    return Promise.reject({ code: 401, message: '未授权，请重新登录' })
  }
  
  // 403 禁止访问（可能是封禁或权限不足）
  if (statusCode === 403) {
    const errorMsg = data?.message || '没有权限访问'
    // 不自动Toast，让业务层处理（封禁信息需要弹窗显示详细内容）
    return Promise.reject({ code: 403, message: errorMsg })
  }
  
  // 其他HTTP错误统一处理
  const errorMessages = {
    400: '请求参数错误',
    404: '请求的资源不存在',
    500: '服务器错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }
  
  const errorMsg = errorMessages[statusCode] || `请求失败 (${statusCode})`
  
  uni.showToast({
    title: errorMsg,
    icon: 'none',
    duration: 2000
  })
  
  return Promise.reject({ code: statusCode, message: errorMsg })
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

