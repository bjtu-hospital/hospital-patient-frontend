/**
 * 医生科室查询模块
 */
import { ref, computed, watch } from 'vue'
import request from './request'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// 头像URL处理
const getAvatarUrl = (doctor) => {
  if (doctor.photo_path) {
    return doctor.photo_path.startsWith('http') 
      ? doctor.photo_path 
      : `${BASE_URL}${doctor.photo_path}`
  }
  if (doctor.doctor_id) {
    return `${BASE_URL}/patient/doctors/${doctor.doctor_id}/photo`
  }
  return '/static/doctor-default.png'
}

// ==================== API 接口函数 ====================

/** 获取医院列表 GET /patient/hospitals */
const fetchHospitals = async () => {
  const res = await request.get('/patient/hospitals')
  if (res?.areas) {
    return res.areas.map(area => ({
      area_id: area.area_id,
      name: area.name,
      level: area.level || '三甲',
      type: area.type || '综合医院',
      destination: area.destination
    }))
  }
  throw new Error('获取医院列表失败')
}

/** 获取科室分类 GET /patient/major-departments */
const fetchDepartmentCategories = async () => {
  const res = await request.get('/patient/major-departments')
  if (res?.departments) {
    return res.departments.map(dept => ({
      major_dept_id: dept.major_dept_id,
      name: dept.name,
      description: dept.description || ''
    }))
  }
  throw new Error('获取科室分类失败')
}

/** 获取科室列表 GET /patient/minor-departments */
const fetchDepartments = async (majorDeptId = null) => {
  const params = { page_size: 100 }
  if (majorDeptId) params.major_dept_id = majorDeptId
  
  const res = await request.get('/patient/minor-departments', params)
  if (res?.departments) {
    return res.departments.map(dept => ({
      minor_dept_id: dept.minor_dept_id,
      name: dept.name,
      description: dept.description || '',
      major_dept_id: dept.major_dept_id
    }))
  }
  throw new Error('获取科室列表失败')
}

/** 
 * 获取医生列表 GET /patient/doctors
 * 响应格式: { code: 0, message: { total, page, page_size, doctors: [...] } }
 */
const fetchDoctors = async (params = {}) => {
  const apiParams = { page_size: 100 }
  if (params.dept_id) apiParams.dept_id = params.dept_id
  if (params.name) apiParams.name = params.name
  
  const res = await request.get('/patient/doctors', apiParams)
  
  // 处理响应格式: { code: 0, message: { doctors: [...] } }
  let doctorsData = []
  if (res?.message?.doctors) {
    doctorsData = res.message.doctors
  } else if (res?.doctors) {
    doctorsData = res.doctors
  } else if (Array.isArray(res)) {
    doctorsData = res
  }
  
  return doctorsData.map(d => ({
    doctor_id: d.doctor_id,
    name: d.name || '未命名医生',
    title: d.title || '医师',
    dept_id: d.dept_id,
    specialty: d.specialty || '暂无专长描述',
    introduction: d.introduction || '',
    avatar: getAvatarUrl(d),
    price: d.default_price_normal || 50
  }))
}

/** 全局搜索 GET /patient/search/global */
const fetchGlobalSearch = async (keyword) => {
  const res = await request.get(`/patient/search/global?keyword=${encodeURIComponent(keyword)}&page_size=50`)
  
  let doctorsData = []
  
  // 处理响应格式
  if (res?.message?.results) {
    doctorsData = res.message.results.filter(item => item.doctor_id)
  } else if (res?.results) {
    doctorsData = res.results.filter(item => item.doctor_id)
  }
  
  return doctorsData.map(d => ({
    doctor_id: d.doctor_id,
    name: d.name || '未命名医生',
    title: d.title || '医师',
    dept_id: d.dept_id,
    specialty: d.specialty || '暂无专长描述',
    introduction: d.introduction || '',
    avatar: getAvatarUrl(d),
    price: d.default_price_normal || 50
  }))
}

/** 获取医生详情 GET /patient/doctors/{doctor_id} */
const fetchDoctorDetail = async (doctorId) => {
  const res = await request.get(`/patient/doctors/${doctorId}`)
  if (res) {
    return {
      doctor_id: res.doctor_id,
      name: res.name,
      title: res.title || '医师',
      dept_id: res.dept_id,
      specialty: res.specialty || '暂无专长描述',
      introduction: res.introduction || '',
      avatar: getAvatarUrl(res),
      price: res.default_price_normal || 50
    }
  }
  return null
}

// ==================== 职称解析 ====================
const parseDoctorTitle = (title) => {
  const parts = (title || '').split(/\s+/)
  if (parts.includes('主任医师')) return '主任医师'
  if (parts.includes('副主任医师')) return '副主任医师'
  return '其他'
}

// ==================== 状态管理（单例） ====================

let storeInstance = null

export const useDoctorsStore = () => {
  if (storeInstance) return storeInstance

  // 状态
  const step = ref('hospital')
  const searchKeyword = ref('')
  const deptKeyword = ref('')
  const hospitalKeyword = ref('')
  const filterTitle = ref('all')
  const selectedCategory = ref(null)
  const selectedHospital = ref(null)
  const selectedDepartment = ref(null)
  const isGlobalSearch = ref(false)
  const globalSearchKeyword = ref('')
  const selectedDoctor = ref(null)
  const showDoctorDetail = ref(false)
  const loading = ref(false)

  // 数据
  const hospitals = ref([])
  const departmentCategories = ref([])
  const departments = ref([])
  const doctors = ref([])

  // 计算属性
  const navTitle = computed(() => {
    if (showDoctorDetail.value) return '医生详情'
    switch (step.value) {
      case 'hospital': return '选择院区'
      case 'department': return '选择科室'
      case 'doctors': return isGlobalSearch.value ? '搜索结果' : '医生列表'
      default: return '科室专家'
    }
  })

  const filteredHospitals = computed(() => {
    if (!hospitalKeyword.value.trim()) return hospitals.value
    const kw = hospitalKeyword.value.toLowerCase()
    return hospitals.value.filter(h =>
      h.name.toLowerCase().includes(kw) ||
      h.destination?.toLowerCase().includes(kw)
    )
  })

  const filteredDepartments = computed(() => {
    if (!deptKeyword.value.trim()) return departments.value
    const kw = deptKeyword.value.toLowerCase()
    return departments.value.filter(d => d.name.toLowerCase().includes(kw))
  })

  const categoryDepartments = computed(() => {
    if (!selectedCategory.value) return []
    return departments.value.filter(d => d.major_dept_id === selectedCategory.value)
  })

  const hasActiveFilters = computed(() => 
    filterTitle.value !== 'all' || searchKeyword.value.trim()
  )

  const filteredDoctors = computed(() => {
    let result = [...doctors.value]
    
    // 职称筛选
    if (filterTitle.value !== 'all') {
      result = result.filter(d => {
        const titleType = parseDoctorTitle(d.title)
        if (filterTitle.value === '其他职称') return titleType === '其他'
        return titleType === filterTitle.value
      })
    }
    
    // 关键词筛选
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.toLowerCase()
      result = result.filter(d =>
        d.name.toLowerCase().includes(kw) ||
        d.specialty.toLowerCase().includes(kw)
      )
    }
    
    return result
  })

  // 方法
  const init = async () => {
    if (hospitals.value.length > 0) return // 已初始化
    
    loading.value = true
    try {
      // 并行请求，不阻塞
      const [hospitalsData, categoriesData] = await Promise.all([
        fetchHospitals(),
        fetchDepartmentCategories()
      ])
      hospitals.value = hospitalsData
      departmentCategories.value = categoriesData
    } catch (e) {
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  /**
   * 使用URL参数初始化并导航到指定位置
   * @param {Object} params - URL参数
   * @param {string} [params.hospital] - 医院名称
   * @param {string} [params.department] - 科室名称
   * @param {string} [params.keyword] - 搜索关键词
   * @param {string} [params.level] - 职称筛选
   */
  const initWithParams = async (params = {}) => {
    const { hospital, department, keyword, level } = params
    console.log('🔍 initWithParams called with:', params)
    
    // 重置状态
    step.value = 'hospital'
    searchKeyword.value = ''
    deptKeyword.value = ''
    hospitalKeyword.value = ''
    filterTitle.value = 'all'
    selectedCategory.value = null
    selectedHospital.value = null
    selectedDepartment.value = null
    isGlobalSearch.value = false
    globalSearchKeyword.value = ''
    selectedDoctor.value = null
    showDoctorDetail.value = false
    doctors.value = []
    
    loading.value = true
    try {
      // 1. 加载基础数据
      const [hospitalsData, categoriesData] = await Promise.all([
        fetchHospitals(),
        fetchDepartmentCategories()
      ])
      hospitals.value = hospitalsData
      departmentCategories.value = categoriesData
      console.log('📦 Loaded hospitals:', hospitalsData.length, 'categories:', categoriesData.length)
      
      // 2. 匹配医院
      let matchedHospital = null
      if (hospital) {
        matchedHospital = hospitalsData.find(h => 
          h.name.includes(hospital) || hospital.includes(h.name)
        )
      }
      // 默认选择第一个医院（北医三院本部）
      if (!matchedHospital && hospitalsData.length > 0) {
        matchedHospital = hospitalsData[0]
      }
      
      if (!matchedHospital) {
        console.warn('⚠️ No hospital matched')
        loading.value = false
        return
      }
      console.log('🏥 Matched hospital:', matchedHospital.name)
      
      // 3. 选择医院，加载科室
      selectedHospital.value = matchedHospital
      departments.value = await fetchDepartments()
      console.log('🏥 Loaded departments:', departments.value.map(d => d.name))
      
      // 4. 匹配科室
      let matchedDepartment = null
      if (department) {
        const searchName = department.toLowerCase()
        // 尝试多种匹配方式
        matchedDepartment = departments.value.find(d => {
          const deptName = d.name.toLowerCase()
          // 精确匹配
          if (deptName === searchName) return true
          // 包含匹配
          if (deptName.includes(searchName) || searchName.includes(deptName)) return true
          // 心血管特殊处理
          if (searchName.includes('心血管') && deptName.includes('心')) return true
          if (searchName.includes('心') && deptName.includes('心血管')) return true
          if (searchName.includes('心内') && deptName.includes('心')) return true
          return false
        })
        console.log('🔍 Searching for department:', department, '-> matched:', matchedDepartment?.name)
      }
      
      if (matchedDepartment) {
        // 5. 选择科室，加载医生
        selectedDepartment.value = matchedDepartment
        step.value = 'doctors'
        isGlobalSearch.value = false
        
        console.log('📋 Fetching doctors for dept_id:', matchedDepartment.minor_dept_id)
        doctors.value = await fetchDoctors({ dept_id: matchedDepartment.minor_dept_id })
        console.log('👨‍⚕️ Loaded doctors:', doctors.value.length)
        
        // 6. 应用职称筛选
        if (level) {
          if (level.includes('主任') && !level.includes('副')) {
            filterTitle.value = '主任医师'
          } else if (level.includes('副主任')) {
            filterTitle.value = '副主任医师'
          } else if (level.includes('专家')) {
            filterTitle.value = '主任医师' // 专家一般是主任医师
          }
          console.log('🏷️ Applied filter:', filterTitle.value)
        }
        
        // 7. 应用关键词搜索
        if (keyword) {
          searchKeyword.value = keyword
        }
      } else if (department) {
        // 未匹配到科室，进入科室选择页并预填搜索
        step.value = 'department'
        deptKeyword.value = department
        console.log('⚠️ Department not matched, showing search with:', department)
      } else {
        // 只选了医院，进入科室选择页
        step.value = 'department'
      }
      
    } catch (e) {
      console.error('❌ initWithParams error:', e)
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  const resetState = () => {
    searchKeyword.value = ''
    filterTitle.value = 'all'
    showDoctorDetail.value = false
    selectedDoctor.value = null
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
      deptKeyword.value = ''
    } else if (step.value === 'doctors') {
      if (isGlobalSearch.value) {
        step.value = 'hospital'
        isGlobalSearch.value = false
        doctors.value = []
      } else {
        step.value = 'department'
        selectedDepartment.value = null
      }
      resetState()
    } else {
      uni.navigateBack()
    }
  }

  const goToHospital = () => {
    step.value = 'hospital'
    selectedHospital.value = null
    selectedDepartment.value = null
    selectedCategory.value = null
    departments.value = []
    doctors.value = []
    isGlobalSearch.value = false
    resetState()
    hospitalKeyword.value = ''
    deptKeyword.value = ''
  }

  const goToDepartment = () => {
    if (!isGlobalSearch.value) {
      step.value = 'department'
      selectedDepartment.value = null
      resetState()
    }
  }

  const selectHospital = async (hospital) => {
    selectedHospital.value = hospital
    selectedCategory.value = null
    selectedDepartment.value = null
    deptKeyword.value = ''
    step.value = 'department'
    isGlobalSearch.value = false
    resetState()
    
    loading.value = true
    try {
      departments.value = await fetchDepartments()
    } catch (e) {
      uni.showToast({ title: '加载科室失败', icon: 'none' })
    } finally {
      loading.value = false
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
      uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    
    uni.showLoading({ title: '搜索中...', mask: true })
    try {
      const result = await fetchGlobalSearch(keyword)
      doctors.value = result
      isGlobalSearch.value = true
      globalSearchKeyword.value = keyword
      step.value = 'doctors'
      selectedHospital.value = null
      selectedDepartment.value = null
      resetState()
      
      if (result.length === 0) {
        uni.showToast({ title: '未找到相关医生', icon: 'none' })
      }
    } catch (e) {
      uni.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }

  const viewHospitalIntro = () => {
    if (selectedHospital.value) {
      uni.showModal({
        title: selectedHospital.value.name,
        content: `${selectedHospital.value.level} ${selectedHospital.value.type}\n地址：${selectedHospital.value.destination}`,
        showCancel: false
      })
    }
  }

  const selectCategory = async (categoryId) => {
    selectedCategory.value = categoryId
    deptKeyword.value = ''
  }

  const selectDepartment = async (dept) => {
    selectedDepartment.value = dept
    step.value = 'doctors'
    isGlobalSearch.value = false
    resetState()
    
    uni.showLoading({ title: '加载医生...' })
    try {
      doctors.value = await fetchDoctors({ dept_id: dept.minor_dept_id })
    } catch (e) {
      uni.showToast({ title: '加载医生失败', icon: 'none' })
    } finally {
      uni.hideLoading()
    }
  }

  const clearFilters = () => {
    filterTitle.value = 'all'
    searchKeyword.value = ''
  }

  const viewDoctorDetail = async (doctor) => {
    uni.showLoading({ title: '加载中...' })
    try {
      const detail = await fetchDoctorDetail(doctor.doctor_id)
      selectedDoctor.value = detail || doctor
      showDoctorDetail.value = true
    } catch (e) {
      selectedDoctor.value = doctor
      showDoctorDetail.value = true
    } finally {
      uni.hideLoading()
    }
  }

  // 监听
  watch(deptKeyword, (val) => {
    if (val.trim()) selectedCategory.value = null
  })

  storeInstance = {
    // 状态
    step,
    searchKeyword,
    deptKeyword,
    hospitalKeyword,
    filterTitle,
    selectedCategory,
    selectedHospital,
    selectedDepartment,
    isGlobalSearch,
    globalSearchKeyword,
    selectedDoctor,
    showDoctorDetail,
    loading,
    // 数据
    hospitals,
    departmentCategories,
    departments,
    doctors,
    // 计算属性
    navTitle,
    filteredHospitals,
    filteredDepartments,
    categoryDepartments,
    hasActiveFilters,
    filteredDoctors,
    // 方法
    init,
    initWithParams,
    goBack,
    goToHospital,
    goToDepartment,
    selectHospital,
    handleDeptSearch,
    handleGlobalSearch,
    viewHospitalIntro,
    selectCategory,
    selectDepartment,
    clearFilters,
    viewDoctorDetail
  }

  return storeInstance
}

// 重置 store（用于测试或页面卸载）
export const resetDoctorsStore = () => {
  storeInstance = null
}

export default { useDoctorsStore, resetDoctorsStore }
