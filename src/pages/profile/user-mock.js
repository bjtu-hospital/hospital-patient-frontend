/**
 * 用户相关的 Mock 数据
 */

// ==================== 就诊人数据 ====================
export const mockPatients = [
  {
    relationId: 1,
    patientId: 101,
    name: '张三',
    identifier: '2021001',                    // 学号/工号（明文）
    idCard: '110101********1234',             // 身份证（已脱敏）
    phone: '138****8000',                     // 手机号（已脱敏）
    gender: '男',
    birthDate: '1990-01-01',
    age: 35,
    relationType: '本人',
    isDefault: true,
    remark: '',
    createdAt: '2024-10-01T10:00:00'
  },
  {
    relationId: 2,
    patientId: 102,
    name: '李四',
    identifier: '2021002',
    idCard: '110101********5678',
    phone: '139****9000',
    gender: '女',
    birthDate: '1995-05-15',
    age: 30,
    relationType: '配偶',
    isDefault: false,
    remark: '妻子',
    createdAt: '2024-10-15T14:30:00'
  },
  {
    relationId: 3,
    patientId: 103,
    name: '王五',
    identifier: '',                           // 非校内人员无学号
    idCard: '110101********9012',
    phone: '137****7000',
    gender: '男',
    birthDate: '1960-01-01',
    age: 65,
    relationType: '父母',
    isDefault: false,
    remark: '父亲',
    createdAt: '2024-10-20T09:15:00'
  }
]

// ==================== 用户信息 ====================
export const mockUserInfo = {
  id: 'user_001',
  identifier: '2021001',                      // 学号/工号
  idCard: '110101********1234',               // 身份证（已脱敏）
  realName: '张三',
  phonenumber: '13800138000',
  gender: '男',
  birthDate: '1990-01-01',
  age: 35,
  email: 'zhangsan@bjtu.edu.cn',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  verified: true,                             // 是否已验证
  patientType: '学生',                         // 患者类型
  status: 'active',
  riskScore: 0,
  maskedInfo: {
    phone: '138****8000',
    idCard: '110101********1234'
  },
  createdAt: '2024-10-01 10:00:00'
}

// ==================== 预约记录 ====================
export const mockAppointments = [
  {
    id: 'appointment_001',
    orderNo: '20241108001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_005',
    departmentName: '心内科',
    doctorName: '张医生',
    doctorTitle: '主治医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2025-12-03',  // 相对于当前日期的未来时间
    appointmentTime: '上午 08:00-08:30',
    patientName: '张三',
    patientId: 'patient_001',
    scheduleId: null,
    queueNumber: '15',
    price: 50,
    status: 'pending',  // pending待就诊/completed已完成/cancelled已取消
    canCancel: true,
    canReschedule: true,
    createdAt: '2025-12-01 10:00:00'
  },
  {
    id: 'appointment_002',
    orderNo: '20241108002',
    hospitalId: 'hospital_002',
    hospitalName: '北京交通大学校医院（东校区）',
    departmentId: 'dept_1001',
    departmentName: '呼吸内科',
    doctorName: '李主任',
    doctorTitle: '主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2025-12-06',
    appointmentTime: '下午 14:00-14:30',
    patientName: '李四',
    patientId: 'patient_002',
    scheduleId: null,
    queueNumber: '8',
    price: 100,
    status: 'pending',
    canCancel: true,
    canReschedule: true,
    createdAt: '2025-12-01 10:00:00'
  },
  {
    id: 'appointment_003',
    orderNo: '20241105001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_401',
    departmentName: '眼科',
    doctorName: '王医生',
    doctorTitle: '副主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2025-11-28',  // 过去时间
    appointmentTime: '上午 09:00-09:30',
    patientName: '张三',
    patientId: 'patient_001',
    scheduleId: null,
    queueNumber: '5',
    price: 70,
    status: 'completed',
    canCancel: false,
    canReschedule: false,
    createdAt: '2025-11-26 14:20:00'
  },
  {
    id: 'appointment_004',
    orderNo: '20241101001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_003',
    departmentName: '消化内科',
    doctorName: '赵医生',
    doctorTitle: '主治医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2025-11-24',
    appointmentTime: '上午 10:00-10:30',
    patientName: '张三',
    patientId: 'patient_001',
    scheduleId: null,
    queueNumber: '12',
    price: 50,
    status: 'completed',
    canCancel: false,
    canReschedule: false,
    createdAt: '2025-11-22 09:30:00'
  },
  {
    id: 'appointment_005',
    orderNo: '20241106001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_403',
    departmentName: '口腔科',
    doctorName: '孙医生',
    doctorTitle: '主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2025-11-29',
    appointmentTime: '下午 15:00-15:30',
    patientName: '王五',
    patientId: 'patient_003',
    scheduleId: null,
    queueNumber: '3',
    price: 100,
    status: 'cancelled',
    canCancel: false,
    canReschedule: false,
    createdAt: '2025-11-27 16:00:00'
  }
]

// ==================== 健康档案 ====================
export const mockHealthRecords = {
  basicInfo: {
    height: 175,
    weight: 70,
    bloodType: 'A型',
    allergies: ['青霉素']
  },
  medicalHistory: [
    {
      id: 'record_001',
      date: '2024-10-01',
      hospitalName: '北交大校医院',
      departmentName: '内科',
      doctorName: '张医生',
      diagnosis: '感冒',
      treatment: '开了药'
    },
    {
      id: 'record_002',
      date: '2024-09-15',
      hospitalName: '北交大校医院',
      departmentName: '眼科',
      doctorName: '李医生',
      diagnosis: '近视检查',
      treatment: '配镜建议'
    }
  ]
}

// ==================== 消息列表 ====================
export const mockMessages = [
  {
    id: 'msg_001',
    type: 'appointment',
    title: '预约提醒',
    content: '您预约的张医生门诊将在明天上午8点开始，请提前15分钟到达',
    isRead: false,
    createdAt: '2024-11-09 18:00:00'
  },
  {
    id: 'msg_002',
    type: 'system',
    title: '系统通知',
    content: '医院将于本周六进行系统维护，预约功能暂时关闭',
    isRead: false,
    createdAt: '2024-11-08 10:30:00'
  },
  {
    id: 'msg_003',
    type: 'appointment',
    title: '就诊完成',
    content: '您的就诊已完成，可以查看电子病历和处方',
    isRead: true,
    createdAt: '2024-11-07 16:45:00'
  }
]

