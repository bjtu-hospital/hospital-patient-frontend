/**
 * 预约相关接口 - 支持 Mock 数据切换
 */
import request from './request'

// 导入 Mock 数据
import { 
  mockHospitals, 
  mockDepartments, 
  mockSchedules,
  mockConfig,
  mockDelay 
} from '@/mock'

/**
 * 获取医院列表
 */
export const getHospitals = async () => {
  // 判断是否使用 Mock 数据
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 医院数据')
    await mockDelay()
    return mockHospitals
  }
  
  // 使用真实接口
  console.log('[API] 调用真实接口获取医院列表')
  return request.get('/patient/hospitals')
}

/**
 * 获取科室列表
 * @param {String} hospitalId - 医院ID
 */
export const getDepartments = async (hospitalId) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 科室数据, hospitalId:', hospitalId)
    await mockDelay()
    // 根据医院ID过滤科室
    return mockDepartments.filter(dept => dept.hospitalId === hospitalId)
  }
  
  console.log('[API] 调用真实接口获取科室列表')
  return request.get(`/patient/hospitals/${hospitalId}/departments`)
}

/**
 * 获取医生排班列表
 * @param {Object} params - 查询参数 { hospitalId, departmentId, date }
 */
export const getDoctorSchedules = async (params) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 排班数据, params:', params)
    await mockDelay()
    
    // 根据参数过滤排班数据
    let filtered = mockSchedules
    
    if (params.departmentId) {
      filtered = filtered.filter(s => s.departmentId === params.departmentId)
    }
    
    if (params.date) {
      filtered = filtered.filter(s => s.date === params.date)
    }
    
    return filtered
  }
  
  console.log('[API] 调用真实接口获取医生排班')
  return request.get('/patient/schedules', params)
}

/**
 * 创建预约
 * @param {Object} data - 预约信息
 */
export const createAppointment = async (data) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 模拟创建预约, data:', data)
    await mockDelay()
    
    // 模拟返回预约成功的数据
    return {
      id: 'appointment_' + Date.now(),
      orderNo: '2024' + Date.now().toString().slice(-8),
      queueNumber: Math.floor(Math.random() * 30) + 1,
      needPay: true,
      payAmount: 50,
      appointmentDate: data.date || '2024-11-10',
      appointmentTime: data.time || '上午 08:00-08:30'
    }
  }
  
  console.log('[API] 调用真实接口创建预约')
  return request.post('/patient/appointments', data)
}

/**
 * 获取我的预约列表
 * @param {Object} params - 查询参数 { status, page, pageSize }
 */
export const getMyAppointments = (params) => {
  return request.get('/patient/appointments', params)
}

/**
 * 取消预约
 * @param {String} appointmentId - 预约ID
 */
export const cancelAppointment = (appointmentId) => {
  return request.put(`/patient/appointments/${appointmentId}/cancel`)
}

/**
 * 改约
 * @param {String} appointmentId - 预约ID
 * @param {Object} data - 新的预约信息
 */
export const rescheduleAppointment = (appointmentId, data) => {
  return request.put(`/patient/appointments/${appointmentId}/reschedule`, data)
}

/**
 * 候补预约
 * @param {Object} data - 候补信息
 */
export const createWaitlist = (data) => {
  return request.post('/patient/waitlist', data)
}

