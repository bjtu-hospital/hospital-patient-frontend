/**
 * 预约流程相关的 Mock 数据
 */

// ==================== 医院数据 ====================
export const mockHospitals = [
  {
    id: 'hospital_001',
    name: '北京交通大学校医院（本部）',
    level: '三甲',
    type: '综合医院',
    address: '北京市西城区西直门南大街11号',
    image: '/static/logo.png',
    distance: 1.2,
    isOpen: true,
    departmentCount: 15,
    doctorCount: 48,
    availableSlots: 126
  },
  {
    id: 'hospital_002',
    name: '北京交通大学校医院（东校区）',
    level: '三甲',
    type: '综合医院',
    address: '北京市朝阳区平乐园100号',
    image: '/static/logo.png',
    distance: 8.5,
    isOpen: true,
    departmentCount: 8,
    doctorCount: 22,
    availableSlots: 64
  },
  {
    id: 'hospital_003',
    name: '北京交通大学校医院（通州）',
    level: '三甲',
    type: '综合医院',
    address: '北京市通州区潞县镇南凤一路39号院',
    image: '/static/logo.png',
    distance: 25.3,
    isOpen: true,
    departmentCount: 12,
    doctorCount: 35,
    availableSlots: 88
  },
  {
    id: 'hospital_004',
    name: '北京交通大学校医院(互联网)',
    level: '三甲',
    type: '',
    address: '',
    image: '/static/logo.png',
    distance: 0,
    isOpen: true,
    departmentCount: 5,
    doctorCount: 15,
    availableSlots: 50
  }
]

// ==================== 科室数据 ====================
export const mockDepartments = [
  // 内科
  { 
    id: 'dept_001', 
    hospitalId: 'hospital_001',
    name: '呼吸与危重症医学科门诊', 
    category: 'internal', 
    todaySlots: 8, 
    tomorrowSlots: 10, 
    priceRange: '¥15-50',
    description: '擅长治疗呼吸系统疾病、睡眠呼吸障碍等'
  },
  { 
    id: 'dept_002', 
    hospitalId: 'hospital_001',
    name: '呼吸睡眠医学科门诊（西直门）', 
    category: 'internal', 
    todaySlots: 6, 
    tomorrowSlots: 8, 
    priceRange: '¥15-50',
    description: '专注于睡眠呼吸障碍的诊断和治疗'
  },
  { 
    id: 'dept_003', 
    hospitalId: 'hospital_001',
    name: '消化内科门诊', 
    category: 'internal', 
    todaySlots: 10, 
    tomorrowSlots: 12, 
    priceRange: '¥15-50',
    description: '擅长消化系统疾病的诊治'
  },
  { 
    id: 'dept_004', 
    hospitalId: 'hospital_001',
    name: '肝病门诊（西直门院区）', 
    category: 'internal', 
    todaySlots: 5, 
    tomorrowSlots: 7, 
    priceRange: '¥15-50',
    description: '专业肝病诊疗'
  },
  { 
    id: 'dept_005', 
    hospitalId: 'hospital_001',
    name: '心内科门诊（西直门院区）', 
    category: 'internal', 
    todaySlots: 12, 
    tomorrowSlots: 15, 
    priceRange: '¥15-50',
    description: '心血管疾病诊疗中心'
  },
  { 
    id: 'dept_006', 
    hospitalId: 'hospital_001',
    name: '高血压科门诊(西直门)', 
    category: 'internal', 
    todaySlots: 25, 
    tomorrowSlots: 25, 
    priceRange: '¥15-50',
    description: '专业高血压管理'
  },
  { 
    id: 'dept_007', 
    hospitalId: 'hospital_001',
    name: '肾内科门诊', 
    category: 'internal', 
    todaySlots: 8, 
    tomorrowSlots: 9, 
    priceRange: '¥15-50',
    description: '肾脏疾病诊疗'
  },
  { 
    id: 'dept_008', 
    hospitalId: 'hospital_001',
    name: '血液科门诊', 
    category: 'internal', 
    todaySlots: 6, 
    tomorrowSlots: 8, 
    priceRange: '¥15-50',
    description: '血液系统疾病诊疗'
  },
  { 
    id: 'dept_009', 
    hospitalId: 'hospital_001',
    name: '内分泌科门诊', 
    category: 'internal', 
    todaySlots: 15, 
    tomorrowSlots: 18, 
    priceRange: '¥15-50',
    description: '糖尿病、甲状腺疾病等内分泌疾病诊疗'
  },
  
  // 外科
  { 
    id: 'dept_101', 
    hospitalId: 'hospital_001',
    name: '普通外科', 
    category: 'surgical', 
    todaySlots: 8, 
    tomorrowSlots: 10, 
    priceRange: '¥20-60',
    description: '普外科常见疾病诊疗'
  },
  { 
    id: 'dept_102', 
    hospitalId: 'hospital_001',
    name: '骨科门诊', 
    category: 'surgical', 
    todaySlots: 12, 
    tomorrowSlots: 15, 
    priceRange: '¥20-60',
    description: '骨折、关节疾病等骨科疾病诊疗'
  },
  { 
    id: 'dept_103', 
    hospitalId: 'hospital_001',
    name: '泌尿外科', 
    category: 'surgical', 
    todaySlots: 6, 
    tomorrowSlots: 8, 
    priceRange: '¥20-60',
    description: '泌尿系统疾病诊疗'
  },
  { 
    id: 'dept_104', 
    hospitalId: 'hospital_001',
    name: '神经外科', 
    category: 'surgical', 
    todaySlots: 5, 
    tomorrowSlots: 7, 
    priceRange: '¥20-80',
    description: '神经系统外科疾病诊疗'
  },
  
  // 妇产科
  { 
    id: 'dept_201', 
    hospitalId: 'hospital_001',
    name: '妇科门诊', 
    category: 'gynecology', 
    todaySlots: 15, 
    tomorrowSlots: 18, 
    priceRange: '¥25-60',
    description: '妇科常见病、多发病诊疗'
  },
  { 
    id: 'dept_202', 
    hospitalId: 'hospital_001',
    name: '产科门诊', 
    category: 'gynecology', 
    todaySlots: 10, 
    tomorrowSlots: 12, 
    priceRange: '¥25-60',
    description: '产前检查、孕期管理'
  },
  
  // 儿科
  { 
    id: 'dept_301', 
    hospitalId: 'hospital_001',
    name: '儿科门诊', 
    category: 'pediatrics', 
    todaySlots: 20, 
    tomorrowSlots: 25, 
    priceRange: '¥15-40',
    description: '儿童常见病诊疗'
  },
  { 
    id: 'dept_302', 
    hospitalId: 'hospital_001',
    name: '新生儿科', 
    category: 'pediatrics', 
    todaySlots: 8, 
    tomorrowSlots: 10, 
    priceRange: '¥15-40',
    description: '新生儿疾病诊疗'
  },
  
  // 五官科
  { 
    id: 'dept_401', 
    hospitalId: 'hospital_001',
    name: '眼科门诊', 
    category: 'ent', 
    todaySlots: 12, 
    tomorrowSlots: 15, 
    priceRange: '¥25-70',
    description: '眼科疾病诊疗'
  },
  { 
    id: 'dept_402', 
    hospitalId: 'hospital_001',
    name: '耳鼻喉科', 
    category: 'ent', 
    todaySlots: 10, 
    tomorrowSlots: 12, 
    priceRange: '¥25-60',
    description: '耳鼻喉疾病诊疗'
  },
  { 
    id: 'dept_403', 
    hospitalId: 'hospital_001',
    name: '口腔科', 
    category: 'ent', 
    todaySlots: 15, 
    tomorrowSlots: 18, 
    priceRange: '¥30-100',
    description: '口腔疾病诊疗'
  },
  
  // 中医科
  { 
    id: 'dept_501', 
    hospitalId: 'hospital_001',
    name: '中医内科', 
    category: 'tcm', 
    todaySlots: 8, 
    tomorrowSlots: 10, 
    priceRange: '¥20-50',
    description: '中医内科疾病诊疗'
  },
  { 
    id: 'dept_502', 
    hospitalId: 'hospital_001',
    name: '针灸科', 
    category: 'tcm', 
    todaySlots: 6, 
    tomorrowSlots: 8, 
    priceRange: '¥30-60',
    description: '针灸理疗'
  },
  
  // 皮科
  { 
    id: 'dept_601', 
    hospitalId: 'hospital_001',
    name: '皮肤科', 
    category: 'dermatology', 
    todaySlots: 12, 
    tomorrowSlots: 15, 
    priceRange: '¥25-60',
    description: '皮肤疾病诊疗'
  },
  
  // 其他科
  { 
    id: 'dept_701', 
    hospitalId: 'hospital_001',
    name: '心理咨询科', 
    category: 'other', 
    todaySlots: 5, 
    tomorrowSlots: 6, 
    priceRange: '¥80-200',
    description: '心理健康咨询与治疗'
  },
  { 
    id: 'dept_702', 
    hospitalId: 'hospital_001',
    name: '康复医学科', 
    category: 'other', 
    todaySlots: 8, 
    tomorrowSlots: 10, 
    priceRange: '¥40-100',
    description: '康复治疗'
  },
  
  // 术前管理中心
  { 
    id: 'dept_801', 
    hospitalId: 'hospital_001',
    name: '术前评估门诊', 
    category: 'preop', 
    todaySlots: 10, 
    tomorrowSlots: 12, 
    priceRange: '¥30-80',
    description: '术前综合评估'
  },
  
  // 国际医疗部
  { 
    id: 'dept_901', 
    hospitalId: 'hospital_001',
    name: '国际医疗门诊', 
    category: 'international', 
    todaySlots: 5, 
    tomorrowSlots: 6, 
    priceRange: '¥200-500',
    description: '国际标准医疗服务'
  },
  
  // ========== 东校区的科室 (hospital_002) ==========
  { 
    id: 'dept_1001', 
    hospitalId: 'hospital_002',
    name: '内科门诊', 
    category: 'internal', 
    todaySlots: 10, 
    tomorrowSlots: 12, 
    priceRange: '¥15-50',
    description: '内科常见疾病诊疗'
  },
  { 
    id: 'dept_1002', 
    hospitalId: 'hospital_002',
    name: '外科门诊', 
    category: 'surgical', 
    todaySlots: 8, 
    tomorrowSlots: 10, 
    priceRange: '¥20-60',
    description: '外科常见疾病诊疗'
  },
  { 
    id: 'dept_1003', 
    hospitalId: 'hospital_002',
    name: '儿科门诊', 
    category: 'pediatrics', 
    todaySlots: 15, 
    tomorrowSlots: 18, 
    priceRange: '¥15-40',
    description: '儿童常见病诊疗'
  },
  { 
    id: 'dept_1004', 
    hospitalId: 'hospital_002',
    name: '眼科门诊', 
    category: 'ent', 
    todaySlots: 10, 
    tomorrowSlots: 12, 
    priceRange: '¥25-70',
    description: '眼科疾病诊疗'
  },
  
  // ========== 通州院区的科室 (hospital_003) ==========
  { 
    id: 'dept_2001', 
    hospitalId: 'hospital_003',
    name: '内科门诊', 
    category: 'internal', 
    todaySlots: 12, 
    tomorrowSlots: 15, 
    priceRange: '¥15-50',
    description: '内科常见疾病诊疗'
  },
  { 
    id: 'dept_2002', 
    hospitalId: 'hospital_003',
    name: '外科门诊', 
    category: 'surgical', 
    todaySlots: 10, 
    tomorrowSlots: 12, 
    priceRange: '¥20-60',
    description: '外科常见疾病诊疗'
  },
  { 
    id: 'dept_2003', 
    hospitalId: 'hospital_003',
    name: '妇科门诊', 
    category: 'gynecology', 
    todaySlots: 12, 
    tomorrowSlots: 15, 
    priceRange: '¥25-60',
    description: '妇科常见病、多发病诊疗'
  },
  { 
    id: 'dept_2004', 
    hospitalId: 'hospital_003',
    name: '口腔科', 
    category: 'ent', 
    todaySlots: 12, 
    tomorrowSlots: 15, 
    priceRange: '¥30-100',
    description: '口腔疾病诊疗'
  },
  { 
    id: 'dept_2005', 
    hospitalId: 'hospital_003',
    name: '中医内科', 
    category: 'tcm', 
    todaySlots: 8, 
    tomorrowSlots: 10, 
    priceRange: '¥20-50',
    description: '中医内科疾病诊疗'
  },
  
  // ========== 互联网医院的科室 (hospital_004) ==========
  { 
    id: 'dept_3001', 
    hospitalId: 'hospital_004',
    name: '在线问诊', 
    category: 'other', 
    todaySlots: 20, 
    tomorrowSlots: 20, 
    priceRange: '¥30-100',
    description: '在线视频问诊服务'
  },
  { 
    id: 'dept_3002', 
    hospitalId: 'hospital_004',
    name: '健康咨询', 
    category: 'other', 
    todaySlots: 15, 
    tomorrowSlots: 15, 
    priceRange: '¥20-50',
    description: '在线健康咨询'
  }
]

// ==================== 生成动态日期的排班数据 ====================
// 生成未来7天的日期字符串
const generateFutureDates = () => {
  const dates = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
  }
  
  return dates
}

// 生成排班数据（简化版，确保兼容性）
const generateMockSchedules = () => {
  const dates = generateFutureDates()
  const schedules = []
  let scheduleId = 1
  
  // 为每一天生成排班数据
  for (let index = 0; index < dates.length; index++) {
    const date = dates[index]
    // ========== 心内科 (dept_005) - 每天都有 ==========
    // 普通门诊 - 上午
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_001',
      doctorName: '刘靖',
      doctorTitle: '主治医师',
      departmentId: 'dept_005',
      date: date,
      period: '上午',
      startTime: '08:00',
      endTime: '12:00',
      appointmentType: '普通',
      type: 'normal',
      price: 50,
      availableSlots: index === 0 ? 5 : 20,  // 今天少，其他天多
      totalSlots: 25
    })
    
    // 普通门诊 - 下午
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_002',
      doctorName: '王鲁雁',
      doctorTitle: '副主任医师',
      departmentId: 'dept_005',
      date: date,
      period: '下午',
      startTime: '14:00',
      endTime: '17:00',
      appointmentType: '普通',
      type: 'normal',
      price: 50,
      availableSlots: index === 0 ? 8 : 18,
      totalSlots: 20
    })
    
    // 专家门诊 - 每天都有
    if (index % 2 === 0) {  // 隔天有专家门诊
      schedules.push({
        id: `schedule_${scheduleId++}`,
        doctorId: 'doctor_008',
        doctorName: '李主任',
        doctorTitle: '主任医师',
        departmentId: 'dept_005',
        date: date,
        period: '上午',
        startTime: '08:00',
        endTime: '12:00',
        appointmentType: '专家',
        type: 'expert',
        price: 100,
        availableSlots: 12,
        totalSlots: 15
      })
    }
    
    // 特需门诊 - 周一、周三、周五有
    if (index % 3 === 1) {
      schedules.push({
        id: `schedule_${scheduleId++}`,
        doctorId: 'doctor_009',
        doctorName: '王教授',
        doctorTitle: '主任医师',
        departmentId: 'dept_005',
        date: date,
        period: '下午',
        startTime: '14:00',
        endTime: '17:00',
        appointmentType: '特需',
        type: 'expert',
        price: 200,
        availableSlots: 8,
        totalSlots: 10
      })
    }
    
    // ========== 高血压科 (dept_006) - 每天都有 ==========
    // 普通门诊
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_004',
      doctorName: '孙宁玲',
      doctorTitle: '主任医师',
      departmentId: 'dept_006',
      date: date,
      period: '上午',
      startTime: '08:00',
      endTime: '12:00',
      appointmentType: '普通',
      type: 'normal',
      price: 50,
      availableSlots: 22,
      totalSlots: 30
    })
    
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_005',
      doctorName: '王鸿懿',
      doctorTitle: '副主任医师',
      departmentId: 'dept_006',
      date: date,
      period: '下午',
      startTime: '14:00',
      endTime: '17:00',
      appointmentType: '普通',
      type: 'normal',
      price: 50,
      availableSlots: 18,
      totalSlots: 25
    })
    
    // 专病门诊 - 每天都有
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_010',
      doctorName: '高血压出院随访门诊',
      doctorTitle: '专病门诊',
      departmentId: 'dept_006',
      date: date,
      period: '上午',
      startTime: '08:00',
      endTime: '12:00',
      appointmentType: '专病',
      type: 'special',
      price: 50,
      availableSlots: 15,
      totalSlots: 20
    })
    
    // ========== 呼吸睡眠医学科 (dept_002) - 每天都有 ==========
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_003',
      doctorName: '喜杨',
      doctorTitle: '主治医师',
      departmentId: 'dept_002',
      date: date,
      period: '上午',
      startTime: '08:00',
      endTime: '12:00',
      appointmentType: '普通',
      type: 'normal',
      price: 50,
      availableSlots: 16,
      totalSlots: 20
    })
    
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_006',
      doctorName: '陈源源',
      doctorTitle: '主治医师',
      departmentId: 'dept_002',
      date: date,
      period: '下午',
      startTime: '14:00',
      endTime: '17:00',
      appointmentType: '普通',
      type: 'normal',
      price: 50,
      availableSlots: 14,
      totalSlots: 18
    })
    
    // ========== 消化内科 (dept_003) - 隔天有 ==========
    if (index % 2 === 0) {
      schedules.push({
        id: `schedule_${scheduleId++}`,
        doctorId: 'doctor_007',
        doctorName: '张医生',
        doctorTitle: '主治医师',
        departmentId: 'dept_003',
        date: date,
        period: '上午',
        startTime: '08:00',
        endTime: '12:00',
        appointmentType: '普通',
        type: 'normal',
        price: 50,
        availableSlots: 20,
        totalSlots: 25
      })
    }
    
    // ========== 内分泌科 (dept_009) - 每天都有 ==========
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_012',
      doctorName: '赵医生',
      doctorTitle: '副主任医师',
      departmentId: 'dept_009',
      date: date,
      period: '上午',
      startTime: '08:00',
      endTime: '12:00',
      appointmentType: '普通',
      type: 'normal',
      price: 50,
      availableSlots: 18,
      totalSlots: 22
    })
    
    // ========== 国际医疗部 (dept_901) - 每天都有 ==========
    // 国际医疗门诊 - 专家
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_013',
      doctorName: '李国际',
      doctorTitle: '主任医师',
      departmentId: 'dept_901',
      date: date,
      period: '上午',
      startTime: '08:00',
      endTime: '12:00',
      appointmentType: '国际医疗部',
      type: 'expert',
      price: 300,
      availableSlots: 8,
      totalSlots: 10
    })
    
    schedules.push({
      id: `schedule_${scheduleId++}`,
      doctorId: 'doctor_014',
      doctorName: '王国际',
      doctorTitle: '副主任医师',
      departmentId: 'dept_901',
      date: date,
      period: '下午',
      startTime: '14:00',
      endTime: '17:00',
      appointmentType: '国际医疗部',
      type: 'expert',
      price: 300,
      availableSlots: 6,
      totalSlots: 8
    })
    
    // ========== 妇产科 (dept_201) - 隔天有 ==========
    if (index % 2 === 1) {
      schedules.push({
        id: `schedule_${scheduleId++}`,
        doctorId: 'doctor_015',
        doctorName: '妊娠相关高血压专业门诊',
        doctorTitle: '专病门诊',
        departmentId: 'dept_201',
        date: date,
        period: '下午',
        startTime: '14:00',
        endTime: '17:00',
        appointmentType: '专病',
        type: 'special',
        price: 60,
        availableSlots: 10,
        totalSlots: 15
      })
    }
  }
  
  return schedules
}

// 导出动态生成的排班数据
export const mockSchedules = generateMockSchedules()

// ==================== 医生信息数据 ====================
export const mockDoctors = [
  {
    id: 'doctor_001',
    name: '刘靖',
    title: '主治医师',
    avatar: '/static/logo.png',
    departmentId: 'dept_005',
    departmentName: '心内科',
    specialty: '擅长心血管疾病、高血压、冠心病的诊断和治疗',
    experience: '从医15年',
    rating: 4.8,
    patientCount: 1234
  },
  {
    id: 'doctor_007',
    name: '张医生',
    title: '主治医师',
    avatar: '/static/logo.png',
    departmentId: 'dept_005',
    departmentName: '心内科',
    specialty: '擅长心血管疾病治疗，从医12年',
    experience: '从医12年',
    rating: 4.7,
    patientCount: 980
  },
  {
    id: 'doctor_008',
    name: '李主任',
    title: '主任医师',
    avatar: '/static/logo.png',
    departmentId: 'dept_005',
    departmentName: '心内科',
    specialty: '心血管疾病专家，擅长冠心病、心律失常的诊治',
    experience: '从医25年',
    rating: 4.9,
    patientCount: 3456
  }
]

