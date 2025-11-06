/**
 * 页面导航工具函数
 */

/**
 * 跳转到指定页面
 * @param {String} url - 页面路径
 * @param {Object} params - 页面参数
 */
export const navigateTo = (url, params = {}) => {
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  uni.navigateTo({
    url: fullUrl,
    fail: (err) => {
      console.error('页面跳转失败:', err)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}

/**
 * 替换当前页面
 * @param {String} url - 页面路径
 * @param {Object} params - 页面参数
 */
export const redirectTo = (url, params = {}) => {
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  uni.redirectTo({
    url: fullUrl
  })
}

/**
 * 切换到Tab页面
 * @param {String} url - Tab页面路径
 */
export const switchTab = (url) => {
  uni.switchTab({
    url
  })
}

/**
 * 返回上一页
 * @param {Number} delta - 返回的页面数
 */
export const navigateBack = (delta = 1) => {
  uni.navigateBack({
    delta
  })
}

/**
 * 关闭所有页面，打开到某个页面
 * @param {String} url - 页面路径
 * @param {Object} params - 页面参数
 */
export const reLaunch = (url, params = {}) => {
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  uni.reLaunch({
    url: fullUrl
  })
}

/**
 * 跳转到登录页
 */
export const toLogin = () => {
  reLaunch('/pages/auth/login')
}

/**
 * 跳转到首页
 */
export const toHome = () => {
  switchTab('/pages/home/index')
}

/**
 * 跳转到预约页面
 * @param {Object} params - 预约参数
 */
export const toAppointment = (params = {}) => {
  navigateTo('/pages/home/appointment/select-hospital', params)
}

/**
 * 跳转到我的预约
 */
export const toMyAppointments = () => {
  navigateTo('/pages/profile/appointments')
}

/**
 * 跳转到就诊人管理
 */
export const toPatients = () => {
  navigateTo('/pages/profile/patients')
}

/**
 * 跳转到健康档案
 */
export const toHealth = () => {
  navigateTo('/pages/profile/health')
}

