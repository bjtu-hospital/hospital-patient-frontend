/**
 * 医生科室查询模块的 Mock 数据
 */

// ==================== 医院数据 ====================
export const MOCK_HOSPITALS = [
  {
    area_id: 1,
    name: '中央党校院区',
    level: '三甲',
    type: '综合医院',
    destination: '北京市海淀区大有庄100号',
    image: '/static/hospital-1.png',
    distance: 1.2,
    isOpen: true,
    departmentCount: 15,
    doctorCount: 48,
    availableSlots: 126
  },
  {
    area_id: 2,
    name: '北京大学第三医院本部',
    level: '三甲',
    type: '综合医院',
    destination: '北京市海淀区花园北路49号',
    image: '/static/hospital-2.png',
    distance: 3.5,
    isOpen: true,
    departmentCount: 20,
    doctorCount: 85,
    availableSlots: 210
  },
  {
    area_id: 3,
    name: '北方院区',
    level: '三甲',
    type: '综合医院',
    destination: '北京市海淀区车道沟10号',
    image: '/static/hospital-3.png',
    distance: 5.8,
    isOpen: true,
    departmentCount: 12,
    doctorCount: 42,
    availableSlots: 95
  },
  {
    area_id: 4,
    name: '机场院区',
    level: '三甲',
    type: '综合医院',
    destination: '北京市朝阳区岗山路9号',
    image: '/static/hospital-4.png',
    distance: 15.3,
    isOpen: true,
    departmentCount: 8,
    doctorCount: 28,
    availableSlots: 68
  },
  {
    area_id: 5,
    name: '海淀北部院区',
    level: '三甲',
    type: '综合医院',
    destination: '北京市海淀区六里屯南路6号院1号楼',
    image: '/static/hospital-5.png',
    distance: 12.7,
    isOpen: true,
    departmentCount: 10,
    doctorCount: 35,
    availableSlots: 82
  },
  {
    area_id: 6,
    name: '第二门诊部',
    level: '三甲',
    type: '综合医院',
    destination: '北京市海淀区育新花园小区23号楼',
    image: '/static/hospital-6.png',
    distance: 2.1,
    isOpen: true,
    departmentCount: 6,
    doctorCount: 22,
    availableSlots: 54
  }
]

// ==================== 科室分类数据 ====================
export const MOCK_CATEGORIES = [
  { major_dept_id: 1, name: '内科系统', icon: 'heart', description: '心血管、呼吸、消化等内科疾病' },
  { major_dept_id: 2, name: '外科系统', icon: 'scalpel', description: '普通外科、骨科、神经外科等' },
  { major_dept_id: 3, name: '医技科室', icon: 'microscope', description: '检验、影像、病理等' }
]

// ==================== 科室数据 ====================
export const MOCK_DEPARTMENTS = [
  // 内科系统 - 中央党校院区 (area_id: 1)
  { 
    minor_dept_id: 1, 
    name: '心血管内科', 
    description: '负责心血管疾病的内科诊疗，包括冠心病、高血压、心律失常等',
    major_dept_id: 1, 
    area_id: 1,
    create_time: '2025-10-16 08:24:37',
    today_slots: 15,
    tomorrow_slots: 18,
    price_range: '¥25-80'
  },
  { 
    minor_dept_id: 2, 
    name: '呼吸内科', 
    description: '呼吸系统疾病诊疗，擅长肺炎、哮喘、慢阻肺等',
    major_dept_id: 1, 
    area_id: 1,
    create_time: '2025-10-16 08:25:12',
    today_slots: 12,
    tomorrow_slots: 15,
    price_range: '¥20-60'
  },
  { 
    minor_dept_id: 3, 
    name: '消化内科', 
    description: '消化系统疾病诊疗，擅长胃肠镜检查和治疗',
    major_dept_id: 1, 
    area_id: 1,
    create_time: '2025-10-16 08:26:05',
    today_slots: 10,
    tomorrow_slots: 12,
    price_range: '¥20-50'
  },
  
  // 外科系统 - 中央党校院区 (area_id: 1)
  { 
    minor_dept_id: 4, 
    name: '普通外科', 
    description: '普外科常见疾病诊疗，包括甲状腺、乳腺、胃肠疾病',
    major_dept_id: 2, 
    area_id: 1,
    create_time: '2025-10-16 08:30:45',
    today_slots: 18,
    tomorrow_slots: 20,
    price_range: '¥30-100'
  },
  { 
    minor_dept_id: 5, 
    name: '骨科', 
    description: '骨折、关节疾病等骨科疾病诊疗，擅长微创手术',
    major_dept_id: 2, 
    area_id: 1,
    create_time: '2025-10-16 08:32:18',
    today_slots: 15,
    tomorrow_slots: 18,
    price_range: '¥35-120'
  },
  
  // 医技科室 - 中央党校院区 (area_id: 1)
  { 
    minor_dept_id: 6, 
    name: '放射科', 
    description: 'X光、CT、MRI等影像学检查',
    major_dept_id: 3, 
    area_id: 1,
    create_time: '2025-10-16 08:35:27',
    today_slots: 20,
    tomorrow_slots: 25,
    price_range: '¥100-500'
  },
  { 
    minor_dept_id: 7, 
    name: '检验科', 
    description: '血液、尿液、生化等各项检验',
    major_dept_id: 3, 
    area_id: 1,
    create_time: '2025-10-16 08:36:44',
    today_slots: 30,
    tomorrow_slots: 35,
    price_range: '¥50-300'
  },
  
  // 北京大学第三医院本部的科室
  { 
    minor_dept_id: 8, 
    name: '心血管内科', 
    description: '心血管疾病诊疗中心，擅长冠心病介入治疗',
    major_dept_id: 1, 
    area_id: 2,
    create_time: '2025-10-16 08:40:15',
    today_slots: 25,
    tomorrow_slots: 30,
    price_range: '¥30-100'
  },
  { 
    minor_dept_id: 9, 
    name: '神经内科', 
    description: '神经系统疾病诊疗，擅长脑血管病、癫痫等',
    major_dept_id: 1, 
    area_id: 2,
    create_time: '2025-10-16 08:41:33',
    today_slots: 18,
    tomorrow_slots: 22,
    price_range: '¥35-120'
  },
  { 
    minor_dept_id: 10, 
    name: '泌尿外科', 
    description: '泌尿系统疾病外科诊疗',
    major_dept_id: 2, 
    area_id: 2,
    create_time: '2025-10-16 08:42:59',
    today_slots: 12,
    tomorrow_slots: 15,
    price_range: '¥40-150'
  },
  { 
    minor_dept_id: 11, 
    name: '超声科', 
    description: '超声检查与诊断',
    major_dept_id: 3, 
    area_id: 2,
    create_time: '2025-10-16 08:45:22',
    today_slots: 25,
    tomorrow_slots: 30,
    price_range: '¥80-200'
  },
  
  // 其他医院的简单数据
  { 
    minor_dept_id: 12, 
    name: '内科门诊', 
    description: '内科常见疾病诊疗',
    major_dept_id: 1, 
    area_id: 3,
    create_time: '2025-10-16 08:46:38',
    today_slots: 10,
    tomorrow_slots: 12,
    price_range: '¥20-60'
  },
  { 
    minor_dept_id: 13, 
    name: '外科门诊', 
    description: '外科常见疾病诊疗',
    major_dept_id: 2, 
    area_id: 3,
    create_time: '2025-10-16 08:47:52',
    today_slots: 8,
    tomorrow_slots: 10,
    price_range: '¥25-80'
  }
]

// ==================== 医生数据 ====================
export const MOCK_DOCTORS = [
  // 中央党校院区 - 心血管内科
  {
    doctor_id: 1,
    name: '张建国',
    title: '主任医师/教授',
    department_name: '心血管内科',
    area_id: 1,
    area_name: '中央党校院区',
    dept_id: 1,
    specialty: '冠心病、心律失常、心力衰竭的诊治',
    introduction: '从事心血管内科临床工作30余年，完成冠脉介入手术5000余例。',
    level: 'expert',
    work_time: '周一、周三上午专家门诊，周四全天普通门诊',
    price: 80,
    today_slots: 3,
    rating: 4.9,
    experience: '30年',
    patient_count: 15000,
    avatar: '/static/doctor-avatar-1.png'
  },
  {
    doctor_id: 2,
    name: '刘明华',
    title: '副主任医师',
    department_name: '心血管内科',
    area_id: 1,
    area_name: '中央党校院区',
    dept_id: 1,
    specialty: '高血压、冠心病药物治疗',
    introduction: '从事心血管内科工作15年，对高血压、冠心病等常见心血管疾病的诊疗有丰富经验。',
    level: 'senior',
    work_time: '周二、周四、周五全天普通门诊',
    price: 50,
    today_slots: 8,
    rating: 4.7,
    experience: '15年',
    patient_count: 8500,
    avatar: '/static/doctor-avatar-2.png'
  },
  
  // 中央党校院区 - 呼吸内科
  {
    doctor_id: 3,
    name: '李淑华',
    title: '副主任医师',
    department_name: '呼吸内科',
    area_id: 1,
    area_name: '中央党校院区',
    dept_id: 2,
    specialty: '呼吸系统感染、慢性阻塞性肺病、支气管哮喘',
    introduction: '具有丰富的呼吸系统疾病诊治经验，尤其擅长慢性阻塞性肺病的长期管理。',
    level: 'senior',
    work_time: '周二、周四全天，周五上午',
    price: 45,
    today_slots: 8,
    rating: 4.7,
    experience: '18年',
    patient_count: 11000,
    avatar: '/static/doctor-avatar-3.png'
  },
  
  // 中央党校院区 - 普通外科
  {
    doctor_id: 4,
    name: '王强',
    title: '副主任医师',
    department_name: '普通外科',
    area_id: 1,
    area_name: '中央党校院区',
    dept_id: 4,
    specialty: '甲状腺疾病、乳腺疾病、胃肠道肿瘤',
    introduction: '擅长甲状腺、乳腺、胃肠道疾病的诊断和手术治疗。',
    level: 'senior',
    work_time: '周一、周三、周五全天普通门诊',
    price: 60,
    today_slots: 15,
    rating: 4.7,
    experience: '16年',
    patient_count: 12000,
    avatar: '/static/doctor-avatar-4.png'
  },
  
  // 北京大学第三医院本部 - 心血管内科
  {
    doctor_id: 5,
    name: '李卫国',
    title: '主任医师/博士生导师',
    department_name: '心血管内科',
    area_id: 2,
    area_name: '北京大学第三医院本部',
    dept_id: 8,
    specialty: '复杂冠心病介入治疗、结构性心脏病介入治疗',
    introduction: '全国著名心血管病专家，中华医学会心血管病分会常委。',
    level: 'expert',
    work_time: '周一上午特需门诊，周三上午专家门诊',
    price: 300,
    today_slots: 2,
    rating: 5.0,
    experience: '35年',
    patient_count: 28000,
    avatar: '/static/doctor-avatar-5.png'
  },
  
  // 北京大学第三医院本部 - 神经内科
  {
    doctor_id: 6,
    name: '陈晓芳',
    title: '副主任医师',
    department_name: '神经内科',
    area_id: 2,
    area_name: '北京大学第三医院本部',
    dept_id: 9,
    specialty: '脑血管病、癫痫、帕金森病',
    introduction: '医学博士，对脑血管病、癫痫、帕金森病等神经系统疾病的诊疗有深入研究。',
    level: 'senior',
    work_time: '周二、周四全天普通门诊',
    price: 60,
    today_slots: 10,
    rating: 4.8,
    experience: '12年',
    patient_count: 9500,
    avatar: '/static/doctor-avatar-6.png'
  },
  
  // 北京大学第三医院本部 - 泌尿外科
  {
    doctor_id: 7,
    name: '赵宏伟',
    title: '主任医师',
    department_name: '泌尿外科',
    area_id: 2,
    area_name: '北京大学第三医院本部',
    dept_id: 10,
    specialty: '泌尿系统肿瘤、结石、前列腺疾病',
    introduction: '泌尿外科主任，擅长泌尿系统肿瘤、结石的微创手术治疗。',
    level: 'expert',
    work_time: '周三全天专家门诊，周五上午特需门诊',
    price: 120,
    today_slots: 5,
    rating: 4.9,
    experience: '25年',
    patient_count: 18000,
    avatar: '/static/doctor-avatar-7.png'
  },
  
  // 北方院区 - 内科门诊
  {
    doctor_id: 8,
    name: '孙晓梅',
    title: '主任医师',
    department_name: '内科门诊',
    area_id: 3,
    area_name: '北方院区',
    dept_id: 12,
    specialty: '内科常见病、多发病诊治',
    introduction: '内科门诊主任，对内科常见病、多发病的诊治有丰富经验。',
    level: 'expert',
    work_time: '周一至周五全天普通门诊',
    price: 40,
    today_slots: 8,
    rating: 4.8,
    experience: '22年',
    patient_count: 14000,
    avatar: '/static/doctor-avatar-8.png'
  }
]

// ==================== 生成搜索用的医生数据（包含完整信息） ====================
export const generateMockDoctorsForSearch = () => {
  return MOCK_DOCTORS.map(doctor => ({
    ...doctor,
    level: doctor.level || 'regular',
    work_time: doctor.work_time || '周一至周五',
    price: doctor.price || 20,
    today_slots: doctor.today_slots || 0
  }))
}

// ==================== 默认导出 ====================
export default {
  MOCK_HOSPITALS,
  MOCK_CATEGORIES,
  MOCK_DEPARTMENTS,
  MOCK_DOCTORS,
  generateMockDoctorsForSearch
}