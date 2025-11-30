/**
 * 预约相关接口
 */
import request from './request'
import {
    mockHospitals,
    mockDepartments,
    mockSchedules
} from '@/pages/home/appointment/appointment-mock'
import { mockWaitlist } from '@/pages/home/waitlist/waitlist-mock'
import { mockAppointments, mockPatients } from '@/pages/profile/user-mock'

// 是否使用 Mock 数据
const USE_MOCK = false  // ← 已对接后端真实接口

// ==================== 医院相关 ====================

/**
 * 获取医院列表（院区列表）
 * @param {String} areaId - 可选，指定院区ID
 * @returns {Promise} 返回院区列表
 * Response: { code: 0, message: { areas: [...] } }
 */
export const getHospitals = (areaId) => {
  if (USE_MOCK) {
    return Promise.resolve(mockHospitals)
  }
  const params = areaId ? { area_id: areaId } : {}
  return request.get('/patient/hospitals', params).then(response => {
    // 后端返回 { areas: [...] }，提取并映射字段
    const areas = response.areas || []
    return areas.map(area => ({
      id: area.area_id,                    // area_id → id
      name: area.name,                      // name 保持
      level: '三甲',                        // 后端暂无该字段，给默认值
      type: '综合医院',                     // 后端暂无该字段，给默认值
      address: area.destination,            // destination → address
      image: area.image_data               // image_data → image (base64)
        ? `data:${area.image_type || 'image/jpeg'};base64,${area.image_data}`
        : '/static/hospital-default.png',  // 默认图片
      distance: 0,                          // 后端暂无距离计算
      isOpen: true,                         // 默认营业
      departmentCount: 0,                   // 后端暂无
      doctorCount: 0,                       // 后端暂无
      availableSlots: 0,                    // 后端暂无
      latitude: area.latitude,              // 保留原始数据
      longitude: area.longitude             // 保留原始数据
    }))
  })
}

/**
 * 获取大科室列表
 * @returns {Promise} 返回大科室列表
 * Response: { code: 0, message: { departments: [...] } }
 */
export const getMajorDepartments = () => {
  if (USE_MOCK) {
    // Mock 没有大科室概念，返回空数组
    return Promise.resolve([])
  }
  return request.get('/patient/major-departments').then(response => {
    // 后端返回 { departments: [...] }
    return response.departments || []
  })
}

/**
 * 获取科室列表（小科室列表）
 * @param {String} hospitalId - 医院ID（可选，用于前端过滤）
 * @param {String} majorDeptId - 大科室ID（可选）
 * @returns {Promise} 返回小科室列表
 * Response: { code: 0, message: { total, page, page_size, departments: [...] } }
 */
export const getDepartments = (hospitalId, majorDeptId) => {
  if (USE_MOCK) {
    // 根据医院ID过滤科室
    const filtered = mockDepartments.filter(dept => dept.hospitalId === hospitalId)
    return Promise.resolve(filtered)
  }
  const params = {}
  if (majorDeptId) params.major_dept_id = majorDeptId
  // 获取所有小科室，前端按需过滤
  return request.get('/patient/minor-departments', params).then(response => {
    // 后端返回 { total, page, page_size, departments }
    // 前端需要的是数组，所以返回 departments
    return response.departments || []
  })
}

/**
 * 获取门诊列表
 * @param {Object} params - 查询参数 { dept_id, area_id, page, page_size }
 * @returns {Promise} 返回门诊列表
 * Response: { code: 0, message: { total, page, page_size, clinics: [...] } }
 */
export const getClinics = (params = {}) => {
  if (USE_MOCK) {
    // Mock 没有门诊概念，返回空数组
    return Promise.resolve([])
  }
  const apiParams = {
    page: params.page || 1,
    page_size: params.page_size || 50
  }
  if (params.dept_id) apiParams.dept_id = params.dept_id
  if (params.area_id) apiParams.area_id = params.area_id
  
  return request.get('/patient/clinics', apiParams).then(response => {
    return response.clinics || []
  })
}

/**
 * 获取医生列表
 * @param {Object} params - 查询参数 { dept_id, name, page, page_size }
 * @returns {Promise} 返回医生列表
 * Response: { code: 0, message: { total, page, page_size, doctors: [...] } }
 */
export const getDoctors = (params = {}) => {
  if (USE_MOCK) {
    // Mock 没有单独的医生列表，返回空数组
    return Promise.resolve([])
  }
  const apiParams = {
    page: params.page || 1,
    page_size: params.page_size || 50
  }
  if (params.dept_id) apiParams.dept_id = params.dept_id
  if (params.name) apiParams.name = params.name
  
  return request.get('/patient/doctors', apiParams).then(response => {
    return response.doctors || []
  })
}

/**
 * 获取医生排班列表
 * @param {Object} params - 查询参数 { hospitalId, departmentId, date }
 * @returns {Promise} 返回排班列表
 * Response: { code: 0, message: [...] }
 */
export const getDoctorSchedules = (params) => {
  if (USE_MOCK) {
    // 根据参数过滤排班数据
    let filtered = mockSchedules
    
    if (params.departmentId) {
      filtered = filtered.filter(s => s.departmentId === params.departmentId)
    }
    
    if (params.date) {
      filtered = filtered.filter(s => s.date === params.date)
    }
    
    return Promise.resolve(filtered)
  }
  // 后端接口使用不同的参数名
  const apiParams = {}
  if (params.hospitalId) apiParams.hospitalId = params.hospitalId
  if (params.departmentId) apiParams.departmentId = params.departmentId
  if (params.date) apiParams.date = params.date
  
  return request.get('/patient/hospitals/schedules', apiParams).then(response => {
    // 后端可能返回 { schedules: [...] } 或直接返回数组
    const schedules = response.schedules || response || []
    
    // 🔑 映射后端字段到前端期望的格式
    const mappedSchedules = schedules.map(schedule => {
      // 🔑 映射门诊类型：根据 clinic_type 和 slot_type
      // 后端定义：clinic_type: 0-普通门诊, 1-国疗门诊, 2-特需门诊
      // 后端定义：slot_type: "普通", "专家", "特需"
      
      let type = 'normal'  // 默认普通门诊
      
      // 优先根据 clinic_type 判断（门诊本身的性质）
      if (schedule.clinic_type === 1) {
        type = 'international'  // 国疗门诊
      } else if (schedule.clinic_type === 2) {
        type = 'expert'  // 特需门诊
      } else if (schedule.clinic_type === 0) {
        // 普通门诊，但可能是专家号
        if (schedule.slot_type === '专家' || schedule.slot_type === '特需') {
          type = 'expert'  // 普通门诊的专家号也归为"专家/特需"类别
        }
      }
      
      const mapped = {
        // 基本信息
        id: schedule.schedule_id || schedule.id,
        doctorId: schedule.doctor_id,
        doctorName: schedule.doctor_name,
        doctorTitle: schedule.doctor_title || schedule.title,
        doctorAvatar: schedule.doctor_avatar || '/static/logo.png',
        
        // 科室和医院信息
        departmentId: schedule.minor_dept_id || schedule.department_id,
        departmentName: schedule.minor_dept_name || schedule.department_name,
        hospitalId: schedule.area_id || schedule.hospital_id,
        hospitalName: schedule.area_name || schedule.hospital_name,
        
        // 时间信息
        date: schedule.schedule_date || schedule.date,
        period: schedule.time_section || schedule.period || '上午',  // 上午/下午/晚间
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        weekDay: schedule.week_day,
        
        // 号源信息
        totalSlots: schedule.total_slots || 0,
        remainingSlots: schedule.remaining_slots || 0,
        status: schedule.status,
        
        // 🔑 门诊类型（关键字段！）
        type: type,  // 映射后的类型：normal/expert/international
        slotType: schedule.slot_type,  // 保留原始值：普通/专家/特需
        appointmentType: schedule.clinic_name || '普通门诊',
        price: schedule.price || 50,
        
        // 门诊信息
        clinicId: schedule.clinic_id,
        clinicName: schedule.clinic_name,
        clinicType: schedule.clinic_type  // 保留原始值：0/2/3
      }
      
      return mapped
    })
    
    // 统计映射后的 type 分布（用于验证）
    const mappedTypeStats = {}
    mappedSchedules.forEach(s => {
      mappedTypeStats[s.type] = (mappedTypeStats[s.type] || 0) + 1
    })
    console.log('✅ 排班数据映射完成:', {
      总数: mappedSchedules.length,
      普通门诊: mappedTypeStats.normal || 0,
      '专家/特需': mappedTypeStats.expert || 0,
      国疗门诊: mappedTypeStats.international || 0
    })
    
    return mappedSchedules
  })
}

/**
 * 创建预约
 * @param {Object} data - 预约信息 { scheduleId, hospitalId, departmentId, patientId, symptoms }
 * @returns {Promise} 返回预约结果
 * Response: { code: 0, message: { id, orderNo, queueNumber, needPay, payAmount, ... } }
 */
export const createAppointment = (data) => {
  if (USE_MOCK) {
    // 模拟返回预约成功的数据
    const result = {
      id: 'appointment_' + Date.now(),
      orderNo: '2024' + Date.now().toString().slice(-8),
      queueNumber: Math.floor(Math.random() * 30) + 1,
      needPay: true,
      payAmount: 50,
      appointmentDate: data.date || '2024-11-10',
      appointmentTime: data.time || '上午 08:00-08:30'
    }
    return Promise.resolve(result)
  }
  // 后端需要的参数格式
  const apiData = {
    scheduleId: data.scheduleId,
    hospitalId: data.hospitalId,
    departmentId: data.departmentId,
    patientId: data.patientId,
    symptoms: data.symptoms || ''
  }
  return request.post('/patient/appointments', apiData)
}

/**
 * 获取我的预约列表
 * @param {Object} params - 查询参数 { status, page, pageSize }
 * @returns {Promise} 返回预约列表
 * Response: { code: 0, message: { total, page, pageSize, list } }
 */
export const getMyAppointments = (params = {}) => {
  if (USE_MOCK) {
    // 🔧 FIXED: 从本地存储读取用户创建的预约 + 预定义的 Mock 数据合并
    const storedAppointments = uni.getStorageSync('myAppointments') || []
    
    // 合并本地存储和 Mock 数据（本地存储优先）
    let allAppointments = [...storedAppointments, ...mockAppointments]
    
    // 去重：如果同一个 ID 既在本地存储又在 Mock 数据中，只保留本地存储的
    const appointmentMap = new Map()
    allAppointments.forEach(a => {
      if (!appointmentMap.has(a.id)) {
        appointmentMap.set(a.id, a)
      }
    })
    let filtered = Array.from(appointmentMap.values())
    
    // 按创建时间倒序排列（最新的在前）
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    if (params && params.status && params.status !== 'all') {
      filtered = filtered.filter(a => a.status === params.status)
    }
    
    // 模拟分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return Promise.resolve({
      total: filtered.length,
      list: filtered.slice(start, end)
    })
  }
  // 后端接口参数
  const apiParams = {
    status: params.status || 'all',
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }
  return request.get('/patient/appointments', apiParams)
}

/**
 * 取消预约
 * @param {String} appointmentId - 预约ID
 * @returns {Promise} 返回取消结果 { success, refundAmount }
 */
export const cancelAppointment = (appointmentId) => {
  if (USE_MOCK) {
    // 在 Mock 数据中找到预约并更新状态
    const appointment = mockAppointments.find(a => a.id === appointmentId)
    if (appointment) {
      appointment.status = 'cancelled'
      appointment.canCancel = false
      appointment.canReschedule = false
    }

    // 同步更新本地存储的预约记录
    const storedAppointments = uni.getStorageSync('myAppointments') || []
    const updatedAppointments = storedAppointments.map(item => {
      if (item.id === appointmentId) {
        return {
          ...item,
          status: 'cancelled',
          canCancel: false,
          canReschedule: false,
          updatedAt: new Date().toISOString()
        }
      }
      return item
    })
    if (storedAppointments.length !== updatedAppointments.length) {
      uni.setStorageSync('myAppointments', updatedAppointments)
    } else {
      // 检查是否有状态发生变化
      const hasChange = storedAppointments.some((item, index) => item !== updatedAppointments[index])
      if (hasChange) {
        uni.setStorageSync('myAppointments', updatedAppointments)
      }
    }
    return Promise.resolve({ success: true, refundAmount: 0 })
  }
  return request.put(`/patient/appointments/${appointmentId}/cancel`)
}

/**
 * 改约
 * @param {String} appointmentId - 预约ID
 * @param {Object} data - 新的预约信息
 * @returns {Promise} 是否成功
 */
export const rescheduleAppointment = (appointmentId, data) => {
  if (USE_MOCK) {
    let updatedAppointment = null

    // 更新本地存储中的预约记录
    const storedAppointments = uni.getStorageSync('myAppointments') || []
    const nextStored = storedAppointments.map(item => {
      if (item.id === appointmentId) {
        const merged = {
          ...item,
          ...data,
          appointmentDate: data.appointmentDate || item.appointmentDate,
          appointmentTime: data.appointmentTime || item.appointmentTime,
          doctorName: data.doctorName || item.doctorName,
          doctorTitle: data.doctorTitle ?? item.doctorTitle,
          price: data.price ?? item.price,
          hospitalId: data.hospitalId || item.hospitalId,
          departmentId: data.departmentId || item.departmentId,
          patientId: data.patientId || item.patientId,
          scheduleId: data.scheduleId || item.scheduleId,
          status: 'pending',
          canCancel: true,
          canReschedule: true,
          updatedAt: new Date().toISOString()
        }
        updatedAppointment = merged
        return merged
      }
      return item
    })

    if (updatedAppointment) {
      uni.setStorageSync('myAppointments', nextStored)
    }

    // 更新默认的 Mock 预约列表
    const mockItem = mockAppointments.find(a => a.id === appointmentId)
    if (mockItem) {
      mockItem.appointmentDate = data.appointmentDate || mockItem.appointmentDate
      mockItem.appointmentTime = data.appointmentTime || mockItem.appointmentTime
      mockItem.doctorName = data.doctorName || mockItem.doctorName
      mockItem.doctorTitle = data.doctorTitle ?? mockItem.doctorTitle
      mockItem.price = data.price ?? mockItem.price
      mockItem.hospitalId = data.hospitalId || mockItem.hospitalId
      mockItem.departmentId = data.departmentId || mockItem.departmentId
      mockItem.patientId = data.patientId || mockItem.patientId
      mockItem.scheduleId = data.scheduleId || mockItem.scheduleId
      mockItem.status = 'pending'
      mockItem.canCancel = true
      mockItem.canReschedule = true
      mockItem.updatedAt = new Date().toISOString()
      updatedAppointment = updatedAppointment || { ...mockItem }
    }

    if (!updatedAppointment) {
      // 如果本地存储和 Mock 数据都没有找到对应预约，构造一个基础返回结果
      updatedAppointment = {
        id: appointmentId,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        doctorName: data.doctorName,
        doctorTitle: data.doctorTitle,
        price: data.price,
        hospitalId: data.hospitalId,
        departmentId: data.departmentId,
        patientId: data.patientId,
        scheduleId: data.scheduleId,
        status: 'pending',
        canCancel: true,
        canReschedule: true,
        updatedAt: new Date().toISOString()
      }
    }

    return Promise.resolve(updatedAppointment)
  }
  return request.put(`/patient/appointments/${appointmentId}/reschedule`, data)
}

// ==================== 候补相关 ====================

/**
 * 加入候补
 * @param {Object} data - 候补信息 { scheduleId, patientId }
 * @returns {Promise} 候补结果
 */
export const createWaitlist = (data) => {
  if (USE_MOCK) {
    // 计算当前候补位置(只计算等待中的)
    const existingCount = mockWaitlist.filter(
      w => w.scheduleId === data.scheduleId && w.status === 'waiting'
    ).length
    
    // 从排班数据中查找对应的排班信息
    const schedule = mockSchedules.find(s => s.id === data.scheduleId) || {}
    
    // 从就诊人数据中查找就诊人信息
    const patient = mockPatients.find(p => p.id === data.patientId) || {}
    
    // ✅ 从排班数据中获取医院ID和科室ID,然后查找完整信息
    const hospital = mockHospitals.find(h => h.id === schedule.hospitalId) || {}
    const department = mockDepartments.find(d => d.id === schedule.departmentId) || {}
    
    const today = new Date()
    const appointmentDate = schedule.date || today.toISOString().split('T')[0]
    
    // ✅ 计算候补截止时间(就诊前一日18:00)
    const expiryDateTime = new Date(appointmentDate)
    expiryDateTime.setDate(expiryDateTime.getDate() - 1)
    const expiryDateStr = expiryDateTime.toISOString().split('T')[0] + ' 18:00:00'
    
    const newWaitlist = {
      id: 'waitlist_' + Date.now(),
      scheduleId: data.scheduleId,
      patientId: data.patientId,
      patientName: patient.name || '未知',
      hospitalName: hospital.name || '北京交通大学校医院(本部)',  // ✅ 从医院数据获取
      departmentName: department.name || '未知科室',  // ✅ 从科室数据获取
      doctorName: schedule.doctorName || '未知医生',
      doctorTitle: schedule.doctorTitle || '',
      appointmentDate: appointmentDate,
      appointmentTime: `${schedule.period} ${schedule.startTime}-${schedule.endTime}`,
      period: schedule.period || '上午',
      appointmentType: schedule.appointmentType || '普通门诊',
      price: schedule.price || 50,
      position: existingCount + 1,
      status: 'waiting',
      expiryDate: expiryDateStr,  // ✅ 修正为就诊前一日18:00
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
    
    mockWaitlist.push(newWaitlist)
    
    return Promise.resolve({
      waitlistId: newWaitlist.id,
      position: newWaitlist.position
    })
  }
  return request.post('/patient/waitlist', data)
}

/**
 * 获取我的候补列表
 * @returns {Promise} 返回候补列表
 */
export const getMyWaitlist = () => {
  if (USE_MOCK) {
    // 返回数组的深拷贝，确保 Vue 能检测到变化
    return Promise.resolve(JSON.parse(JSON.stringify(mockWaitlist)))
  }
  return request.get('/patient/waitlist')
}

/**
 * 取消候补
 * @param {String} waitlistId - 候补ID
 * @returns {Promise} 是否成功
 */
export const cancelWaitlist = (waitlistId) => {
  if (USE_MOCK) {
    const waitlist = mockWaitlist.find(w => w.id === waitlistId)
    if (waitlist) {
      // 更新状态为已取消，而不是删除记录
      waitlist.status = 'cancelled'
    }
    return Promise.resolve(true)
  }
  return request.delete(`/patient/waitlist/${waitlistId}`)
}
