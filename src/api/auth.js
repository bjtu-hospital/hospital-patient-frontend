/**
 * 认证相关接口
 * 对接后端 FastAPI 认证接口
 */
import request from './request'

// ==================== 短信验证码接口 ====================

/**
 * 发送短信验证码
 * @param {String} phone - 手机号
 * @returns {Promise<Object>} 返回 { detail: "验证码已发送" }
 * 限流：60秒内只能发送一次，验证码有效期5分钟
 */
export const sendSmsCode = (phone) => {
  return request.post('/auth/sms/send-code', { phone })
}

/**
 * 校验短信验证码
 * @param {String} phone - 手机号
 * @param {String} code - 6位验证码
 * @returns {Promise<Object>} 返回 { detail: "验证码验证通过" }
 * 验证通过后15分钟内可完成注册
 */
export const verifySmsCode = (phone, code) => {
  return request.post('/auth/sms/verify-code', { phone, code })
}

// ==================== 注册登录接口 ====================

/**
 * 用户注册
 * 前置要求：必须先完成短信验证码校验
 * @param {Object} data - 注册信息
 * @param {String} data.phonenumber - 手机号（必填）
 * @param {String} data.password - 密码（必填）
 * @param {String} data.name - 姓名（必填）
 * @param {String} data.email - 邮箱（可选）
 * @param {String} data.gender - 性别（可选）'男'|'女'|'未知'
 * @param {String} data.birth_date - 出生日期（可选）YYYY-MM-DD
 * @param {String} data.identifier - 学号/工号（可选）
 * @param {String} data.patient_type - 患者类型（可选）'student'|'teacher'|'staff'
 * @returns {Promise<String>} 返回 token（注册成功自动登录）
 */
export const register = (data) => {
  return request.post('/auth/register', data)
}

/**
 * 患者登录
 * @param {Object} credentials - 登录凭证
 * @param {String} credentials.phonenumber - 手机号
 * @param {String} credentials.password - 密码
 * @returns {Promise<String>} 返回 token
 */
export const login = (credentials) => {
  return request.post('/auth/patient/login', credentials)
}

/**
 * 获取当前用户角色
 * @returns {Promise<Object>} 返回 { role: 'user'|'admin' }
 */
export const getCurrentUser = () => {
  return request.get('/auth/me')
}

/**
 * 退出登录
 * @returns {Promise<String>} 返回成功消息
 */
export const logout = () => {
  return request.post('/auth/logout')
}
