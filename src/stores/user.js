/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'
import { setToken, removeToken, setUserInfo, removeUserInfo, checkAuth as checkAuthUtil } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref('')
  const userInfo = ref(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '未登录')
  const userRole = computed(() => userInfo.value?.role || null)
  
  // Actions
  
  /**
   * 登录
   * @param {String} tokenStr - 从后端获取的 token
   */
  const login = async (tokenStr) => {
    try {
      // 保存 token
      token.value = tokenStr
      setToken(tokenStr)
      
      // 调用 /auth/me 获取用户角色信息
      const userRoleInfo = await authApi.getCurrentUser()
      
      // 保存用户信息
      userInfo.value = userRoleInfo
      setUserInfo(userRoleInfo)
      
      return userRoleInfo
    } catch (error) {
      // 登录失败，清理数据
      token.value = ''
      userInfo.value = null
      removeToken()
      removeUserInfo()
      throw error
    }
  }
  
  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      // 调用后端登出接口
      await authApi.logout()
    } catch (error) {
      console.error('登出接口调用失败:', error)
    } finally {
      // 无论接口成功与否，都清理本地数据
      token.value = ''
      userInfo.value = null
      removeToken()
      removeUserInfo()
      
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/auth/login'
      })
    }
  }
  
  /**
   * 从本地存储恢复登录状态（应用启动时调用）
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
   * 验证登录态
   * 调用后端 /auth/me 验证 token 是否有效
   */
  const checkAuth = async () => {
    try {
      const userRoleInfo = await checkAuthUtil()
      
      // 更新用户信息
      userInfo.value = userRoleInfo
      setUserInfo(userRoleInfo)
      
      return userRoleInfo
    } catch (error) {
      // 验证失败，清理数据
      token.value = ''
      userInfo.value = null
      removeToken()
      removeUserInfo()
      throw error
    }
  }
  
  /**
   * 更新用户信息
   */
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    setUserInfo(userInfo.value)
  }
  
  return {
    // State
    token,
    userInfo,
    
    // Getters
    isLoggedIn,
    userName,
    userRole,
    
    // Actions
    login,
    logout,
    restoreAuth,
    checkAuth,
    updateUserInfo
  }
})
