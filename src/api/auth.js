/**
 * 认证相关接口
 * 对接后端 FastAPI 认证接口
 */
import request from './request'

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {String} data.phonenumber - 手机号（必填）
 * @param {String} data.password - 密码（必填）
 * @param {String} data.name - 姓名（必填）
 * @param {String} data.email - 邮箱（可选）
 * @param {String} data.gender - 性别（可选）'男'|'女'|'未知'
 * @param {String} data.birth_date - 出生日期（可选）YYYY-MM-DD
 * @param {String} data.student_id - 学号（可选）
 * @param {String} data.patient_type - 患者类型（可选）'学生'|'教师'|'职工'
 * @returns {Promise<String>} 返回 token
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
