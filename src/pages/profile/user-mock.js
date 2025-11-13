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
// 生成动态日期的预约记录
const generateMockAppointments = () => {
  const appointments = []
  const today = new Date()
  
  // 待就诊的预约（未来日期）
  const futureDate1 = new Date(today)
  futureDate1.setDate(today.getDate() + 2)
  appointments.push({
    id: 'appointment_001',
    orderNo: '20241108001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_005',
    departmentName: '心内科',
    doctorName: '张医生',
    doctorTitle: '主治医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: futureDate1.toISOString().split('T')[0],
    appointmentTime: '上午 08:00-08:30',
    patientName: '张三',
    patientId: 'patient_001',
    scheduleId: null,
    queueNumber: '15',
    price: 50,
    status: 'pending',  // pending待就诊/completed已完成/cancelled已取消
    canCancel: true,
    canReschedule: true,
    createdAt: today.toISOString().replace('T', ' ').slice(0, 19)
  })
  
  const futureDate2 = new Date(today)
  futureDate2.setDate(today.getDate() + 5)
  appointments.push({
    id: 'appointment_002',
    orderNo: '20241108002',
    hospitalId: 'hospital_002',
    hospitalName: '北京交通大学校医院（东校区）',
    departmentId: 'dept_1001',
    departmentName: '呼吸内科',
    doctorName: '李主任',
    doctorTitle: '主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: futureDate2.toISOString().split('T')[0],
    appointmentTime: '下午 14:00-14:30',
    patientName: '李四',
    patientId: 'patient_002',
    scheduleId: null,
    queueNumber: '8',
    price: 100,
    status: 'pending',
    canCancel: true,
    canReschedule: true,
    createdAt: today.toISOString().replace('T', ' ').slice(0, 19)
  })
  
  // 已完成的预约（过去日期）
  const pastDate1 = new Date(today)
  pastDate1.setDate(today.getDate() - 3)
  appointments.push({
    id: 'appointment_003',
    orderNo: '20241105001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_401',
    departmentName: '眼科',
    doctorName: '王医生',
    doctorTitle: '副主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: pastDate1.toISOString().split('T')[0],
    appointmentTime: '上午 09:00-09:30',
    patientName: '张三',
    patientId: 'patient_001',
    scheduleId: null,
    queueNumber: '5',
    price: 70,
    status: 'completed',
    canCancel: false,
    canReschedule: false,
    createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
  })
  
  const pastDate2 = new Date(today)
  pastDate2.setDate(today.getDate() - 7)
  appointments.push({
    id: 'appointment_004',
    orderNo: '20241101001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_003',
    departmentName: '消化内科',
    doctorName: '赵医生',
    doctorTitle: '主治医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: pastDate2.toISOString().split('T')[0],
    appointmentTime: '上午 10:00-10:30',
    patientName: '张三',
    patientId: 'patient_001',
    scheduleId: null,
    queueNumber: '12',
    price: 50,
    status: 'completed',
    canCancel: false,
    canReschedule: false,
    createdAt: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
  })
  
  // 已取消的预约
  const pastDate3 = new Date(today)
  pastDate3.setDate(today.getDate() - 2)
  appointments.push({
    id: 'appointment_005',
    orderNo: '20241106001',
    hospitalId: 'hospital_001',
    hospitalName: '北京交通大学校医院（本部）',
    departmentId: 'dept_403',
    departmentName: '口腔科',
    doctorName: '孙医生',
    doctorTitle: '主任医师',
    doctorAvatar: '/static/logo.png',
    appointmentDate: pastDate3.toISOString().split('T')[0],
    appointmentTime: '下午 15:00-15:30',
    patientName: '王五',
    patientId: 'patient_003',
    scheduleId: null,
    queueNumber: '3',
    price: 100,
    status: 'cancelled',
    canCancel: false,
    canReschedule: false,
    createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
  })
  
  return appointments
}

// 导出可修改的预约数据（动态生成）
export const mockAppointments = generateMockAppointments()

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

