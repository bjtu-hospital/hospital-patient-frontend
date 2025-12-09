/**
 * 支付相关接口
 */
import request from './request'

// 是否使用 Mock 数据
const USE_MOCK = false

// ==================== 支付相关 ====================

/**
 * 创建支付订单
 * @param {Object} data - 支付信息 { appointmentId, amount, paymentMethod }
 * @returns {Promise} 返回支付订单信息
 * Response: { code: 0, message: "success", data: { orderId, amount, ... } }
 */
export const createPaymentOrder = (data) => {
  if (USE_MOCK) {
    const order = {
      orderId: 'order_' + Date.now(),
      appointmentId: data.appointmentId,
      amount: data.amount,
      paymentMethod: data.paymentMethod || 'wechat',
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分钟后过期
    }
    // 存储到本地以便后续查询
    uni.setStorageSync('currentPaymentOrder', order)
    return Promise.resolve(order)
  }
  return request.post('/patient/payments/create', data)
}

/**
 * 获取支付二维码
 * @param {String} orderId - 订单ID
 * @returns {Promise} 返回支付二维码
 */
export const getPaymentQRCode = (orderId) => {
  if (USE_MOCK) {
    // 模拟返回二维码URL
    return Promise.resolve({
      qrCodeUrl: 'https://via.placeholder.com/300x300?text=Payment+QR+Code',
      orderId: orderId
    })
  }
  return request.get(`/patient/payments/${orderId}/qrcode`)
}

/**
 * 查询支付状态
 * @param {String} orderId - 订单ID
 * @returns {Promise} 返回支付状态
 */
export const queryPaymentStatus = (orderId) => {
  if (USE_MOCK) {
    const order = uni.getStorageSync('currentPaymentOrder')
    if (order && order.orderId === orderId) {
      return Promise.resolve({
        orderId: orderId,
        status: order.status, // pending, paid, failed, expired
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        transactionId: order.status === 'paid' ? 'txn_' + Date.now() : null,
        paidAt: order.status === 'paid' ? new Date().toISOString() : null
      })
    }
    return Promise.reject(new Error('订单不存在'))
  }
  return request.get(`/patient/payments/${orderId}/status`)
}

/**
 * 模拟支付（仅用于Mock开发）
 * @param {String} orderId - 订单ID
 * @returns {Promise} 支付结果
 */
export const mockPayment = (orderId) => {
  if (USE_MOCK) {
    const order = uni.getStorageSync('currentPaymentOrder')
    if (order && order.orderId === orderId) {
      order.status = 'paid'
      order.transactionId = 'txn_' + Date.now()
      order.paidAt = new Date().toISOString()
      uni.setStorageSync('currentPaymentOrder', order)
      return Promise.resolve({
        success: true,
        orderId: orderId,
        transactionId: order.transactionId,
        message: '支付成功'
      })
    }
    return Promise.reject(new Error('订单不存在'))
  }
  return Promise.reject(new Error('生产环境不支持此操作'))
}

/**
 * 取消支付订单
 * @param {String} orderId - 订单ID
 * @returns {Promise} 是否成功
 */
export const cancelPaymentOrder = (orderId) => {
  if (USE_MOCK) {
    const order = uni.getStorageSync('currentPaymentOrder')
    if (order && order.orderId === orderId) {
      order.status = 'cancelled'
      uni.setStorageSync('currentPaymentOrder', order)
      return Promise.resolve(true)
    }
    return Promise.reject(new Error('订单不存在'))
  }
  return request.put(`/patient/payments/${orderId}/cancel`)
}

/**
 * 获取支付历史
 * @param {Object} params - 查询参数 { page, pageSize, status }
 * @returns {Promise} 返回支付历史列表
 */
export const getPaymentHistory = (params) => {
  if (USE_MOCK) {
    // 模拟返回支付历史
    return Promise.resolve({
      total: 0,
      list: []
    })
  }
  return request.get('/patient/payments/history', params)
}

/**
 * 获取支付方式列表
 * @returns {Promise} 返回支付方式列表
 */
export const getPaymentMethods = () => {
  if (USE_MOCK) {
    return Promise.resolve([
      {
        id: 'wechat',
        name: '微信支付',
        icon: '/static/payment-icon/wechat-payment.png',
        description: '使用微信扫码支付'
      },
      {
        id: 'alipay',
        name: '支付宝',
        icon: '/static/payment-icon/alipay.png',
        description: '使用支付宝扫码支付'
      },
      {
        id: 'bank',
        name: '银行卡',
        icon: '/static/payment-icon/bankpay.png',
        description: '使用银行卡支付'
      }
    ])
  }
  return request.get('/patient/payments/methods')
}

/**
 * 验证支付凭证
 * @param {Object} data - 支付凭证 { orderId, transactionId, signature }
 * @returns {Promise} 验证结果
 */
export const verifyPayment = (data) => {
  if (USE_MOCK) {
    return Promise.resolve({
      verified: true,
      orderId: data.orderId,
      message: '支付凭证有效'
    })
  }
  return request.post('/patient/payments/verify', data)
}

// ==================== 预约订单支付相关 ====================

/**
 * 支付预约订单
 * @param {Number} appointmentId - 预约订单ID
 * @param {Object} data - 支付信息 { method: 'alipay'|'wechat'|'bank', remark?: string }
 * @returns {Promise} 返回支付结果
 * Response: {
 *   success: true,
 *   orderId: 订单ID,
 *   orderNo: 订单号,
 *   amount: 支付金额,
 *   method: 支付方式,
 *   paymentStatus: 'paid',
 *   paymentTime: 支付时间
 * }
 */
export const payAppointment = (appointmentId, data) => {
  if (USE_MOCK) {
    // 模拟支付成功
    return Promise.resolve({
      success: true,
      orderId: appointmentId,
      orderNo: '20251208' + String(appointmentId).padStart(6, '0'),
      amount: 80,
      method: data.method || 'alipay',
      paymentStatus: 'paid',
      paymentTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
    })
  }
  return request.post(`/patient/appointments/${appointmentId}/pay`, data)
}

/**
 * 取消预约订单支付（申请退款）
 * @param {Number} appointmentId - 预约订单ID
 * @param {String} reason - 取消原因
 * @returns {Promise} 返回取消结果
 * Response: {
 *   success: true,
 *   orderId: 订单ID,
 *   status: 'cancelled',
 *   cancelTime: 取消时间
 * }
 */
export const cancelAppointmentPayment = (appointmentId, reason = '') => {
  if (USE_MOCK) {
    return Promise.resolve({
      success: true,
      orderId: appointmentId,
      status: 'cancelled',
      cancelTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
    })
  }
  return request.post(`/patient/appointments/${appointmentId}/cancel-payment`, {
    reason: reason
  })
}
