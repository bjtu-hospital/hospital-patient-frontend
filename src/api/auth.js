/**
 * 认证相关接口
 */
import request from './request'

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证 { identifier, password }
 */
export const login = (credentials) => {
  return request.post('/auth/patient/login', credentials)
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 */
export const register = (data) => {
  return request.post('/auth/patient/register', data)
}

/**
 * 学号/工号认证
 * @param {Object} data - 认证信息 { studentId, realName }
 */
export const verifyIdentity = (data) => {
  return request.post('/auth/patient/verify', data)
}

/**
 * 退出登录
 */
export const logout = () => {
  return request.post('/auth/logout')
}

/**
 * 刷新 Token
 */
export const refreshToken = () => {
  return request.post('/auth/refresh')
}

