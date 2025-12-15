/**
 * 全局配置文件
 */

// API 基础地址
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000'  // 开发环境
  : 'http://localhost:8000'  // 生产环境

// 请求超时时间
export const REQUEST_TIMEOUT = 10000

// 应用名称
export const APP_NAME = '北京交通大学校医院'

// 医院主题色
export const THEME_COLOR = '#00D5D9'

// 静态资源基础地址
export const STATIC_URL = 'http://8.130.67.12:8000/common/icon?path='

// 分页配置
export const PAGE_SIZE = 10

// 预约规则配置
export const APPOINTMENT_CONFIG = {
  advanceDays: 7,           // 可提前预约天数
  cancelHours: 2,           // 取消预约需提前小时数
  rescheduleHours: 4,       // 改约需提前小时数
  maxAppointments: 5        // 同时最多预约数量
}
