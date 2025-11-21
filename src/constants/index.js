/**
 * 常量定义
 */

// 预约状态
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',        // 待就诊
  COMPLETED: 'completed',    // 已完成
  CANCELLED: 'cancelled'     // 已取消
}

// 预约状态文本映射
export const APPOINTMENT_STATUS_TEXT = {
  pending: '待就诊',
  completed: '已完成',
  cancelled: '已取消'
}

// 门诊类型
export const APPOINTMENT_TYPE = {
  NORMAL: 'normal',          // 普通门诊
  EXPERT: 'expert',          // 专家门诊
  INTERNATIONAL: 'international'  // 国疗门诊
}

// ==================== 支付相关常量 ====================

// 支付状态
export const PAYMENT_STATUS = {
  PENDING: 'pending',        // 待支付
  PAID: 'paid',              // 已支付
  FAILED: 'failed',          // 支付失败
  CANCELLED: 'cancelled',    // 已取消
  EXPIRED: 'expired'         // 已过期
}

// 支付状态文本映射
export const PAYMENT_STATUS_TEXT = {
  pending: '待支付',
  paid: '已支付',
  failed: '支付失败',
  cancelled: '已取消',
  expired: '已过期'
}

// 支付方式
export const PAYMENT_METHOD = {
  WECHAT: 'wechat',          // 微信支付
  ALIPAY: 'alipay',          // 支付宝
  BANK: 'bank'               // 银行卡
}

// 支付方式文本映射
export const PAYMENT_METHOD_TEXT = {
  wechat: '微信支付',
  alipay: '支付宝',
  bank: '银行卡'
}

// 支付超时时间（分钟）
export const PAYMENT_TIMEOUT = 30

// 支付重试次数
export const PAYMENT_MAX_RETRY = 3

// 就诊时段
export const TIME_PERIOD = {
  MORNING: '上午',
  AFTERNOON: '下午',
  EVENING: '晚上'
}

