/**
 * 健康档案 Mock 数据
 */

// 基本信息记录
export const mockBasicRecords = [
  {
    id: 'basic_001',
    date: '2024-11-15',
    height: 175,
    weight: 70,
    bloodType: 'A型',
    allergies: ['青霉素', '海鲜']
  },
  {
    id: 'basic_002',
    date: '2024-10-15',
    height: 175,
    weight: 72,
    bloodType: 'A型',
    allergies: ['青霉素']
  }
]

// 体检报告记录
export const mockCheckupRecords = [
  {
    id: 'checkup_001',
    date: '2024-10-28',
    checkupType: '年度体检',
    hospital: '北交大校医院',
    result: 'normal'
  },
  {
    id: 'checkup_002',
    date: '2024-09-15',
    checkupType: '入学体检',
    hospital: '北交大校医院',
    result: 'normal'
  }
]

// 用药记录
export const mockMedicationRecords = [
  {
    id: 'med_001',
    date: '2024-11-10',
    medicationName: '感冒药',
    dosage: '每日3次，每次1片',
    duration: '5天'
  },
  {
    id: 'med_002',
    date: '2024-10-20',
    medicationName: '消炎药',
    dosage: '每日2次，每次2片',
    duration: '7天'
  }
]

// 视力档案记录
export const mockVisionRecords = [
  {
    id: 'vision_001',
    date: '2024-11-01',
    leftEye: '4.8',
    rightEye: '4.9',
    recommendation: '无需矫正'
  },
  {
    id: 'vision_002',
    date: '2024-09-10',
    leftEye: '4.8',
    rightEye: '4.9',
    recommendation: '无需矫正'
  }
]

// 疫苗接种记录
export const mockVaccinationRecords = [
  {
    id: 'vac_001',
    date: '2024-11-05',
    vaccineName: '新冠疫苗',
    batch: 'ABC123456',
    nextDue: '2025-05-05'
  },
  {
    id: 'vac_002',
    date: '2024-10-15',
    vaccineName: '流感疫苗',
    batch: 'DEF789012',
    nextDue: '2025-10-15'
  }
]

// 所有记录数据库
export const mockHealthRecordsDatabase = {
  basic: mockBasicRecords,
  checkup: mockCheckupRecords,
  medication: mockMedicationRecords,
  vision: mockVisionRecords,
  vaccination: mockVaccinationRecords
}

// 记录详情数据库
export const mockRecordDetailsDatabase = {
  basic_001: {
    date: '2024-11-15',
    height: 175,
    weight: 70,
    bloodType: 'A型',
    allergies: ['青霉素', '海鲜'],
    notes: '最近体重有所下降，建议加强锻炼'
  },
  checkup_001: {
    date: '2024-10-28',
    checkupType: '年度体检',
    hospital: '北交大校医院',
    result: '正常',
    notes: '各项指标均在正常范围内，继续保持健康生活方式',
    attachments: [
      { name: '体检报告.pdf', size: 2048000 }
    ]
  },
  med_001: {
    date: '2024-11-10',
    medicationName: '感冒药',
    dosage: '每日3次，每次1片',
    duration: '5天',
    reason: '感冒',
    notes: '饭后服用，避免空腹'
  },
  vision_001: {
    date: '2024-11-01',
    leftEye: '4.8',
    rightEye: '4.9',
    recommendation: '无需矫正',
    notes: '视力保持良好，继续定期检查'
  },
  vac_001: {
    date: '2024-11-05',
    vaccineName: '新冠疫苗',
    batch: 'ABC123456',
    nextDue: '2025-05-05',
    notes: '接种后无不良反应'
  }
}

// 分类配置
export const mockCategoryConfig = {
  basic: {
    name: '基本信息',
    description: '身高体重、血型等基础信息',
    icon: 'paperplane-filled',
    color: '#3b82f6'
  },
  checkup: {
    name: '体检报告',
    description: '年度体检、入学体检等',
    icon: 'compose',
    color: '#8b5cf6'
  },
  medication: {
    name: '用药记录',
    description: '处方记录、药物过敏史',
    icon: 'shop-filled',
    color: '#ec4899'
  },
  vision: {
    name: '视力档案',
    description: '视力检查、配镜记录',
    icon: 'eye-filled',
    color: '#f59e0b'
  },
  vaccination: {
    name: '疫苗接种',
    description: '疫苗接种记录',
    icon: 'heart-filled',
    color: '#10b981'
  }
}

// 健康数据
export const mockHealthData = {
  basicRecords: mockBasicRecords,
  checkupRecords: mockCheckupRecords,
  medicationRecords: mockMedicationRecords,
  visionRecords: mockVisionRecords,
  vaccinationRecords: mockVaccinationRecords,
  recordsDatabase: mockHealthRecordsDatabase,
  recordDetails: mockRecordDetailsDatabase,
  categoryConfig: mockCategoryConfig
}

// 获取分类记录
export const getCategoryRecords = (category) => {
  return mockHealthRecordsDatabase[category] || []
}

// 获取记录详情
export const getRecordDetail = (recordId) => {
  return mockRecordDetailsDatabase[recordId] || {}
}

// 获取分类配置
export const getCategoryConfig = (category) => {
  return mockCategoryConfig[category] || {}
}
