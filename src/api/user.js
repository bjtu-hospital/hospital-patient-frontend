/**
 * 用户相关接口
 */
import request from './request'

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request.get('/patient/profile')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 */
export const updateUserInfo = (data) => {
  return request.put('/patient/profile', data)
}

/**
 * 获取就诊人列表
 */
export const getPatients = () => {
  return request.get('/patient/patients')
}

/**
 * 添加就诊人
 * @param {Object} data - 就诊人信息
 */
export const addPatient = (data) => {
  return request.post('/patient/patients', data)
}

/**
 * 更新就诊人
 * @param {String} patientId - 就诊人ID
 * @param {Object} data - 就诊人信息
 */
export const updatePatient = (patientId, data) => {
  return request.put(`/patient/patients/${patientId}`, data)
}

/**
 * 删除就诊人
 * @param {String} patientId - 就诊人ID
 */
export const deletePatient = (patientId) => {
  return request.delete(`/patient/patients/${patientId}`)
}

/**
 * 获取健康档案
 */
export const getHealthRecords = () => {
  return request.get('/patient/health-records')
}

/**
 * 获取检验报告
 * @param {Object} params - 查询参数
 */
export const getReports = (params) => {
  return request.get('/patient/reports', params)
}

