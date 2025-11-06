/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref('')
  const userInfo = ref(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '未登录')
  
  // Actions
  
  /**
   * 登录
   */
  const login = (loginData) => {
    token.value = loginData.token
    userInfo.value = loginData.userInfo
    
    // 持久化存储
    uni.setStorageSync('token', loginData.token)
    uni.setStorageSync('userInfo', loginData.userInfo)
  }
  
  /**
   * 退出登录
   */
  const logout = () => {
    token.value = ''
    userInfo.value = null
    
    // 清除存储
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/auth/login'
    })
  }
  
  /**
   * 从本地存储恢复登录状态
   */
  const restoreAuth = () => {
    const savedToken = uni.getStorageSync('token')
    const savedUserInfo = uni.getStorageSync('userInfo')
    
    if (savedToken && savedUserInfo) {
      token.value = savedToken
      userInfo.value = savedUserInfo
      return true
    }
    return false
  }
  
  /**
   * 更新用户信息
   */
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    uni.setStorageSync('userInfo', userInfo.value)
  }
  
  return {
    // State
    token,
    userInfo,
    
    // Getters
    isLoggedIn,
    userName,
    
    // Actions
    login,
    logout,
    restoreAuth,
    updateUserInfo
  }
})

