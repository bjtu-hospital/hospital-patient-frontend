/**
 * 医生科室查询模块
 */
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from './request'
import {
  MOCK_HOSPITALS,
  MOCK_CATEGORIES,
  MOCK_DEPARTMENTS,
  MOCK_DOCTORS,
  generateMockDoctorsForSearch
} from '../pages/features/doctors-mock.js'

// 是否使用 Mock 数据
const USE_MOCK = false
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 获取医生头像URL
const getDoctorAvatarUrl = (doctorId) => {
  if (USE_MOCK) return '/static/doctor-default.png'
  return `${BASE_URL}/patient/doctors/${doctorId}/photo?t=${Date.now()}`
}

// 获取医院图片URL
const getHospitalImageUrl = (imagePath) => {
  if (!imagePath) return '/static/hospital-default.png'
  return `${BASE_URL}${imagePath}`
}

// ==================== API 接口函数 ====================

/**
 * 获取医院列表（院区列表）-GET /patient/hospitals
 */
const fetchHospitals = async () => {
  if (USE_MOCK) {
    console.log('使用Mock医院数据')
    return MOCK_HOSPITALS
  }
  
  try {
    console.log('请求医院列表...')
    const res = await request.get('/patient/hospitals')
    console.log('医院接口响应:', res)

    if (res && res.areas && Array.isArray(res.areas)) {
      console.log(`成功获取 ${res.areas.length} 家医院`)
      return res.areas.map(area => ({
        area_id: area.area_id,
        name: area.name,
        level: area.level || '三甲', 
        type: area.type || '综合医院', 
        destination: area.destination,
        image: area.image ? getHospitalImageUrl(area.image) : '/static/hospital-default.png',
        isOpen: true,
        latitude: area.latitude,
        longitude: area.longitude
      }))
    }
    
    console.warn('医院接口返回格式不符合预期:', res)
    throw new Error('医院接口返回格式错误')
  } catch (error) {
    console.error('获取医院列表失败:', error)
    uni.showToast({
      title: '加载医院失败',
      icon: 'none',
      duration: 2000
    })
    return MOCK_HOSPITALS
  }
}

/**
 * 获取科室分类（大科室）-GET /patient/major-departments
 */
const fetchDepartmentCategories = async () => {
  if (USE_MOCK) return MOCK_CATEGORIES
  
  try {
    console.log('请求大科室列表...')
    const res = await request.get('/patient/major-departments')
    console.log('科室分类接口响应:', res)
    
    if (res && res.departments && Array.isArray(res.departments)) {
      console.log(`成功获取 ${res.departments.length} 个大科室`)
      return res.departments.map(dept => ({
        major_dept_id: dept.major_dept_id,
        name: dept.name,
        description: dept.description || ''
      }))
    }
    
    console.warn('科室分类接口返回格式不符合预期:', res)
    throw new Error('科室分类接口返回格式错误')
  } catch (error) {
    console.error('获取科室分类失败:', error)
    uni.showToast({
      title: '加载科室分类失败',
      icon: 'none',
      duration: 2000
    })
    return MOCK_CATEGORIES
  }
}

/**
 * 获取科室列表（小科室）- GET /patient/minor-departments
 */
const fetchDepartments = async (majorDeptId = null) => {
  if (USE_MOCK) {
    // Mock模式下，如果没有majorDeptId就返回所有科室
    return majorDeptId 
      ? MOCK_DEPARTMENTS.filter(dept => dept.major_dept_id === majorDeptId)
      : MOCK_DEPARTMENTS
  }
  
  try {
    console.log('请求小科室列表...', { majorDeptId })
    const params = { page_size: 100 }
    if (majorDeptId) params.major_dept_id = majorDeptId
    
    const res = await request.get('/patient/minor-departments', params)
    console.log('科室列表接口响应:', res)

    if (res && res.departments && Array.isArray(res.departments)) {
      console.log(`成功获取 ${res.departments.length} 个小科室`)
      return res.departments.map(dept => ({
        minor_dept_id: dept.minor_dept_id,
        name: dept.name,
        description: dept.description || '',
        major_dept_id: dept.major_dept_id,
        create_time: dept.create_time || '',
        price_range: dept.price_range || '¥20-100'
      }))
    }
    
    console.warn('科室列表接口返回格式不符合预期:', res)
    throw new Error('科室列表接口返回格式错误')
  } catch (error) {
    console.error('获取科室列表失败:', error)
    uni.showToast({
      title: '加载科室列表失败',
      icon: 'none',
      duration: 2000
    })
    return majorDeptId 
      ? MOCK_DEPARTMENTS.filter(dept => dept.major_dept_id === majorDeptId)
      : MOCK_DEPARTMENTS
  }
}

/**
 * 获取医生列表 -GET /patient/doctors
 */
const fetchDoctors = async (params = {}, currentHospital = null) => {
  if (USE_MOCK) {
    let doctors = generateMockDoctorsForSearch()
    if (params.area_id) doctors = doctors.filter(d => d.area_id === params.area_id)
    if (params.dept_id) doctors = doctors.filter(d => d.dept_id === params.dept_id)
    if (params.name) {
      const keyword = params.name.toLowerCase()
      doctors = doctors.filter(d => 
        d.name.toLowerCase().includes(keyword) ||
        d.specialty.toLowerCase().includes(keyword)
      )
    }
    return doctors
  }
  
  try {
    console.log('请求医生列表...', params)
    const apiParams = { page_size: 100 }
    if (params.dept_id) apiParams.dept_id = params.dept_id
    if (params.name) apiParams.name = params.name
    
    const res = await request.get('/patient/doctors', apiParams)
    console.log('医生列表接口原始响应:', JSON.stringify(res, null, 2))
    
    let doctorsData = []
    
    // 处理不同的响应格式
    if (res && Array.isArray(res)) {
      // 情况1: 响应本身就是数组
      console.log('医生列表接口返回数组格式')
      doctorsData = res
    } else if (res && res.doctors && Array.isArray(res.doctors)) {
      // 情况2: 响应是包含doctors字段的对象
      console.log('医生列表接口返回对象格式')
      doctorsData = res.doctors
    } else if (res && res.data && Array.isArray(res.data)) {
      // 情况3: 响应是包含data字段的对象
      console.log('医生列表接口返回data格式')
      doctorsData = res.data
    } else {
      console.warn('医生列表接口返回格式不符合预期:', res)
      // 可能是空数据或错误格式
      if (res && typeof res === 'object') {
        // 尝试遍历对象，看看有没有数组字段
        for (const key in res) {
          if (Array.isArray(res[key])) {
            console.log(`找到数组字段 ${key}，使用它作为医生列表`)
            doctorsData = res[key]
            break
          }
        }
      }
      
      if (doctorsData.length === 0) {
        console.log('返回空数组，使用模拟数据')
        return generateMockDoctorsForSearch()
      }
    }
    
    console.log(`成功获取 ${doctorsData.length} 位医生`)
    
    const formattedDoctors = doctorsData.map(doctor => {
      // 调试：查看医生原始数据
      console.log(`医生 ${doctor.name || '未知'} 原始数据:`, doctor)
      
      // 修复：不再引用 selectedHospital，使用参数传入的 currentHospital
      const defaultAreaId = currentHospital ? currentHospital.area_id : 1
      
      // 构建医生对象
      const doctorObj = {
        doctor_id: doctor.doctor_id || doctor.id || 0,
        name: doctor.name || '未命名医生',
        title: doctor.title || doctor.job_title || '医师',
        department_name: doctor.department_name || doctor.department || '',
        area_name: doctor.area_name || doctor.hospital_name || '未指定院区',
        area_id: doctor.area_id || doctor.hospital_id || defaultAreaId,
        dept_id: doctor.dept_id || doctor.department_id || 0,
        specialty: doctor.specialty || doctor.speciality || doctor.expertise || '暂无专长描述',
        introduction: doctor.introduction || '',
        level: doctor.level || 'regular',
        work_time: doctor.work_time || '周一至周五',
        price: doctor.price || 20,
        today_slots: doctor.today_slots || 0,
        rating: doctor.rating || 4.5,
        experience: doctor.experience || '0年',
        patient_count: doctor.patient_count || 0
      }
      
      // ============ 头像处理逻辑 ============
      let avatarUrl = '/static/doctor-default.png'
      
      // 1. 检查是否有头像字段
      console.log('头像字段检查:', {
        hasAvatar: !!doctor.avatar,
        hasPhoto: !!doctor.photo,
        doctorId: doctorObj.doctor_id
      })
      
      // 优先使用已有的完整URL
      if (doctor.avatar) {
        if (doctor.avatar.startsWith('http')) {
          avatarUrl = doctor.avatar
        } else if (doctor.avatar.startsWith('/')) {
          avatarUrl = `${BASE_URL}${doctor.avatar}`
        } else if (doctor.avatar.startsWith('data:')) {
          avatarUrl = doctor.avatar
        }
        console.log('使用 avatar 字段:', avatarUrl)
      } else if (doctor.photo) {
        // 如果有 photo 字段
        if (doctor.photo.startsWith('http')) {
          avatarUrl = doctor.photo
        } else if (doctor.photo.startsWith('/')) {
          avatarUrl = `${BASE_URL}${doctor.photo}`
        }
        console.log('使用 photo 字段:', avatarUrl)
      }
      
      // 如果没有头像数据，但有doctor_id，尝试使用photo接口
      if (avatarUrl === '/static/doctor-default.png' && doctorObj.doctor_id) {
        const photoUrl = `${BASE_URL}/patient/doctors/${doctorObj.doctor_id}/photo?t=${Date.now()}`
        console.log('尝试使用 photo 接口:', photoUrl)
        // 注意：这里不直接赋值，因为需要检查接口是否真的返回图片
        // 在实际使用中，如果这个接口404，会显示默认头像
        avatarUrl = photoUrl
      }
      
      doctorObj.avatar = avatarUrl
      console.log(`最终头像URL: ${doctorObj.avatar}`)
      // ============ 头像处理结束 ============
      
      return doctorObj
    })
    
    return formattedDoctors
    
  } catch (error) {
    console.error('获取医生列表失败:', error)
    
    // 判断是否需要显示错误提示
    const shouldShowToast = !(
      error.message && (
        error.message.includes('取消') || 
        error.message.includes('abort') ||
        error.message.includes('Network request failed')
      )
    )
    
    if (shouldShowToast) {
      let errorMessage = '加载医生列表失败'
      if (error.message && error.message.includes('Network Error')) {
        errorMessage = '网络连接失败，请检查网络'
      } else if (error.code === 401) {
        errorMessage = '登录已过期，请重新登录'
      } else if (error.code === 403) {
        errorMessage = '无权限访问'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
    }
    
    console.log('使用模拟数据')
    return generateMockDoctorsForSearch()
  }
}

/**
 * 全局搜索（科室/医生）- GET /patient/search/global
 */
const fetchGlobalSearch = async (keyword) => {
  if (USE_MOCK) {
    const keywordLower = keyword.toLowerCase()
    const doctors = MOCK_DOCTORS.filter(doctor => 
      doctor.name.toLowerCase().includes(keywordLower) ||
      doctor.specialty.toLowerCase().includes(keywordLower) ||
      (doctor.department_name && doctor.department_name.toLowerCase().includes(keywordLower))
    )
    const departments = MOCK_DEPARTMENTS.filter(dept => 
      dept.name.toLowerCase().includes(keywordLower) ||
      dept.description.toLowerCase().includes(keywordLower)
    )
    return { doctors, departments }
  }
  
  try {
    console.log('执行全局搜索...', keyword)
    
    // 构建带参数的URL
    const queryString = `keyword=${encodeURIComponent(keyword)}&page_size=50`
    const url = `/patient/search/global?${queryString}`
    
    console.log('请求URL:', url)
    const res = await request.get(url)
    
    console.log('全局搜索接口响应:', res)
    
    let doctorsData = []
    let departmentsData = []
    let total = 0
    
    //支持医生搜索
    if (res && typeof res === 'object') {
      // 情况1: 数据在 message.results 中
      if (res.message && res.message.results && Array.isArray(res.message.results)) {
        console.log('使用 message.results 数据')
        total = res.message.total || 0
        
        res.message.results.forEach(item => {
          // 判断是否为医生
          if (item.type === 'doctor' || item.doctor_id) {
            doctorsData.push({
              type: 'doctor',
              doctor_id: item.doctor_id,
              name: item.name,
              title: item.title,
              specialty: item.specialty,
              introduction: item.introduction,
              photo_path: item.photo_path,
              original_photo_url: item.original_photo_url,
              dept_id: item.dept_id,
              default_price_normal: item.default_price_normal
            })
          }
          // 判断是否为科室
          else if (item.type === 'department' || item.minor_dept_id || item.department_id) {
            departmentsData.push({
              type: 'department',
              minor_dept_id: item.minor_dept_id || item.department_id,
              name: item.name || item.department_name,
              description: item.description || '',
              major_dept_id: item.major_dept_id || item.category_id
            })
          }
        })
      }
      // 情况2: 数据直接在 results 中
      else if (res.results && Array.isArray(res.results)) {
        console.log('使用 results 数据')
        total = res.total || 0
        
        res.results.forEach(item => {
          if (item.type === 'doctor' || item.doctor_id) {
            doctorsData.push(item)
          } else if (item.type === 'department' || item.minor_dept_id) {
            departmentsData.push(item)
          }
        })
      }
    }
    
    console.log(`解析结果: ${doctorsData.length}位医生, ${departmentsData.length}个科室`)
    
    // 格式化医生数据
    const formattedDoctors = doctorsData.map(doctor => {
      const doctorObj = {
        doctor_id: doctor.doctor_id || 0,
        name: doctor.name || '未命名医生',
        title: doctor.title || '医师',
        department_name: '', // 需要从其他接口获取
        area_name: '未指定院区',
        area_id: 1,
        dept_id: doctor.dept_id || 0,
        specialty: doctor.specialty || '暂无专长描述',
        introduction: doctor.introduction || '',
        level: 'regular',
        work_time: '周一至周五',
        price: doctor.default_price_normal || 20,
        today_slots: 0,
        rating: 4.5,
        experience: '0年',
        patient_count: 0
      }
      
      // 头像处理
      let avatarUrl = '/static/doctor-default.png'
      
      if (doctor.photo_path) {
        if (doctor.photo_path.startsWith('http')) {
          avatarUrl = doctor.photo_path
        } else {
          avatarUrl = `${BASE_URL}${doctor.photo_path}`
        }
      } else if (doctor.original_photo_url) {
        avatarUrl = doctor.original_photo_url
      } else if (doctor.doctor_id) {
        avatarUrl = `${BASE_URL}/patient/doctors/${doctor.doctor_id}/photo?t=${Date.now()}`
      }
      
      doctorObj.avatar = avatarUrl
      return doctorObj
    })
    
    //完整格式化科室数据
    const formattedDepartments = departmentsData.map(dept => {
      console.log('🏥 处理科室数据:', dept)
      return {
        type: 'department',
        minor_dept_id: dept.minor_dept_id || dept.id || 0,
        name: dept.name || '未命名科室',
        description: dept.description || '',
        major_dept_id: dept.major_dept_id || dept.category_id || 0,
        create_time: '',
        price_range: '¥20-100',
        department_id: dept.minor_dept_id || dept.id || 0,
        department_name: dept.name || '未命名科室'
      }
    })
    
    console.log(`格式化完成: ${formattedDoctors.length}位医生, ${formattedDepartments.length}个科室`)
    
    return { 
      doctors: formattedDoctors, 
      departments: formattedDepartments,
      total,
      hasDoctors: formattedDoctors.length > 0,
      hasDepartments: formattedDepartments.length > 0
    }
    
  } catch (error) {
    console.error('全局搜索失败:', error)
    
    uni.showToast({
      title: '搜索失败',
      icon: 'none',
      duration: 2000
    })
    
    return { 
      doctors: [], 
      departments: [], 
      total: 0,
      hasDoctors: false,
      hasDepartments: false
    }
  }
}

/**
 * 获取医生详细信息 - GET /patient/doctors/{doctor_id}
 */
const fetchDoctorDetail = async (doctorId) => {
  if (USE_MOCK) {
    return MOCK_DOCTORS.find(d => d.doctor_id === doctorId)
  }
  
  try {
    console.log('请求医生详情...', doctorId)
    const res = await request.get(`/patient/doctors/${doctorId}`)
    console.log('医生详情接口响应:', res)
    
    if (res && typeof res === 'object') {
      return {
        doctor_id: res.doctor_id,
        name: res.name,
        title: res.title || '医师',
        department_name: res.department_name || '',
        area_id: res.area_id || 0,
        area_name: res.area_name || '未指定院区',
        dept_id: res.dept_id,
        specialty: res.specialty || '暂无专长描述',
        introduction: res.introduction || '',
        level: res.level || 'regular',
        work_time: res.work_time || '周一至周五',
        price: res.price || 20,
        today_slots: res.today_slots || 0,
        rating: res.rating || 4.5,
        experience: res.experience || '0年',
        patient_count: res.patient_count || 0,
        avatar: getDoctorAvatarUrl(res.doctor_id)
      }
    }
    
    console.warn('医生详情接口返回格式不符合预期:', res)
    throw new Error('医生详情接口返回格式错误')
  } catch (error) {
    console.error('获取医生详情失败:', error)
    uni.showToast({
      title: '加载医生详情失败',
      icon: 'none',
      duration: 2000
    })
    return null
  }
}

// ==================== 状态管理 ====================

/**
 * 医生科室查询状态管理
 */
export const useDoctorsStore = () => {
  // 状态变量
  const step = ref('hospital')
  const searchKeyword = ref('')
  const deptKeyword = ref('')
  const hospitalKeyword = ref('')
  const filterTitle = ref('all')
  const filterDepartment = ref('all')
  const selectedCategory = ref(null)
  const selectedHospital = ref(null)
  const selectedDepartment = ref(null)
  const isGlobalSearch = ref(false)
  const globalSearchKeyword = ref('')
  const selectedDoctor = ref(null)
  const showDoctorDetail = ref(false)

  // 数据
  const hospitals = ref([])
  const departmentCategories = ref([])
  const departments = ref([])
  const doctors = ref([])
  const searchResults = ref({ doctors: [], departments: [] })

  // 计算属性
  const navTitle = computed(() => {
    switch(step.value) {
      case 'hospital': return '选择院区'
      case 'department': return '选择科室'
      case 'doctors': 
        if (showDoctorDetail.value) {
          return '医生详情'
        }
        return isGlobalSearch.value ? '搜索结果' : '医生列表'
      default: return '科室专家'
    }
  })

  const filteredHospitals = computed(() => {
    if (!hospitalKeyword.value.trim()) return hospitals.value
    const keyword = hospitalKeyword.value.toLowerCase()
    return hospitals.value.filter(h => 
      h.name.toLowerCase().includes(keyword) ||
      (h.destination && h.destination.toLowerCase().includes(keyword)) ||
      (h.type && h.type.toLowerCase().includes(keyword))
    )
  })

  const filteredDepartments = computed(() => {
    let depts = departments.value
    if (deptKeyword.value.trim()) {
      const keyword = deptKeyword.value.toLowerCase()
      depts = depts.filter(d => d.name.toLowerCase().includes(keyword))
    }
    return depts
  })

  const categoryDepartments = computed(() => {
    if (!selectedCategory.value) return []
    return departments.value.filter(d => d.major_dept_id === selectedCategory.value)
  })

  const availableDepartments = computed(() => {
    if (isGlobalSearch.value && searchResults.value?.departments?.length > 0) {
      const uniqueDepartments = []
      const seenIds = new Set()
      
      searchResults.value.departments.forEach(dept => {
        if (dept.minor_dept_id && !seenIds.has(dept.minor_dept_id)) {
          seenIds.add(dept.minor_dept_id)
          uniqueDepartments.push({
            minor_dept_id: dept.minor_dept_id,
            name: dept.name,
            description: dept.description
          })
        }
      })
      
      return uniqueDepartments
    }
    

    if (!doctors.value.length || !isGlobalSearch.value) return []
    const deptIds = [...new Set(doctors.value.map(d => d.dept_id).filter(id => id != null))]
    const filteredDepts = MOCK_DEPARTMENTS.filter(dept => deptIds.includes(dept.minor_dept_id))
    const uniqueDepartments = []
    const nameSet = new Set()
    filteredDepts.forEach(dept => {
      if (!nameSet.has(dept.name)) {
        nameSet.add(dept.name)
        uniqueDepartments.push(dept)
      }
    })
    return uniqueDepartments.sort((a, b) => a.name.localeCompare(b.name))
  })

  const activeFilterCount = computed(() => {
    let count = 0
    if (filterTitle.value !== 'all') count++
    if (filterDepartment.value !== 'all') count++
    if (searchKeyword.value.trim()) count++
    return count
  })

  const hasActiveFilters = computed(() => activeFilterCount.value > 0)

  const filteredDoctors = computed(() => {
  console.log('filteredDoctors 计算属性被调用')

  let sourceDoctors = isGlobalSearch.value ? searchResults.value.doctors : doctors.value
  
  console.log('初始数据:', {
    模式: isGlobalSearch.value ? '全局搜索' : '科室浏览',
    总医生数: sourceDoctors ? sourceDoctors.length : 0,
    数据来源: isGlobalSearch.value ? 'searchResults.doctors' : 'doctors',
    搜索关键词: searchKeyword.value,
    职称筛选: filterTitle.value,
    科室筛选: filterDepartment.value,
    选中医院: selectedHospital.value?.name,
    选中科室: selectedDepartment.value?.name
  })
  
  // 检查数据是否存在
  if (!sourceDoctors || !Array.isArray(sourceDoctors)) {
    console.warn('医生数据不存在或不是数组:', sourceDoctors)
    return []
  }
  
  if (sourceDoctors.length === 0) {
    console.log('初始医生数据为空')
    return []
  }
  
  // 定义职称解析函数（使用空格分隔）
  const parseDoctorTitle = (title) => {
    const titleStr = title || ''
    console.log(`解析职称: "${titleStr}"`)
    
    // 使用空格分割职称
    const parts = titleStr.split(/\s+/).filter(part => part.length > 0)
    
    console.log(`分割后的职称数组:`, parts)
    
    // 检查是否包含"主任医师"
    const has主任医师 = parts.some(part => part === '主任医师')
    // 检查是否包含"副主任医师"
    const has副主任医师 = parts.some(part => part === '副主任医师')
    
    // 优先级：如果同时包含主任医师和副主任医师，按主任医师处理（或者根据需求调整）
    if (has主任医师) {
      console.log(`-> 归类为主任医师（包含"主任医师"职称）`)
      return '主任医师'
    } else if (has副主任医师) {
      console.log(`-> 归类为副主任医师（包含"副主任医师"职称）`)
      return '副主任医师'
    } else {
      console.log(`-> 归类为其他（不包含主任医师或副主任医师职称）`)
      return '其他'
    }
  }
  
  // 全局搜索模式
  if (isGlobalSearch.value) {
    console.log('全局搜索模式过滤...')
    let filteredResult = [...sourceDoctors] // 创建副本避免修改原数组
    
    // 1. 职称筛选
    if (filterTitle.value !== 'all') {
      const beforeCount = filteredResult.length
      
      // 使用职称解析器进行筛选
      filteredResult = filteredResult.filter(d => {
        const titleType = parseDoctorTitle(d.title || '')
        
        switch(filterTitle.value) {
          case '主任医师':
            return titleType === '主任医师'
          case '副主任医师':
            return titleType === '副主任医师'
          case '其他职称':
            return titleType === '其他'
          default:
            return true
        }
      })
      
      console.log(`职称"${filterTitle.value}"筛选: ${beforeCount} -> ${filteredResult.length}位医生`)
      
      // 调试：查看每个医生的职称分类
      if (filterTitle.value !== 'all') {
        console.log(`职称分类详情:`)
        filteredResult.forEach(d => {
          console.log(`  ${d.name}: "${d.title}" -> ${parseDoctorTitle(d.title)}`)
        })
      }
    }
    
    // 2. 科室筛选（如果有可用科室）
    if (filterDepartment.value !== 'all' && availableDepartments.value.length > 0) {
      const beforeCount = filteredResult.length
      filteredResult = filteredResult.filter(d => {
        // 确保类型一致
        const doctorDeptId = d.dept_id ? d.dept_id.toString() : null
        return doctorDeptId === filterDepartment.value
      })
      console.log(`科室"${filterDepartment.value}"筛选: ${beforeCount} -> ${filteredResult.length}位医生`)
    }
    
    // 3. 关键词搜索（搜索框中的二次筛选）
    if (searchKeyword.value.trim()) {
      const beforeCount = filteredResult.length
      const keyword = searchKeyword.value.toLowerCase()
      filteredResult = filteredResult.filter(d => 
        (d.name && d.name.toLowerCase().includes(keyword)) || 
        (d.specialty && d.specialty.toLowerCase().includes(keyword)) ||
        (d.department_name && d.department_name.toLowerCase().includes(keyword))
      )
      console.log(`关键词"${searchKeyword.value}"筛选: ${beforeCount} -> ${filteredResult.length}位医生`)
    }
    
    console.log(`全局搜索最终结果: ${filteredResult.length}位医生`)
    return filteredResult
    
  } else {
    // 🔴 科室浏览模式
    console.log('科室浏览模式过滤...')
    
    // 检查是否选择了医院和科室
    if (!selectedHospital.value || !selectedDepartment.value) {
      console.log('未选择医院或科室，返回空数组')
      return []
    }
    
    let filteredResult = [...sourceDoctors]
    
    // 1. 先按医院和科室过滤
    const beforeHospitalFilter = filteredResult.length
    filteredResult = filteredResult.filter(d => {
      // 医院匹配：允许医生没有area_id（全局搜索时）
      const hospitalMatch = !d.area_id || d.area_id == selectedHospital.value.area_id
      
      // 科室匹配：确保类型转换
      const doctorDeptId = d.dept_id ? parseInt(d.dept_id) : null
      const selectedDeptId = parseInt(selectedDepartment.value.minor_dept_id)
      const deptMatch = doctorDeptId === selectedDeptId
      
      return hospitalMatch && deptMatch
    })
    console.log(`医院科室过滤: ${beforeHospitalFilter} -> ${filteredResult.length}位医生`)
    
    // 2. 职称筛选 
    if (filterTitle.value !== 'all') {
      const beforeCount = filteredResult.length
      
      // 使用职称解析器进行筛选
      filteredResult = filteredResult.filter(d => {
        const titleType = parseDoctorTitle(d.title || '')
        
        switch(filterTitle.value) {
          case '主任医师':
            return titleType === '主任医师'
          case '副主任医师':
            return titleType === '副主任医师'
          case '其他职称':
            return titleType === '其他'
          default:
            return true
        }
      })
      
      console.log(`职称"${filterTitle.value}"筛选: ${beforeCount} -> ${filteredResult.length}位医生`)
      
      // 调试：查看每个医生的职称分类
      if (filterTitle.value !== 'all') {
        console.log(`职称分类详情:`)
        filteredResult.forEach(d => {
          console.log(`  ${d.name}: "${d.title}" -> ${parseDoctorTitle(d.title)}`)
        })
      }
    }
                  
    // 3. 关键词搜索
    if (searchKeyword.value.trim()) {
      const beforeCount = filteredResult.length
      const keyword = searchKeyword.value.toLowerCase()
      filteredResult = filteredResult.filter(d => 
        (d.name && d.name.toLowerCase().includes(keyword)) || 
        (d.specialty && d.specialty.toLowerCase().includes(keyword))
      )
      console.log(`关键词"${searchKeyword.value}"筛选: ${beforeCount} -> ${filteredResult.length}位医生`)
    }
    
    console.log(`科室浏览最终结果: ${filteredResult.length}位医生`)
    if (filteredResult.length > 0) {
      console.log('显示医生:', filteredResult.map(d => d.name))
    }
    
    return filteredResult
  }
})
  // 方法
  const init = async () => {
    console.log('初始化医生科室查询模块...')
    console.log('USE_MOCK:', USE_MOCK)
    console.log('BASE_URL:', BASE_URL)
    
    try {
      const [hospitalsData, categoriesData] = await Promise.all([
        fetchHospitals(),
        fetchDepartmentCategories()
      ])
      
      hospitals.value = hospitalsData
      departmentCategories.value = categoriesData
      
      console.log('初始化完成:', {
        医院数量: hospitals.value.length,
        科室分类数量: departmentCategories.value.length
      })
      
      // 测试API连接
      if (!USE_MOCK) {
        console.log('API测试连接...')
        const testResponse = await request.get('/patient/hospitals')
        console.log('API连接测试成功:', testResponse)
      }
    } catch (error) {
      console.error('初始化失败:', error)
      uni.showToast({
        title: '初始化失败，使用本地数据',
        icon: 'none',
        duration: 2000
      })
      hospitals.value = MOCK_HOSPITALS
      departmentCategories.value = MOCK_CATEGORIES
      doctors.value = generateMockDoctorsForSearch()
    }
  }

  const goBack = () => {
    if (showDoctorDetail.value) {
      showDoctorDetail.value = false
      selectedDoctor.value = null
      return
    }
    
    if (step.value === 'department') {
      step.value = 'hospital'
      selectedHospital.value = null
      selectedCategory.value = null
      departments.value = []
      isGlobalSearch.value = false
      searchKeyword.value = '' 
      hospitalKeyword.value = '' 
    } else if (step.value === 'doctors') {
      if (isGlobalSearch.value) {
        step.value = 'hospital'
        selectedHospital.value = null
        selectedDepartment.value = null
        searchKeyword.value = ''
        hospitalKeyword.value = globalSearchKeyword.value 
        isGlobalSearch.value = false
        doctors.value = [] // 清空医生列表
        searchResults.value = { doctors: [], departments: [] } // 清空搜索结果
      } else {
        step.value = 'department'
        selectedDepartment.value = null
        clearFilters()
      }
    } else {
      uni.navigateBack()
    }
  }

  const goToHospital = () => {
    if (step.value === 'doctors' && !showDoctorDetail.value) {
      step.value = 'hospital'
      selectedHospital.value = null
      selectedDepartment.value = null
      selectedCategory.value = null
      departments.value = []
      isGlobalSearch.value = false
      searchKeyword.value = ''
      hospitalKeyword.value = ''
      showDoctorDetail.value = false
      selectedDoctor.value = null
      doctors.value = []
      searchResults.value = { doctors: [], departments: [] }
    }
  }

  const goToDepartment = () => {
    if (step.value === 'doctors' && !isGlobalSearch.value && !showDoctorDetail.value) {
      step.value = 'department'
      selectedDepartment.value = null
      clearFilters()
      showDoctorDetail.value = false
      selectedDoctor.value = null
    }
  }

  const selectHospital = async (hospital) => {
    selectedHospital.value = hospital
    selectedCategory.value = null
    selectedDepartment.value = null
    departments.value = []
    deptKeyword.value = ''
    step.value = 'department'
    isGlobalSearch.value = false
    showDoctorDetail.value = false
    selectedDoctor.value = null
    searchResults.value = { doctors: [], departments: [] }
    searchKeyword.value = ''
    
    console.log(`选择医院: ${hospital.name} (ID: ${hospital.area_id})`)
    
    try {
      const deptData = await fetchDepartments()
      departments.value = deptData
      console.log(`加载科室完成: ${departments.value.length}个科室`)
    } catch (error) {
      console.error('加载科室失败:', error)
      uni.showToast({
        title: '加载科室失败',
        icon: 'none',
        duration: 2000
      })
      departments.value = MOCK_DEPARTMENTS
    }
  }

  const handleDeptSearch = () => {
    if (deptKeyword.value.trim()) {
      selectedCategory.value = null
    }
  }

  const handleGlobalSearch = async () => {
    const keyword = hospitalKeyword.value.trim()
    if (!keyword) {
      uni.showToast({ 
        title: '请输入搜索关键词', 
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    console.log(`全局搜索: ${keyword}`)
    uni.showLoading({ title: '搜索中...', mask: true })
    
    try {
      const result = await fetchGlobalSearch(keyword)
      
      isGlobalSearch.value = true
      globalSearchKeyword.value = keyword
      searchKeyword.value = ''  // 清空医生搜索框
      step.value = 'doctors'
      selectedHospital.value = null
      selectedDepartment.value = null
      filterTitle.value = 'all'
      filterDepartment.value = 'all'
      showDoctorDetail.value = false
      selectedDoctor.value = null
      
      searchResults.value = {
        doctors: result.doctors || [],
        departments: result.departments || [],
        hasDoctors: result.hasDoctors,
        hasDepartments: result.hasDepartments
      }
      
      // 更新医生数组
      doctors.value = result.doctors || []
      
      console.log(`搜索完成: ${result.doctors.length}个医生, ${result.departments.length}个科室`)
      console.log('是否有医生:', result.hasDoctors)
      console.log('是否有科室:', result.hasDepartments)
      
      uni.hideLoading()
      
      //如果只有科室没有医生，显示提示
      if (result.departments.length > 0 && result.doctors.length === 0) {
        uni.showToast({
          title: `找到${result.departments.length}个相关科室`,
          icon: 'none',
          duration: 2000
        })
      }
      else if (result.doctors.length === 0 && result.departments.length === 0) {
        uni.showToast({
          title: '未找到相关医生或科室',
          icon: 'none',
          duration: 2000
        })
      }
      
    } catch (error) {
      console.error('搜索失败:', error)
      uni.hideLoading()
      
      uni.showToast({
        title: '搜索失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  }

  const searchDoctors = () => {
    if (searchKeyword.value.trim()) {
      console.log('🔍 搜索医生:', searchKeyword.value)
      
      // 🔴 新增：如果在搜索结果页面，需要重新搜索
      if (isGlobalSearch.value && searchKeyword.value !== globalSearchKeyword.value) {
        // 执行新的全局搜索
        hospitalKeyword.value = searchKeyword.value
        handleGlobalSearch()
      }
      // 触发计算属性自动过滤
    } else {
      // 如果清空了搜索框，重置到原始搜索结果
      if (isGlobalSearch.value) {
        searchKeyword.value = ''
      }
    }
  }

  const viewHospitalIntro = () => {
    if (selectedHospital.value) {
      uni.showModal({
        title: selectedHospital.value.name,
        content: `${selectedHospital.value.level} ${selectedHospital.value.type}\n地址：${selectedHospital.value.destination}\n距离：${selectedHospital.value.distance || '未知'}公里`,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  }

  const selectCategory = async (categoryId) => {
    selectedCategory.value = categoryId
    deptKeyword.value = ''
    console.log(`选择科室分类: ID ${categoryId}`)
    
    // 按大科室过滤科室
    try {
      const deptData = await fetchDepartments(categoryId)
      departments.value = deptData
      console.log(`获取分类科室完成: ${departments.value.length}个科室`)
    } catch (error) {
      console.error('获取分类科室失败:', error)
      uni.showToast({
        title: '加载科室失败',
        icon: 'none',
        duration: 2000
      })
      departments.value = MOCK_DEPARTMENTS.filter(dept => dept.major_dept_id === categoryId)
    }
  }

  const selectDepartment = async (dept) => {
    selectedDepartment.value = dept
    step.value = 'doctors'
    isGlobalSearch.value = false
    searchKeyword.value = ''
    filterTitle.value = 'all'
    filterDepartment.value = 'all'
    showDoctorDetail.value = false
    selectedDoctor.value = null
    //清空搜索结果
    searchResults.value = { doctors: [], departments: [] }
    
    console.log(`选择科室: ${dept.name} (ID: ${dept.minor_dept_id})`)
    
    // 获取该科室的医生
    uni.showLoading({ title: '加载医生...' })
    try {
      const doctorsData = await fetchDoctors({ dept_id: dept.minor_dept_id })
      doctors.value = doctorsData
      console.log(`加载医生完成: ${doctors.value.length}位医生`)
      uni.hideLoading()
    } catch (error) {
      console.error('加载医生失败:', error)
      uni.hideLoading()
      doctors.value = MOCK_DOCTORS.filter(d => d.dept_id === dept.minor_dept_id)
    }
  }

  const clearFilters = () => {
    filterTitle.value = 'all'
    filterDepartment.value = 'all'
    searchKeyword.value = ''
    if (isGlobalSearch.value) {
      // 全局搜索模式下，保留原始搜索关键词
      searchKeyword.value = ''
    }
    console.log('清除筛选条件')
  }

  const viewDoctorDetail = async (doctor) => {
    uni.showLoading({ title: '加载中...' })
    try {
      const detail = await fetchDoctorDetail(doctor.doctor_id)
      selectedDoctor.value = detail || doctor  // 使用详情数据或回退到列表数据
      showDoctorDetail.value = true
      
      if (detail?.dept_id) {
        const dept = departments.value.find(d => d.minor_dept_id === detail.dept_id)
        if (dept) {
          selectedDepartment.value = dept
        }
      }
      
      console.log(`查看医生详情: ${selectedDoctor.value.name}`)
      uni.hideLoading()
    } catch (error) {
      console.error('加载医生详情失败:', error)
      uni.hideLoading()
      selectedDoctor.value = doctor  // 使用列表数据
      showDoctorDetail.value = true
    }
  }

  const makeAppointment = () => {
    if (selectedDoctor.value) {
      uni.showModal({
        title: '预约提示',
        content: `是否要预约${selectedDoctor.value.name}医生的门诊？\n挂号费: ¥${selectedDoctor.value.price}`,
        success: (res) => {
          if (res.confirm) {
            console.log(`预约医生: ${selectedDoctor.value.name}`)
            uni.showToast({
              title: '预约成功，请按时就诊',
              icon: 'success',
              duration: 2000
            })
          }
        }
      })
    }
  }

  const viewDepartmentInfo = () => {
    if (selectedDepartment.value) {
      uni.showModal({
        title: `${selectedDepartment.value.name} - 科室详情`,
        content: `科室简介：${selectedDepartment.value.description || '暂无'}\n\n特色诊疗：${selectedDepartment.value.specialty_treatment || '暂无'}\n\n科主任：${selectedDepartment.value.head_doctor || '暂无'}\n\n联系电话：${selectedDepartment.value.department_phone || '暂无'}`,
        confirmText: '知道了',
        showCancel: false
      })
    }
  }

  // 监听
  watch(deptKeyword, (newVal) => {
    if (newVal.trim()) selectedCategory.value = null
  })

  return {
    // 状态
    step,
    searchKeyword,
    deptKeyword,
    hospitalKeyword,
    filterTitle,
    filterDepartment,
    selectedCategory,
    selectedHospital,
    selectedDepartment,
    isGlobalSearch,
    globalSearchKeyword,
    selectedDoctor,
    showDoctorDetail,
    
    // 数据
    hospitals,
    departmentCategories,
    departments,
    doctors,
    searchResults,
    
    // 计算属性
    navTitle,
    filteredHospitals,
    filteredDepartments,
    categoryDepartments,
    availableDepartments,
    activeFilterCount,
    hasActiveFilters,
    filteredDoctors,
    
    // 方法
    init,
    goBack,
    goToHospital,
    goToDepartment,
    selectHospital,
    handleDeptSearch,
    handleGlobalSearch,
    searchDoctors,
    viewHospitalIntro,
    selectCategory,
    selectDepartment,
    clearFilters,
    viewDoctorDetail,
    makeAppointment,
    viewDepartmentInfo
  }
}

export default {
  useDoctorsStore
}