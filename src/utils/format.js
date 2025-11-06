/**
 * 格式化工具函数
 */

/**
 * 格式化日期
 * @param {Date|String} date - 日期
 * @param {String} format - 格式 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss'
 * @returns {String}
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  if (format === 'YYYY-MM-DD HH:mm:ss') {
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  
  return `${year}-${month}-${day}`
}

/**
 * 格式化手机号（中间4位显示为星号）
 * @param {String} phone - 手机号
 * @returns {String}
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化身份证号（中间部分显示为星号）
 * @param {String} idCard - 身份证号
 * @returns {String}
 */
export const formatIdCard = (idCard) => {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

/**
 * 格式化价格（保留两位小数）
 * @param {Number} price - 价格
 * @returns {String}
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00'
  return Number(price).toFixed(2)
}

/**
 * 格式化星期
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export const formatWeekday = (date) => {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const d = new Date(date)
  return weekDays[d.getDay()]
}

/**
 * 相对时间格式化（刚刚、1分钟前等）
 * @param {Date|String} date - 日期
 * @returns {String}
 */
export const formatRelativeTime = (date) => {
  const now = new Date()
  const target = new Date(date)
  const diff = now - target
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 30 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatDate(date)
  }
}

