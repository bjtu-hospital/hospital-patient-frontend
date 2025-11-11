/**
 * 预约相关接口
 */
import request from './request'
import {
    mockHospitals,
    mockDepartments,
    mockSchedules,
    mockWaitlist
} from '@/pages/home/appointment/appointment-mock'
import { mockAppointments } from '@/pages/profile/user-mock'

// 是否使用 Mock 数据
const USE_MOCK = true  // ← 开发阶段使用 Mock 数据

// ==================== 医院相关 ====================

/**
 * 获取医院列表
 * @returns {Promise} 返回医院列表
 * Response: { code: 0, message: "success", data: [...] }
 */
export const getHospitals = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockHospitals)
  }
  return request.get('/patient/hospitals')
}

/**
 * 获取科室列表
 * @param {String} hospitalId - 医院ID
 * @returns {Promise} 返回科室列表
 * Response: { code: 0, message: "success", data: [...] }
 */
export const getDepartments = (hospitalId) => {
  if (USE_MOCK) {
    // 根据医院ID过滤科室
    const filtered = mockDepartments.filter(dept => dept.hospitalId === hospitalId)
    return Promise.resolve(filtered)
  }
  return request.get(`/patient/hospitals/${hospitalId}/departments`)
}

/**
 * 获取医生排班列表
 * @param {Object} params - 查询参数 { hospitalId, departmentId, date }
 * @returns {Promise} 返回排班列表
 * Response: { code: 0, message: "success", data: [...] }
 */
export const getDoctorSchedules = (params) => {
  if (USE_MOCK) {
    // 根据参数过滤排班数据
    let filtered = mockSchedules
    
    if (params.departmentId) {
      filtered = filtered.filter(s => s.departmentId === params.departmentId)
    }
    
    if (params.date) {
      filtered = filtered.filter(s => s.date === params.date)
    }
    
    return Promise.resolve(filtered)
  }
  return request.get('/patient/schedules', params)
}

/**
 * 创建预约
 * @param {Object} data - 预约信息
 * @returns {Promise} 返回预约结果
 * Response: { code: 0, message: "success", data: {...} }
 */
export const createAppointment = (data) => {
  if (USE_MOCK) {
    // 模拟返回预约成功的数据
    const result = {
      id: 'appointment_' + Date.now(),
      orderNo: '2024' + Date.now().toString().slice(-8),
      queueNumber: Math.floor(Math.random() * 30) + 1,
      needPay: true,
      payAmount: 50,
      appointmentDate: data.date || '2024-11-10',
      appointmentTime: data.time || '上午 08:00-08:30'
    }
    return Promise.resolve(result)
  }
  return request.post('/patient/appointments', data)
}

/**
 * 获取我的预约列表
 * @param {Object} params - 查询参数 { status, page, pageSize }
 * @returns {Promise} 返回预约列表
 * Response: { code: 0, message: "success", data: { total, list } }
 */
export const getMyAppointments = (params) => {
  if (USE_MOCK) {
    // 根据状态过滤
    let filtered = mockAppointments
    
    if (params && params.status && params.status !== 'all') {
      filtered = filtered.filter(a => a.status === params.status)
    }
    
    // 模拟分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return Promise.resolve({
      total: filtered.length,
      list: filtered.slice(start, end)
    })
  }
  return request.get('/patient/appointments', params)
}

/**
 * 取消预约
 * @param {String} appointmentId - 预约ID
 * @returns {Promise} 是否成功
 */
export const cancelAppointment = (appointmentId) => {
  if (USE_MOCK) {
    // 在 Mock 数据中找到预约并更新状态
    const appointment = mockAppointments.find(a => a.id === appointmentId)
    if (appointment) {
      appointment.status = 'cancelled'
      appointment.canCancel = false
      appointment.canReschedule = false
    }
    return Promise.resolve(true)
  }
  return request.put(`/patient/appointments/${appointmentId}/cancel`)
}

/**
 * 改约
 * @param {String} appointmentId - 预约ID
 * @param {Object} data - 新的预约信息
 * @returns {Promise} 是否成功
 */
export const rescheduleAppointment = (appointmentId, data) => {
  if (USE_MOCK) {
    return Promise.resolve(true)
  }
  return request.put(`/patient/appointments/${appointmentId}/reschedule`, data)
}

// ==================== 候补相关 ====================

/**
 * 加入候补
 * @param {Object} data - 候补信息 { scheduleId, patientId }
 * @returns {Promise} 候补结果
 */
export const createWaitlist = (data) => {
  if (USE_MOCK) {
    // 计算当前候补位置
    const existingCount = mockWaitlist.filter(
      w => w.scheduleId === data.scheduleId && w.status === 'waiting'
    ).length
    
    const newWaitlist = {
      id: 'waitlist_' + Date.now(),
      scheduleId: data.scheduleId,
      patientId: data.patientId,
      position: existingCount + 1,
      status: 'waiting',
      createdAt: new Date().toISOString()
    }
    
    mockWaitlist.push(newWaitlist)
    
    return Promise.resolve({
      waitlistId: newWaitlist.id,
      position: newWaitlist.position
    })
  }
  return request.post('/patient/waitlist', data)
}

/**
 * 获取我的候补列表
 * @returns {Promise} 返回候补列表
 */
export const getMyWaitlist = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockWaitlist)
  }
  return request.get('/patient/waitlist')
}

/**
 * 取消候补
 * @param {String} waitlistId - 候补ID
 * @returns {Promise} 是否成功
 */
export const cancelWaitlist = (waitlistId) => {
  if (USE_MOCK) {
    const index = mockWaitlist.findIndex(w => w.id === waitlistId)
    if (index !== -1) {
      mockWaitlist.splice(index, 1)
    }
    return Promise.resolve(true)
  }
  return request.delete(`/patient/waitlist/${waitlistId}`)
}
