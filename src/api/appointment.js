/**
 * 预约相关接口
 */
import request from './request'

/**
 * 获取医院列表
 */
export const getHospitals = () => {
  return request.get('/patient/hospitals')
}

/**
 * 获取科室列表
 * @param {String} hospitalId - 医院ID
 */
export const getDepartments = (hospitalId) => {
  return request.get(`/patient/hospitals/${hospitalId}/departments`)
}

/**
 * 获取医生排班列表
 * @param {Object} params - 查询参数 { hospitalId, departmentId, date }
 */
export const getDoctorSchedules = (params) => {
  return request.get('/patient/schedules', params)
}

/**
 * 创建预约
 * @param {Object} data - 预约信息
 */
export const createAppointment = (data) => {
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

