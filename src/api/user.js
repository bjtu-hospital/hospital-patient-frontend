/**
 * 用户相关接口
 */
import request from './request'
import {
    mockPatients,
    mockUserInfo,
    mockAppointments,
    mockHealthRecords
} from '@/pages/profile/user-mock'

// 是否使用 Mock 数据
const USE_MOCK = true  // ← 开发阶段使用 Mock 数据

// ==================== 用户信息相关 ====================

/**
 * 获取用户信息
 * @returns {Promise} 返回用户信息
 */
export const getUserInfo = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockUserInfo)
  }
  return request.get('/patient/profile')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise} 是否成功
 */
export const updateUserInfo = (data) => {
  if (USE_MOCK) {
    // 更新 mockUserInfo
    Object.assign(mockUserInfo, data)
    return Promise.resolve(true)
  }
  return request.put('/patient/profile', data)
}

// ==================== 就诊人管理 ====================

/**
 * 获取就诊人列表
 * @returns {Promise} 返回就诊人列表
 */
export const getPatients = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockPatients)
  }
  return request.get('/patient/patients')
}

/**
 * 添加就诊人
 * @param {Object} data - 就诊人信息
 * @returns {Promise} 返回新增的就诊人ID
 */
export const addPatient = (data) => {
  if (USE_MOCK) {
    // 生成新的就诊人
    const newPatient = {
      id: 'patient_' + Date.now(),
      ...data,
      isDefault: mockPatients.length === 0,  // 第一个就诊人设为默认
      createdAt: new Date().toISOString()
    }
    
    mockPatients.push(newPatient)
    return Promise.resolve({ id: newPatient.id })
  }
  return request.post('/patient/patients', data)
}

/**
 * 更新就诊人
 * @param {String} patientId - 就诊人ID
 * @param {Object} data - 就诊人信息
 * @returns {Promise} 是否成功
 */
export const updatePatient = (patientId, data) => {
  if (USE_MOCK) {
    const patient = mockPatients.find(p => p.id === patientId)
    if (patient) {
      Object.assign(patient, data)
    }
    return Promise.resolve(true)
  }
  return request.put(`/patient/patients/${patientId}`, data)
}

/**
 * 删除就诊人
 * @param {String} patientId - 就诊人ID
 * @returns {Promise} 是否成功
 */
export const deletePatient = (patientId) => {
  if (USE_MOCK) {
    const index = mockPatients.findIndex(p => p.id === patientId)
    if (index !== -1) {
      mockPatients.splice(index, 1)
    }
    return Promise.resolve(true)
  }
  return request.delete(`/patient/patients/${patientId}`)
}

// ==================== 健康档案相关 ====================

/**
 * 获取健康档案
 * @returns {Promise} 返回健康档案信息
 */
export const getHealthRecords = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockHealthRecords)
  }
  return request.get('/patient/health-records')
}

/**
 * 获取检验报告
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回检验报告列表
 */
export const getReports = (params) => {
  if (USE_MOCK) {
    // 模拟分页数据
    return Promise.resolve({
      total: 0,
      list: []
    })
  }
  return request.get('/patient/reports', params)
}
