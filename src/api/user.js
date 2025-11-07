/**
 * 用户相关接口 - 支持 Mock 数据切换
 */
import request from './request'

// 导入 Mock 数据
import { 
  mockPatients,
  mockUserInfo,
  mockAppointments,
  mockHealthRecords,
  mockConfig,
  mockDelay 
} from '@/mock'

/**
 * 获取用户信息
 */
export const getUserInfo = async () => {
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 用户信息')
    await mockDelay()
    return mockUserInfo
  }
  
  console.log('[API] 调用真实接口获取用户信息')
  return request.get('/patient/profile')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 */
export const updateUserInfo = async (data) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 模拟更新用户信息, data:', data)
    await mockDelay()
    // 更新 mockUserInfo（实际应该深拷贝）
    Object.assign(mockUserInfo, data)
    return true
  }
  
  console.log('[API] 调用真实接口更新用户信息')
  return request.put('/patient/profile', data)
}

/**
 * 获取就诊人列表
 */
export const getPatients = async () => {
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 就诊人数据')
    await mockDelay()
    return mockPatients
  }
  
  console.log('[API] 调用真实接口获取就诊人列表')
  return request.get('/patient/patients')
}

/**
 * 添加就诊人
 * @param {Object} data - 就诊人信息
 */
export const addPatient = async (data) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 模拟添加就诊人, data:', data)
    await mockDelay()
    
    // 生成新的就诊人
    const newPatient = {
      id: 'patient_' + Date.now(),
      ...data,
      isDefault: mockPatients.length === 0,  // 第一个就诊人设为默认
      createdAt: new Date().toISOString()
    }
    
    mockPatients.push(newPatient)
    return { id: newPatient.id }
  }
  
  console.log('[API] 调用真实接口添加就诊人')
  return request.post('/patient/patients', data)
}

/**
 * 更新就诊人
 * @param {String} patientId - 就诊人ID
 * @param {Object} data - 就诊人信息
 */
export const updatePatient = async (patientId, data) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 模拟更新就诊人, id:', patientId, 'data:', data)
    await mockDelay()
    
    const patient = mockPatients.find(p => p.id === patientId)
    if (patient) {
      Object.assign(patient, data)
    }
    return true
  }
  
  console.log('[API] 调用真实接口更新就诊人')
  return request.put(`/patient/patients/${patientId}`, data)
}

/**
 * 删除就诊人
 * @param {String} patientId - 就诊人ID
 */
export const deletePatient = async (patientId) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 模拟删除就诊人, id:', patientId)
    await mockDelay()
    
    const index = mockPatients.findIndex(p => p.id === patientId)
    if (index !== -1) {
      mockPatients.splice(index, 1)
    }
    return true
  }
  
  console.log('[API] 调用真实接口删除就诊人')
  return request.delete(`/patient/patients/${patientId}`)
}

/**
 * 获取健康档案
 */
export const getHealthRecords = async () => {
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 健康档案数据')
    await mockDelay()
    return mockHealthRecords
  }
  
  console.log('[API] 调用真实接口获取健康档案')
  return request.get('/patient/health-records')
}

/**
 * 获取检验报告
 * @param {Object} params - 查询参数
 */
export const getReports = async (params) => {
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 检验报告数据, params:', params)
    await mockDelay()
    
    // 模拟分页数据
    return {
      total: 0,
      list: []
    }
  }
  
  console.log('[API] 调用真实接口获取检验报告')
  return request.get('/patient/reports', params)
}

