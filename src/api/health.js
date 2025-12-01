/**
 * 健康档案相关接口
 */
import request from './request'
import { getUserInfo } from './user'

// 是否使用 Mock 数据
const USE_MOCK = true  // ← 先使用 Mock 数据测试，但会融合真实用户信息

// Mock 数据
const mockHealthData = {
  patientId: '123456',
  basicInfo: {
    name: '张三',
    gender: '男',
    age: 35,
    height: 175,
    weight: 70,
    phone: '138****5678',
    idCard: '110101********1234',
    address: '北京市海淀区学院路37号北京交通大学',
    bloodType: 'A型',
    maritalStatus: '已婚'
  },
  medicalHistory: {
    pastHistory: [
      '2020年患急性阑尾炎，已手术治疗',
      '2018年患轻度高血压，正在药物控制中'
    ],
    allergyHistory: [
      '青霉素过敏',
      '海鲜过敏（虾、蟹）'
    ],
    familyHistory: [
      '父亲患有高血压',
      '母亲患有糖尿病'
    ]
  },
  consultationRecords: [
    {
      id: '1',
      outpatientNo: '061651734',
      visitDate: '2025-07-05 09:04',
      department: '全科医学科(综合内科)门诊',
      doctorName: '姜岚',
      chiefComplaint: '胆红素代谢紊乱史',
      presentIllness: '胆红素代谢紊乱史，来诊复查化验',
      auxiliaryExam: '2025-04-25 13:07，常规生化，肝功4白蛋白/球蛋白 2.56；*直接胆红素 8.7*umol/L；',
      diagnosis: '胆红素代谢紊乱',
      prescription: '1.全血细胞计数+5分类\n2.凝血分析\n3.生化23',
      status: 'completed',
      pdfUrl: 'https://pdfobject.com/pdf/sample.pdf'
    },
    {
      id: '2',
      outpatientNo: '061651735',
      visitDate: '2025-06-15 14:30',
      department: '心血管内科门诊',
      doctorName: '李医生',
      chiefComplaint: '胸闷、气短3天',
      presentIllness: '患者3天前无明显诱因出现胸闷、气短，活动后加重，休息后缓解',
      auxiliaryExam: '心电图：窦性心律，ST段轻度压低',
      diagnosis: '冠心病',
      prescription: '阿司匹林肠溶片 100mg qd\\n阿托伐他汀钙片 20mg qn',
      status: 'completed',
      pdfUrl: 'https://pdfobject.com/pdf/sample.pdf'
    },
    {
      id: '3',
      outpatientNo: '061651736',
      visitDate: '2025-05-10 10:15',
      department: '呼吸内科门诊',
      doctorName: '王医生',
      chiefComplaint: '咳嗽、咳痰1周',
      presentIllness: '患者1周前受凉后出现咳嗽、咳痰，痰白色，量中等',
      auxiliaryExam: '胸部X线：双肺纹理增粗',
      diagnosis: '急性支气管炎',
      prescription: '头孢克肟胶囊 0.1g bid\n氨溴索口服液 30ml tid',
      status: 'completed'
    }
  ]
}

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
          height: mockHealthData.basicInfo.height,  // 暂时用 Mock
          weight: mockHealthData.basicInfo.weight,  // 暂时用 Mock
          phone: userInfo.maskedInfo?.phone || userInfo.phonenumber,
          idCard: userInfo.maskedInfo?.idCard || userInfo.idCard,
          address: mockHealthData.basicInfo.address,  // 暂时用 Mock
          bloodType: mockHealthData.basicInfo.bloodType,  // 暂时用 Mock
          maritalStatus: mockHealthData.basicInfo.maritalStatus  // 暂时用 Mock
        }
      }
      
      return Promise.resolve(realHealthData)
    } catch (error) {
      console.warn('获取用户信息失败，使用纯 Mock 数据:', error)
      return Promise.resolve(mockHealthData)
    }
  }
  
  // 真实接口：从 Token 中获取当前患者ID
  return request.get('/patient/profile/health').then(response => {
    // 后端返回格式与医生端查看患者详情一致
    return response
  })
}

/**
 * 计算年龄
 * @param {String} birthDate - 出生日期 YYYY-MM-DD
 * @returns {Number} 年龄
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return null
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
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
 * @returns {Promise}
 */
export const getMedicalRecordDetail = (recordId) => {
  if (USE_MOCK) {
    const record = mockHealthData.consultationRecords.find(r => r.id === recordId)
    return Promise.resolve(record)
  }
  
  // 使用通用接口获取就诊记录详情
  return request.get(`/common/visit-record/${recordId}`)
}

/**
 * 生成病历单PDF
 * @param {String} visitId - 就诊记录ID
 * @returns {Promise} 返回 { url, filename, expireTime }
 */
export const generateMedicalRecordPDF = (visitId) => {
  if (USE_MOCK) {
    console.log('Mock: 生成病历PDF', visitId)
    return Promise.resolve({
      url: 'https://pdfobject.com/pdf/sample.pdf',
      filename: `病历单_${visitId}.pdf`,
      expireTime: new Date(Date.now() + 3600000).toISOString() // 1小时后过期
    })
  }
  
  return request.post(`/common/medical-record/${visitId}/pdf`)
}

/**
 * 下载病历单PDF
 * @param {String} visitId - 就诊记录ID
 * @returns {Promise} 返回PDF文件流
 */
export const downloadMedicalRecordPDF = (visitId) => {
  if (USE_MOCK) {
    console.log('Mock: 下载病历PDF', visitId)
    // Mock 环境下打开示例PDF
    window.open('https://pdfobject.com/pdf/sample.pdf', '_blank')
    return Promise.resolve()
  }
  
  // 直接返回下载URL，由浏览器处理下载
  const downloadUrl = `${request.baseURL}/common/medical-record/${visitId}/download`
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
