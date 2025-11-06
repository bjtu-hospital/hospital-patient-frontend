/**
 * 表单验证工具函数
 */

/**
 * 验证手机号
 * @param {String} phone - 手机号
 * @returns {Boolean}
 */
export const isValidPhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证身份证号
 * @param {String} idCard - 身份证号
 * @returns {Boolean}
 */
export const isValidIdCard = (idCard) => {
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard)
}

/**
 * 验证学号（8位数字）
 * @param {String} studentId - 学号
 * @returns {Boolean}
 */
export const isValidStudentId = (studentId) => {
  return /^\d{8}$/.test(studentId)
}

/**
 * 验证密码强度（至少6位）
 * @param {String} password - 密码
 * @returns {Boolean}
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6
}

/**
 * 验证邮箱
 * @param {String} email - 邮箱
 * @returns {Boolean}
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证真实姓名（2-20个中文字符）
 * @param {String} name - 姓名
 * @returns {Boolean}
 */
export const isValidRealName = (name) => {
  return /^[\u4e00-\u9fa5]{2,20}$/.test(name)
}

