/**
 * 健康档案相关接口
 */
import request from './request'
import { getUserInfo } from './user'
import { mockHealthData, calculateAge } from '@/pages/profile/health/health-mock'

// 统一的 Mock 开关（默认关闭，使用真实接口）
const USE_MOCK = false

/**
 * 获取我的健康档案
 * @returns {Promise} 返回健康档案数据
 * 后端返回格式：{code: 0, message: {patientId, basicInfo, medicalHistory, consultationRecords}}
 * request.js 响应拦截器会自动提取 message 字段并返回
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
  // request.js 会自动提取 {code: 0, message: {...}} 中的 message 字段
  return request.get('/patient/health-record')
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
  
  // 真实接口：GET /common/visit-record/{visit_id}
  // 后端返回格式：{ basicInfo: {...}, recordData: {...} }
  return request.get(`/common/visit-record/${recordId}`)
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
 * @deprecated 后端没有单独的就诊记录列表接口，就诊记录已包含在 getMyHealthRecord 的 consultationRecords 字段中
 */
export const getMyVisitRecords = (params = {}) => {
  console.warn('⚠️ getMyVisitRecords 已废弃，请使用 getMyHealthRecord 获取就诊记录')
  
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
  
  // ❌ 后端没有此接口，返回空列表避免 404 错误
  return Promise.resolve({
    total: 0,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    list: []
  })
}
