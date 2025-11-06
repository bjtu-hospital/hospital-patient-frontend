/**
 * UI工具函数 - Toast、Modal等统一封装
 */

/**
 * 显示成功提示
 * @param {String} title - 提示文本
 * @param {Number} duration - 持续时间(ms)
 */
export const showSuccess = (title, duration = 2000) => {
  uni.showToast({
    title,
    icon: 'success',
    duration
  })
}

/**
 * 显示错误提示
 * @param {String} title - 提示文本
 * @param {Number} duration - 持续时间(ms)
 */
export const showError = (title, duration = 2000) => {
  uni.showToast({
    title,
    icon: 'error',
    duration
  })
}

/**
 * 显示普通提示
 * @param {String} title - 提示文本
 * @param {Number} duration - 持续时间(ms)
 */
export const showToast = (title, duration = 2000) => {
  uni.showToast({
    title,
    icon: 'none',
    duration
  })
}

/**
 * 显示Loading
 * @param {String} title - Loading文本
 * @param {Boolean} mask - 是否显示透明蒙层
 */
export const showLoading = (title = '加载中...', mask = true) => {
  uni.showLoading({
    title,
    mask
  })
}

/**
 * 隐藏Loading
 */
export const hideLoading = () => {
  uni.hideLoading()
}

/**
 * 显示确认对话框
 * @param {Object} options - 配置选项
 * @returns {Promise<Boolean>}
 */
export const showConfirm = (options = {}) => {
  const {
    title = '提示',
    content = '',
    confirmText = '确定',
    cancelText = '取消',
    confirmColor = '#00D5D9'
  } = options

  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      confirmText,
      cancelText,
      confirmColor,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 显示提示对话框
 * @param {Object} options - 配置选项
 * @returns {Promise<Boolean>}
 */
export const showAlert = (options = {}) => {
  const {
    title = '提示',
    content = '',
    confirmText = '知道了',
    confirmColor = '#00D5D9'
  } = options

  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      showCancel: false,
      confirmText,
      confirmColor,
      success: () => {
        resolve(true)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 显示操作菜单
 * @param {Array} itemList - 菜单项列表
 * @returns {Promise<Number>} 返回选中的索引，取消返回-1
 */
export const showActionSheet = (itemList = []) => {
  return new Promise((resolve) => {
    uni.showActionSheet({
      itemList,
      success: (res) => {
        resolve(res.tapIndex)
      },
      fail: () => {
        resolve(-1)
      }
    })
  })
}

