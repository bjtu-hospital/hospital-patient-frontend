/**
 * 候补功能 Mock 数据
 */

// ==================== 候补记录数据 ====================
const generateMockWaitlist = () => {
  const waitlist = []
  const today = new Date()
  
  // 候补记录1 - 候补中
  const waitDate1 = new Date(today)
  waitDate1.setDate(today.getDate() + 3)
  waitlist.push({
    id: 'waitlist_001',
    scheduleId: 'schedule_001',
    patientId: 'patient_001',
    patientName: '张三',
    hospitalName: '北京交通大学校医院（本部）',
    departmentName: '心内科门诊',
    doctorName: '刘靖',
    doctorTitle: '主治医师',
    appointmentDate: waitDate1.toISOString().split('T')[0],
    appointmentTime: '上午 08:00-12:00',
    period: '上午',
    appointmentType: '普通门诊',
    price: 50,
    position: 3,              // 候补位置
    status: 'waiting',        // waiting候补中/success已成功/expired已过期/cancelled已取消
    expiryDate: waitDate1.toISOString().split('T')[0] + ' 18:00:00',
    createdAt: today.toISOString().replace('T', ' ').slice(0, 19)
  })
  
  // 候补记录2 - 候补成功（已转为预约）
  const waitDate2 = new Date(today)
  waitDate2.setDate(today.getDate() + 5)
  waitlist.push({
    id: 'waitlist_002',
    scheduleId: 'schedule_007',
    patientId: 'patient_002',
    patientName: '李四',
    hospitalName: '北京交通大学校医院（东校区）',
    departmentName: '呼吸内科门诊',
    doctorName: '陈源源',
    doctorTitle: '主治医师',
    appointmentDate: waitDate2.toISOString().split('T')[0],
    appointmentTime: '下午 14:00-17:00',
    period: '下午',
    appointmentType: '专家门诊',
    price: 100,
    position: 1,
    status: 'success',        // 候补成功
    appointmentId: 'appointment_' + Date.now(),  // 转换后的预约ID
    createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
  })
  
  return waitlist
}

// 导出可修改的候补数据
export const mockWaitlist = generateMockWaitlist()
