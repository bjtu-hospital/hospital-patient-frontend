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
const USE_MOCK = false  // ← 暂时使用 Mock 数据，等待后端接口实现

// ==================== 用户信息相关 ====================

/**
 * 获取用户信息
 * @returns {Promise} 返回用户信息
 * 字段说明：
 * - identifier: 学号/工号（明文）
 * - idCard: 身份证号（已脱敏：前6位+8个星号+后4位）
 * - phone: 手机号（已脱敏：前3位+4个星号+后4位）
 */
export const getUserInfo = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockUserInfo)
  }
  // 调用多角色通用接口，返回患者信息
  return request.post('/auth/user-info').then(response => {
    // 后端返回 { patient: {...}, doctor: null }
    const patient = response.patient || {}
    
    // 映射字段名并返回
    return {
      id: patient.id,
      identifier: patient.identifier || '',          // 学号/工号（明文）
      idCard: patient.idCard || patient.id_card,     // 身份证（已脱敏）
      realName: patient.realName || patient.real_name,
      phonenumber: patient.phonenumber || patient.phone_number,
      gender: patient.gender,
      birthDate: patient.birthDate || patient.birth_date,
      age: patient.age,
      email: patient.email,
      avatar: patient.avatar,
      status: patient.status,
      riskScore: patient.riskScore || patient.risk_score,
      maskedInfo: patient.maskedInfo || {
        phone: patient.phonenumber,
        idCard: patient.idCard || patient.id_card
      }
    }
  })
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
 * @returns {Promise} 返回 { total, patients }
 * 后端返回: { code: 0, message: { total, patients: [...] } }
 */
export const getPatients = () => {
  if (USE_MOCK) {
    return Promise.resolve(mockPatients)  // 直接返回数组
  }
  
  return request.get('/patient/patients').then(response => {
    // 后端可能返回 { total, patients } 或 { message: { total, patients } }
    const data = response.message || response
    const patientList = data.patients || []
    
    // 映射字段名：patient.id_card -> idCard, phone_number -> phone 等
    const patients = patientList.map(item => ({
      id: item.relation_id,                    // 用relationId作为前端的主键id
      relationId: item.relation_id,
      patientId: item.patient.patient_id,
      name: item.patient.real_name,
      identifier: item.patient.identifier || '',
      idCard: item.patient.id_card || '',
      phone: item.patient.phone_number || '',
      gender: item.patient.gender || '未知',
      birthDate: item.patient.birth_date || '',
      age: item.patient.age || 0,
      relation: item.relation_type,            // 兼容前端使用的relation字段
      relationType: item.relation_type,
      isDefault: item.is_default || false,
      remark: item.remark || '',
      createdAt: item.create_time || item.created_at
    }))
    
    return patients  // 直接返回数组，与Mock数据格式保持一致
  })
}

/**
 * 添加就诊人
 * @param {Object} data - 就诊人信息
 * @param {String} data.name - 姓名（必填）
 * @param {String} data.idCard - 身份证号（必填，15或18位）
 * @param {String} data.relationType - 关系类型（必填：本人/父母/配偶/子女/其他）
 * @param {String} data.gender - 性别（可选：男/女/未知）
 * @param {String} data.birthDate - 出生日期（可选：YYYY-MM-DD）
 * @param {Boolean} data.isDefault - 是否默认（可选，默认false）
 * @param {String} data.remark - 备注（可选）
 * @returns {Promise} 返回新增结果
 */
export const addPatient = (data) => {
  if (USE_MOCK) {
    const newPatient = {
      relationId: Date.now(),
      patientId: Date.now() + 1,
      name: data.name,
      identifier: data.identifier || '',
      idCard: data.idCard,
      phone: data.phone || '',
      gender: data.gender || '未知',
      birthDate: data.birthDate || '',
      age: data.age || 0,
      relationType: data.relationType,
      isDefault: data.isDefault || mockPatients.length === 0,
      remark: data.remark || '',
      createdAt: new Date().toISOString()
    }
    
    mockPatients.push(newPatient)
    return Promise.resolve({
      relationId: newPatient.relationId,
      patientId: newPatient.patientId,
      message: '添加就诊人成功'
    })
  }
  
  // 映射前端字段到后端字段
  const requestData = {
    real_name: data.name,           // 姓名
    id_card: data.idCard,           // 身份证号
    phone_number: data.phone,       // 手机号（可能为空）
    identifier: data.identifier || null,  // 学号/工号（可能为空）
    gender: data.gender || '未知',
    birth_date: data.birthDate || null,
    relation_type: data.relationType,  // 关系类型
    is_default: data.isDefault || false,
    remark: data.remark || ''
  }
  
  console.log('添加就诊人请求数据:', requestData)
  
  return request.post('/patient/patients', requestData).then(response => {
    console.log('添加就诊人返回:', response)
    return response
  })
}

/**
 * 更新就诊人信息
 * @param {Number} patientId - 患者ID（patient_id）
 * @param {Object} data - 更新的信息
 * @param {String} data.relationType - 关系类型（可选）
 * @param {String} data.remark - 备注（可选）
 * @returns {Promise} 更新结果
 */
export const updatePatient = (patientId, data) => {
  if (USE_MOCK) {
    const patient = mockPatients.find(p => p.patientId === patientId)
    if (patient) {
      if (data.relationType) patient.relationType = data.relationType
      if (data.remark !== undefined) patient.remark = data.remark
    }
    return Promise.resolve({ message: '更新成功' })
  }
  
  // 映射字段
  const requestData = {
    relation_type: data.relationType,
    remark: data.remark
  }
  
  return request.put(`/patient/patients/${patientId}`, requestData)
}

/**
 * 删除就诊人
 * @param {Number} patientId - 患者ID（patient_id）
 * @returns {Promise} 删除结果
 * 注意：不能删除默认就诊人，需先取消默认
 */
export const deletePatient = (patientId) => {
  if (USE_MOCK) {
    const index = mockPatients.findIndex(p => p.patientId === patientId)
    if (index !== -1) {
      const patient = mockPatients[index]
      if (patient.isDefault) {
        return Promise.reject({ 
          code: 99, 
          message: '不能删除默认就诊人，请先取消默认设置' 
        })
      }
      mockPatients.splice(index, 1)
    }
    return Promise.resolve({ message: '删除成功' })
  }
  
  return request.delete(`/patient/patients/${patientId}`)
}

/**
 * 设置默认就诊人
 * @param {Number} patientId - 患者ID（patient_id）
 * @returns {Promise} 设置结果
 */
export const setDefaultPatient = (patientId) => {
  if (USE_MOCK) {
    // 取消所有默认标记
    mockPatients.forEach(p => p.isDefault = false)
    // 设置新的默认就诊人
    const patient = mockPatients.find(p => p.patientId === patientId)
    if (patient) {
      patient.isDefault = true
    }
    return Promise.resolve({ message: '设置成功' })
  }
  
  return request.put(`/patient/patients/${patientId}/set-default`)
}

/**
 * 获取默认就诊人
 * @returns {Promise} 返回默认就诊人信息，无默认时返回null
 */
export const getDefaultPatient = () => {
  if (USE_MOCK) {
    const defaultPatient = mockPatients.find(p => p.isDefault)
    return Promise.resolve(defaultPatient || null)
  }
  
  return request.get('/patient/patients/default').then(response => {
    if (!response) return null
    
    // 映射字段
    return {
      relationId: response.relation_id,
      patientId: response.patient.patient_id,
      name: response.patient.real_name,
      identifier: response.patient.identifier,
      idCard: response.patient.id_card,
      phone: response.patient.phone_number,
      gender: response.patient.gender,
      birthDate: response.patient.birth_date,
      age: response.patient.age,
      relationType: response.relation_type,
      isDefault: response.is_default,
      remark: response.remark,
      createdAt: response.create_time
    }
  })
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
