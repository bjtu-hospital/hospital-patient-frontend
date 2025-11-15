/**
 * 支付状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePaymentStore = defineStore('payment', () => {
  // State - 当前支付订单
  const currentOrder = ref(null)
  const paymentMethod = ref('wechat') // 默认支付方式
  const paymentHistory = ref([])
  
  // State - 支付状态
  const isProcessing = ref(false)
  const paymentError = ref(null)
  
  // Getters
  const isPaymentPending = computed(() => currentOrder.value?.status === 'pending')
  const isPaymentCompleted = computed(() => currentOrder.value?.status === 'paid')
  const isPaymentFailed = computed(() => currentOrder.value?.status === 'failed')
  const isPaymentExpired = computed(() => currentOrder.value?.status === 'expired')
  
  // Actions
  
  /**
   * 创建支付订单
   */
  const createOrder = (order) => {
    currentOrder.value = order
    paymentError.value = null
    uni.setStorageSync('currentPaymentOrder', order)
  }
  
  /**
   * 更新支付订单状态
   */
  const updateOrderStatus = (status, details = {}) => {
    if (currentOrder.value) {
      currentOrder.value.status = status
      Object.assign(currentOrder.value, details)
      uni.setStorageSync('currentPaymentOrder', currentOrder.value)
    }
  }
  
  /**
   * 设置支付方式
   */
  const setPaymentMethod = (method) => {
    paymentMethod.value = method
  }
  
  /**
   * 设置处理状态
   */
  const setProcessing = (processing) => {
    isProcessing.value = processing
  }
  
  /**
   * 设置支付错误
   */
  const setPaymentError = (error) => {
    paymentError.value = error
  }
  
  /**
   * 清除支付错误
   */
  const clearPaymentError = () => {
    paymentError.value = null
  }
  
  /**
   * 添加到支付历史
   */
  const addToHistory = (payment) => {
    paymentHistory.value.unshift(payment)
    uni.setStorageSync('paymentHistory', paymentHistory.value)
  }
  
  /**
   * 加载支付历史
   */
  const loadPaymentHistory = () => {
    const history = uni.getStorageSync('paymentHistory') || []
    paymentHistory.value = history
  }
  
  /**
   * 清空当前订单
   */
  const clearCurrentOrder = () => {
    currentOrder.value = null
    paymentError.value = null
    uni.removeStorageSync('currentPaymentOrder')
  }
  
  /**
   * 恢复支付订单（从本地存储）
   */
  const restoreOrder = () => {
    const order = uni.getStorageSync('currentPaymentOrder')
    if (order) {
      currentOrder.value = order
    }
  }
  
  return {
    // State
    currentOrder,
    paymentMethod,
    paymentHistory,
    isProcessing,
    paymentError,
    
    // Getters
    isPaymentPending,
    isPaymentCompleted,
    isPaymentFailed,
    isPaymentExpired,
    
    // Actions
    createOrder,
    updateOrderStatus,
    setPaymentMethod,
    setProcessing,
    setPaymentError,
    clearPaymentError,
    addToHistory,
    loadPaymentHistory,
    clearCurrentOrder,
    restoreOrder
  }
})
