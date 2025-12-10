/**
 * 健康档案相关接口
 */
import request from './request'
import { getUserInfo } from './user'
import { mockHealthData, calculateAge } from '@/pages/profile/health/health-mock'

// 统一的 Mock 开关（默认关闭，使用真实接口）
const USE_MOCK = false

const ensureObject = (value) => (value && typeof value === 'object' ? value : {})
const ensureArray = (value) => (Array.isArray(value) ? value : [])
const normalizeMedicalHistory = (history = {}) => ({
  pastHistory: ensureArray(history.pastHistory),
  allergyHistory: ensureArray(history.allergyHistory),
  familyHistory: ensureArray(history.familyHistory)
})
const normalizeHealthRecord = (record = {}) => ({
  ...record,
  basicInfo: ensureObject(record.basicInfo),
  medicalHistory: normalizeMedicalHistory(record.medicalHistory),
  consultationRecords: ensureArray(record.consultationRecords)
})

/**
 * 获取我的健康档案
 * @returns {Promise} 返回健康档案数据
 */
export const getMyHealthRecord = async () => {
  if (USE_MOCK) {
    // 获取真实的用户信息
    try {
      const userInfo = await getUserInfo()
      
      // 融合真实用户信息和 Mock 病历数据
      const realHealthData = {
        ...mockHealthData,
        patientId: userInfo.id,
        basicInfo: {
          name: userInfo.realName || '未设置',
          gender: userInfo.gender || '未知',
          age: userInfo.age || calculateAge(userInfo.birthDate),
          height: mockHealthData.basicInfo.height,
          weight: mockHealthData.basicInfo.weight,
          phone: userInfo.maskedInfo?.phone || userInfo.phonenumber,
          idCard: userInfo.maskedInfo?.idCard || userInfo.idCard,
          address: mockHealthData.basicInfo.address,
          bloodType: mockHealthData.basicInfo.bloodType,
          maritalStatus: mockHealthData.basicInfo.maritalStatus
        }
      }
      
      return Promise.resolve(realHealthData)
    } catch (error) {
      console.warn('获取用户信息失败，使用纯 Mock 数据:', error)
      return Promise.resolve(mockHealthData)
    }
  }
  
  // 真实接口：GET /patient/health-record
  const response = await request.get('/patient/health-record')
  return normalizeHealthRecord(response)
}

/**
 * 更新基本信息
 * @param {Object} data - 基本信息
 * @returns {Promise}
 */
export const updateBasicInfo = (data) => {
  if (USE_MOCK) {
    console.log('Mock: 更新基本信息', data)
    return Promise.resolve({ success: true })
  }
  
  return request.put('/patient/profile/basic-info', data)
}

/**
 * 获取病历详情
 * @param {String} recordId - 病历ID（visit_id）
 * @returns {Promise} 返回 { basicInfo, recordData }
 */
export const getMedicalRecordDetail = (recordId) => {
  if (USE_MOCK) {
    const record = mockHealthData.consultationRecords.find(r => r.id === recordId)
    return Promise.resolve(record)
  }
  
  // 真实接口：GET /patient/visit-record/{visitId}
  // 后端返回格式：{ basicInfo: {...}, recordData: {...} }
  return request.get(`/patient/visit-record/${recordId}`)
}

/**
 * 生成病历单PDF
 * @param {String} visitId - 就诊记录ID
 * @returns {Promise} 返回 { url, filename, expireTime }
 */
export const generateMedicalRecordPDF = (visitId) => {
  // ✅ 使用真实接口：POST /common/medical-record/{visit_id}/pdf
  return request.post(`/common/medical-record/${visitId}/pdf`)
}

/**
 * 下载病历单PDF
 * @param {String} visitId - 就诊记录ID
 * @returns {Promise<string>} 返回PDF下载URL
 */
export const downloadMedicalRecordPDF = (visitId) => {
  // ✅ 使用真实接口：GET /common/medical-record/{visit_id}/download
  // 构建完整的下载URL（带token）
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const token = uni.getStorageSync('token')
  const downloadUrl = `${BASE_URL}/common/medical-record/${visitId}/download?token=${token}`
  return Promise.resolve(downloadUrl)
}

/**
 * 获取我的就诊记录列表
 * @param {Object} params - 查询参数 { page, pageSize }
 * @returns {Promise} 返回就诊记录列表
 */
export const getMyVisitRecords = (params = {}) => {
  if (USE_MOCK) {
    // 返回 Mock 的就诊记录
    const { page = 1, pageSize = 10 } = params
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return Promise.resolve({
      total: mockHealthData.consultationRecords.length,
      page,
      pageSize,
      list: mockHealthData.consultationRecords.slice(start, end)
    })
  }
  
  // 真实接口：获取患者自己的就诊记录
  return request.get('/patient/visit-records', {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  })
}
