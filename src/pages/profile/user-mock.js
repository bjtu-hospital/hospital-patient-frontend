/**
 * 用户相关的 Mock 数据
 */

// ==================== 就诊人数据 ====================
export const mockPatients = [
  {
    id: 'patient_001',
    name: '张三',
    idCard: '110101199001011234',
    phone: '13800138000',
    relation: '本人',
    isDefault: true,
    createdAt: '2024-10-01 10:00:00'
  },
  {
    id: 'patient_002',
    name: '李四',
    idCard: '110101199501011234',
    phone: '13900139000',
    relation: '子女',
    isDefault: false,
    createdAt: '2024-10-15 14:30:00'
  },
  {
    id: 'patient_003',
    name: '王五',
    idCard: '110101196001011234',
    phone: '13700137000',
    relation: '父母',
    isDefault: false,
    createdAt: '2024-10-20 09:15:00'
  }
]

// ==================== 用户信息 ====================
export const mockUserInfo = {
  id: 'user_001',
  studentId: '23301087',
  realName: '张三',
  phone: '13800138000',
  idCard: '110101199001011234',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  verified: true,
  createdAt: '2024-10-01 10:00:00'
}

// ==================== 预约记录 ====================
export const mockAppointments = [
  {
    id: 'appointment_001',
    orderNo: '20241108001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentName: '心内科',
    doctorName: '张医生',
    doctorTitle: '主治医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2024-11-10',
    appointmentTime: '上午 08:00-08:30',
    patientName: '张三',
    queueNumber: '15',
    price: 50,
    status: 'pending',  // pending待就诊/completed已完成/cancelled已取消
    canCancel: true,
    canReschedule: true,
    createdAt: '2024-11-08 10:00:00'
  },
  {
    id: 'appointment_002',
    orderNo: '20241107001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentName: '眼科',
    doctorName: '李医生',
    doctorTitle: '副主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2024-11-07',
    appointmentTime: '下午 14:00-14:30',
    patientName: '张三',
    queueNumber: '8',
    price: 70,
    status: 'completed',
    canCancel: false,
    canReschedule: false,
    createdAt: '2024-11-05 15:30:00'
  },
  {
    id: 'appointment_003',
    orderNo: '20241106001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentName: '口腔科',
    doctorName: '王医生',
    doctorTitle: '主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: '2024-11-06',
    appointmentTime: '上午 09:00-09:30',
    patientName: '李四',
    queueNumber: '3',
    price: 100,
    status: 'cancelled',
    canCancel: false,
    canReschedule: false,
    createdAt: '2024-11-04 11:20:00'
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

