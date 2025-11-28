/**
 * 认证工具函数
 */

import request from '@/api/request'

/**
 * 检查是否已登录
 * @returns {Boolean}
 */
export const isAuthenticated = () => {
  const token = uni.getStorageSync('token')
  return !!token
}

/**
 * 获取 Token
 * @returns {String}
 */
export const getToken = () => {
  return uni.getStorageSync('token')
}

/**
 * 设置 Token
 * @param {String} token
 */
export const setToken = (token) => {
  uni.setStorageSync('token', token)
}

/**
 * 移除 Token
 */
export const removeToken = () => {
  uni.removeStorageSync('token')
}

/**
 * 获取用户信息
 * @returns {Object|null}
 */
export const getUserInfo = () => {
  return uni.getStorageSync('userInfo')
}

/**
 * 设置用户信息
 * @param {Object} userInfo
 */
export const setUserInfo = (userInfo) => {
  uni.setStorageSync('userInfo', userInfo)
}

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
  uni.removeStorageSync('userInfo')
}

/**
 * 清除所有认证信息
 */
export const clearAuth = () => {
  removeToken()
  removeUserInfo()
}

/**
 * 跳转到登录页
 */
export const redirectToLogin = () => {
  uni.reLaunch({
    url: '/pages/auth/login'
  })
}

/**
 * 验证登录态
 * 调用后端 /auth/me 接口验证 token 是否有效
 * @returns {Promise<Object>} 返回用户角色信息 { role: 'user'|'admin' }
 */
export const checkAuth = async () => {
  try {
    const token = getToken()
    if (!token) {
      throw new Error('未登录')
    }
    
    // 调用后端验证接口
    const result = await request.get('/auth/me')
    
    // 保存用户信息
    setUserInfo(result)
    
    return result
  } catch (error) {
    // 验证失败，清理本地数据
    clearAuth()
    throw error
  }
}
