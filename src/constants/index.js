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
  SPECIAL: 'special'         // 专病门诊
}

// 就诊时段
export const TIME_PERIOD = {
  MORNING: '上午',
  AFTERNOON: '下午',
  EVENING: '晚上'
}

