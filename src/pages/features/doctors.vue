<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">{{ navTitle }}</text>
      <view class="nav-right"></view>
    </view>

    <!-- 院区选择 -->
    <view v-if="step === 'hospital'" class="page-content">
      <view class="page-header">
        <text class="title">选择院区</text>
        <text class="subtitle">请选择就诊院区，或直接搜索科室/医生</text>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-box">
        <input 
          placeholder="请输入科室/医生/疾病/症状"
          v-model="hospitalKeyword"
          class="search-input"
          @confirm="handleGlobalSearch"
        />
        <view class="search-btn" @tap="handleGlobalSearch">搜索</view>
      </view>
      
      <view class="list-header">
        <text class="section-title">医院列表</text>
        <text class="sort-text">默认排序</text>
      </view>
      
      <view class="hospital-list">
        <view 
          class="hospital-card" 
          v-for="hospital in filteredHospitals" 
          :key="hospital.area_id"
          @tap="selectHospital(hospital)"
        >
          <view class="card-header">
            <text class="hospital-name">{{ hospital.name }}</text>
            <view class="level-tag">{{ hospital.level }}</view>
          </view>
          <view class="hospital-details">
            <text class="detail-item">类型：{{ hospital.type }}</text>
            <text class="detail-item">地址：{{ hospital.destination }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="filteredHospitals.length === 0" class="empty-state">
        <text class="empty-title">未找到相关医院</text>
        <text class="empty-desc" v-if="hospitalKeyword.trim()">点击上方搜索按钮，搜索相关医生</text>
        <text class="empty-desc" v-else>暂无医院数据</text>
      </view>
    </view>

    <!-- 科室选择 -->
    <view v-if="step === 'department'" class="page-content">
      <view class="page-header">
        <text class="title">选择科室</text>
        <text class="subtitle">内号源，每日早7点开始可挂第8日号源</text>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-box">
        <input 
          placeholder="请输入科室名" 
          v-model="deptKeyword" 
          class="search-input"
          @confirm="handleDeptSearch"
        />
        <view class="search-btn" @tap="handleDeptSearch">搜索</view>
      </view>
      
      <view class="current-hospital" @tap="viewHospitalIntro">
        <text class="hospital-name">{{ selectedHospital?.name }}</text>
        <view class="hospital-info">
          <text class="hospital-level">{{ selectedHospital?.level }}</text>
          <text class="intro-link">查看简介</text>
        </view>
      </view>
      
      <!-- 搜索结果 -->
      <view v-if="deptKeyword.trim()" class="department-section">
        <view class="list-header">
          <text class="section-title">搜索结果</text>
          <text class="count-text">{{ filteredDepartments.length }}个科室</text>
        </view>
        
        <view class="department-list">
          <view 
            class="dept-card" 
            v-for="dept in filteredDepartments" 
            :key="dept.minor_dept_id"
            @tap="selectDepartment(dept)"
          >
            <view class="dept-info">
              <text class="dept-name">{{ dept.name }}</text>
              <text class="dept-description" v-if="dept.description">{{ dept.description }}</text>
            </view>
            <text class="arrow-icon">›</text>
          </view>
        </view>
        
        <view v-if="filteredDepartments.length === 0" class="empty-state">
          <text class="empty-title">未找到相关科室</text>
          <text class="empty-desc">请尝试其他搜索关键词</text>
        </view>
      </view>
      
      <!-- 科室分类 -->
      <view v-else>
        <view class="categories">
          <view 
            class="category-card" 
            v-for="category in departmentCategories" 
            :key="category.major_dept_id"
            :class="{ active: selectedCategory === category.major_dept_id }"
            @tap="selectCategory(category.major_dept_id)"
          >
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
        
        <view v-if="selectedCategory" class="department-section">
          <view class="list-header">
            <text class="section-title">科室列表</text>
            <text class="count-text">{{ categoryDepartments.length }}个科室</text>
          </view>
          
          <view class="department-list">
            <view 
              class="dept-card" 
              v-for="dept in categoryDepartments" 
              :key="dept.minor_dept_id"
              @tap="selectDepartment(dept)"
            >
              <view class="dept-info">
                <text class="dept-name">{{ dept.name }}</text>
                <text class="dept-description" v-if="dept.description">{{ dept.description }}</text>
              </view>
              <text class="arrow-icon">›</text>
            </view>
          </view>
          
          <view v-if="categoryDepartments.length === 0" class="empty-state">
            <text class="empty-title">当前分类暂无科室</text>
            <text class="empty-desc">请选择其他分类查看科室信息</text>
          </view>
        </view>
        
        <view v-if="!selectedCategory" class="selection-prompt">
          <text class="prompt-title">请选择科室分类</text>
          <text class="prompt-desc">点击上方的科室分类按钮，查看对应的科室列表</text>
        </view>
      </view>
    </view>

    <!-- 医生列表 -->
    <view v-if="step === 'doctors'" class="page-content">
      <view class="path-nav">
        <text class="path-item" @tap="goToHospital">{{ selectedHospital?.name || '全部医院' }}</text>
        <text class="separator">/</text>
        <text class="path-item current" @tap="goToDepartment">{{ selectedDepartment?.name || '全部科室' }}</text>
        <text v-if="isGlobalSearch" class="search-tag">搜索结果</text>
      </view>
      
      <view class="dept-info-card" v-if="selectedDepartment && !isGlobalSearch">
        <view class="dept-info-header">
          <text class="dept-name">{{ selectedDepartment.name }}</text>
        </view>
        <view class="dept-info-content" v-if="selectedDepartment.description">
          <text class="info-label">科室简介：</text>
          <text class="info-text">{{ selectedDepartment.description }}</text>
        </view>
        <view class="dept-info-meta">
          <text class="meta-label">创建时间：{{ selectedDepartment.create_time || '2025-10-16' }}</text>
        </view>
      </view>
      
      <view v-if="isGlobalSearch" class="global-search-info">
        <text class="search-keyword">搜索关键词：{{ globalSearchKeyword }}</text>
        <text class="search-result">找到 {{ filteredDoctors.length }} 个相关医生</text>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-box">
        <input 
          placeholder="搜索医生姓名或专长..."
          v-model="searchKeyword" 
          class="search-input"
          @confirm="searchDoctors"
        />
        <view class="search-btn" @tap="searchDoctors">搜索</view>
      </view>

      <!-- 筛选区域 -->
      <view class="filter-section">
        <view class="filter-group">
          <text class="filter-label">职称筛选：</text>
          <view class="filter-tags">
            <view class="filter-tag" :class="{ active: filterTitle === 'all' }" @tap="filterTitle = 'all'">全部</view>
            <view class="filter-tag" :class="{ active: filterTitle === 'expert' }" @tap="filterTitle = 'expert'">专家</view>
            <view class="filter-tag" :class="{ active: filterTitle === 'senior' }" @tap="filterTitle = 'senior'">资深</view>
            <view class="filter-tag" :class="{ active: filterTitle === 'regular' }" @tap="filterTitle = 'regular'">普通</view>
          </view>
        </view>

        <view v-if="isGlobalSearch && availableDepartments.length > 0" class="filter-group">
          <text class="filter-label">科室筛选：</text>
          <view class="filter-tags">
            <view class="filter-tag" :class="{ active: filterDepartment === 'all' }" @tap="filterDepartment = 'all'">全部科室</view>
            <view 
              class="filter-tag" 
              v-for="dept in availableDepartments" 
              :key="dept.minor_dept_id"
              :class="{ active: filterDepartment === dept.minor_dept_id.toString() }"
              @tap="filterDepartment = dept.minor_dept_id.toString()"
            >
              {{ dept.name }}
            </view>
          </view>
        </view>

        <view v-if="hasActiveFilters" class="filter-actions">
          <text class="filter-count">已选：{{ activeFilterCount }}个条件</text>
          <button class="clear-btn" @tap="clearFilters">重置筛选</button>
        </view>
      </view>

      <!-- 医生列表 -->
      <view class="doctors-section">
        <view class="doctors-header">
          <text class="section-title">{{ isGlobalSearch ? '搜索结果' : '医生列表' }}</text>
          <text class="count-text">{{ filteredDoctors.length }}位医生</text>
        </view>
        
        <view class="doctors-list">
          <view class="doctor-card" v-for="doctor in filteredDoctors" :key="doctor.doctor_id">
            <view class="doctor-header">
              <view class="avatar">{{ doctor.name.charAt(0) }}</view>
              <view class="doctor-info">
                <view class="name-row">
                  <text class="doctor-name">{{ doctor.name }}</text>
                  <view :class="['level-tag', doctor.level]">{{ getLevelText(doctor.level) }}</view>
                </view>
                <text class="doctor-title">{{ doctor.title }}</text>
                <text class="doctor-dept">{{ doctor.department_name || doctor.department }}</text>
              </view>
            </view>
            
            <view class="doctor-specialty">
              <text class="specialty-label">专业特长：</text>
              <text class="specialty-text">{{ doctor.specialty }}</text>
            </view>
            
            <view class="doctor-intro" v-if="doctor.introduction && doctor.introduction.trim()">
              <text class="intro-label">医生简介：</text>
              <text class="intro-text">{{ doctor.introduction }}</text>
            </view>
            
            <view class="doctor-schedule">
              <view class="schedule-item">
                <text class="item-label">出诊时间</text>
                <text class="item-value">{{ doctor.work_time || doctor.workTime }}</text>
              </view>
              <view class="schedule-item">
                <text class="item-label">挂号费</text>
                <text class="item-value price">¥{{ doctor.price }}</text>
              </view>
              <view class="schedule-item">
                <text class="item-label">今日余号</text>
                <text :class="['item-value', { 
                  'available': doctor.today_slots > 0 || doctor.todaySlots > 0,
                  'unavailable': (doctor.today_slots === 0 || doctor.todaySlots === 0) 
                }]">
                  {{ (doctor.today_slots > 0 || doctor.todaySlots > 0) ? 
                      `${doctor.today_slots || doctor.todaySlots}个` : '无号源' }}
                </text>
              </view>
            </view>
            
            <view class="doctor-footer">
              <view class="status-badge" :class="{ available: doctor.today_slots > 0 || doctor.todaySlots > 0 }">
                {{ (doctor.today_slots > 0 || doctor.todaySlots > 0) ? '有号源' : '无号源' }}
              </view>
              <view class="view-detail" @tap="viewDoctorDetail(doctor)">查看详情</view>
            </view>
          </view>
          
          <view v-if="filteredDoctors.length === 0" class="empty-state">
            <text class="empty-title">未找到相关医生</text>
            <text class="empty-desc">{{ isGlobalSearch ? '请尝试其他搜索关键词' : '请尝试其他搜索条件或筛选条件' }}</text>
            <view class="action-buttons">
              <button class="action-btn" @tap="clearFilters">清除筛选</button>
              <button class="action-btn primary" @tap="!isGlobalSearch ? goToDepartment() : goToHospital()">
                {{ !isGlobalSearch ? '返回科室' : '返回院区' }}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  MOCK_HOSPITALS,
  MOCK_CATEGORIES,
  MOCK_DEPARTMENTS,
  MOCK_DOCTORS,
  generateMockDoctorsForSearch
} from './doctors-mock.js'

// 状态
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

// 数据
const hospitals = ref([])
const departmentCategories = ref([])
const departments = ref([])
const doctors = ref([])

// 计算属性
const navTitle = computed(() => {
  switch(step.value) {
    case 'hospital': return '选择院区'
    case 'department': return '选择科室'
    case 'doctors': return isGlobalSearch.value ? '搜索结果' : '医生列表'
    default: return '科室专家'
  }
})

const filteredHospitals = computed(() => {
  if (!hospitalKeyword.value.trim()) return hospitals.value
  const keyword = hospitalKeyword.value.toLowerCase()
  return hospitals.value.filter(h => 
    h.name.toLowerCase().includes(keyword) ||
    h.destination.toLowerCase().includes(keyword) ||
    h.type.toLowerCase().includes(keyword)
  )
})

const filteredDepartments = computed(() => {
  if (!selectedHospital.value) return []
  let depts = departments.value.filter(d => d.area_id === selectedHospital.value.area_id)
  if (deptKeyword.value.trim()) {
    const keyword = deptKeyword.value.toLowerCase()
    depts = depts.filter(d => d.name.toLowerCase().includes(keyword))
  }
  return depts
})

const categoryDepartments = computed(() => {
  if (!selectedCategory.value || !selectedHospital.value) return []
  return departments.value.filter(d => 
    d.major_dept_id === selectedCategory.value && 
    d.area_id === selectedHospital.value.area_id
  )
})

const availableDepartments = computed(() => {
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
  let result = doctors.value
  
  if (isGlobalSearch.value) {
    if (filterTitle.value !== 'all') result = result.filter(d => d.level === filterTitle.value)
    if (filterDepartment.value !== 'all') result = result.filter(d => d.dept_id && d.dept_id.toString() === filterDepartment.value)
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(d => 
        d.name.toLowerCase().includes(keyword) || 
        d.specialty.toLowerCase().includes(keyword) ||
        (d.department_name && d.department_name.toLowerCase().includes(keyword))
      )
    }
  } else {
    if (!selectedHospital.value || !selectedDepartment.value) return []
    result = result.filter(d => 
      d.area_id === selectedHospital.value.area_id && 
      d.dept_id === selectedDepartment.value.minor_dept_id
    )
    if (filterTitle.value !== 'all') result = result.filter(d => d.level === filterTitle.value)
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(d => 
        d.name.toLowerCase().includes(keyword) || 
        d.specialty.toLowerCase().includes(keyword)
      )
    }
  }
  
  return result
})

// 方法
const apiRequest = async (url, params = {}) => {
  try {
    const token = uni.getStorageSync('token')
    const response = await uni.request({
      url,
      method: 'GET',
      header: { 'Authorization': `Bearer ${token}` },
      data: params
    })
    return response[1]?.data
  } catch (error) {
    console.error(`API请求失败: ${url}`, error)
    throw error
  }
}

const fetchHospitals = async () => {
  try {
    const data = await apiRequest('/areas', { page_size: 50 })
    hospitals.value = data?.code === 0 ? data.data.list : MOCK_HOSPITALS
  } catch (error) {
    hospitals.value = MOCK_HOSPITALS
  }
}

const fetchDepartmentCategories = async () => {
  try {
    const data = await apiRequest('/major-departments')
    departmentCategories.value = data?.code === 0 ? data.data : MOCK_CATEGORIES
  } catch (error) {
    departmentCategories.value = MOCK_CATEGORIES
  }
}

const fetchDepartments = async () => {
  if (!selectedHospital.value) return
  try {
    const data = await apiRequest('/minor-departments', {
      area_id: selectedHospital.value.area_id,
      page_size: 100
    })
    if (data?.code === 0) {
      departments.value = data.data.list
    } else {
      departments.value = MOCK_DEPARTMENTS.filter(dept => dept.area_id === selectedHospital.value.area_id)
    }
  } catch (error) {
    departments.value = MOCK_DEPARTMENTS.filter(dept => dept.area_id === selectedHospital.value.area_id)
  }
}

const fetchDoctors = async () => {
  try {
    const data = await apiRequest('/doctors', { page_size: 100 })
    if (data?.code === 0) {
      doctors.value = data.data.list.map(doctor => ({
        ...doctor,
        level: doctor.level || 'regular',
        work_time: doctor.work_time || '周一至周五',
        price: doctor.price || 20,
        today_slots: doctor.today_slots || 0
      }))
    } else {
      doctors.value = generateMockDoctorsForSearch()
    }
  } catch (error) {
    doctors.value = generateMockDoctorsForSearch()
  }
}

const fetchGlobalSearch = async (keyword) => {
  try {
    const data = await apiRequest('/search/global', {
      keyword: keyword,
      search_type: 'doctor',
      page_size: 50
    })
    if (data?.code === 0) {
      doctors.value = data.data.doctors.map(doctor => ({
        ...doctor,
        level: doctor.level || 'regular',
        work_time: doctor.work_time || '周一至周五',
        price: doctor.price || 20,
        today_slots: doctor.today_slots || 0
      }))
    } else {
      const keywordLower = keyword.toLowerCase()
      doctors.value = MOCK_DOCTORS.filter(doctor => 
        doctor.name.toLowerCase().includes(keywordLower) ||
        doctor.specialty.toLowerCase().includes(keywordLower) ||
        doctor.department_name.toLowerCase().includes(keywordLower)
      )
    }
  } catch (error) {
    const keywordLower = keyword.toLowerCase()
    doctors.value = MOCK_DOCTORS.filter(doctor => 
      doctor.name.toLowerCase().includes(keywordLower) ||
      doctor.specialty.toLowerCase().includes(keywordLower) ||
      doctor.department_name.toLowerCase().includes(keywordLower)
    )
  }
}

// 业务逻辑
const goBack = () => {
  if (step.value === 'department') {
    step.value = 'hospital'
    selectedHospital.value = null
    selectedCategory.value = null
    departments.value = []
    isGlobalSearch.value = false
  } else if (step.value === 'doctors') {
    if (isGlobalSearch.value) {
      step.value = 'hospital'
      selectedHospital.value = null
      selectedDepartment.value = null
      searchKeyword.value = ''
      hospitalKeyword.value = globalSearchKeyword.value
      isGlobalSearch.value = false
      fetchDoctors()
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
  if (step.value === 'doctors') {
    step.value = 'hospital'
    selectedHospital.value = null
    selectedDepartment.value = null
    selectedCategory.value = null
    departments.value = []
    isGlobalSearch.value = false
    searchKeyword.value = ''
    hospitalKeyword.value = ''
  }
}

const goToDepartment = () => {
  if (step.value === 'doctors' && !isGlobalSearch.value) {
    step.value = 'department'
    selectedDepartment.value = null
    clearFilters()
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
  await fetchDepartments()
}

const handleDeptSearch = () => {
  if (deptKeyword.value.trim()) selectedCategory.value = null
}

const handleGlobalSearch = async () => {
  const keyword = hospitalKeyword.value.trim()
  if (!keyword) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
  isGlobalSearch.value = true
  globalSearchKeyword.value = keyword
  searchKeyword.value = keyword
  step.value = 'doctors'
  selectedHospital.value = null
  selectedDepartment.value = null
  filterDepartment.value = 'all'
  await fetchGlobalSearch(keyword)
}

const searchDoctors = () => {
  if (searchKeyword.value.trim()) {
    console.log('搜索:', searchKeyword.value)
  }
}

const viewHospitalIntro = () => {
  if (selectedHospital.value) {
    uni.showModal({
      title: selectedHospital.value.name,
      content: `${selectedHospital.value.level} ${selectedHospital.value.type}\n地址：${selectedHospital.value.destination}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }
}

const selectCategory = async (categoryId) => {
  selectedCategory.value = categoryId
  deptKeyword.value = ''
}

const selectDepartment = (dept) => {
  selectedDepartment.value = dept
  step.value = 'doctors'
  isGlobalSearch.value = false
  searchKeyword.value = ''
  filterTitle.value = 'all'
  filterDepartment.value = 'all'
}

const getLevelText = (level) => {
  const map = { expert: '专家', senior: '资深', regular: '普通' }
  return map[level] || level
}

const clearFilters = () => {
  filterTitle.value = 'all'
  filterDepartment.value = 'all'
  searchKeyword.value = ''
  if (isGlobalSearch.value) searchKeyword.value = globalSearchKeyword.value
}

const viewDoctorDetail = (doctor) => {
  const hospitalName = doctor.area_name || selectedHospital.value?.name || '未知医院'
  const departmentName = doctor.department_name || selectedDepartment.value?.name || '未知科室'
  const workTime = doctor.work_time || '暂无'
  const price = doctor.price || 0
  const todaySlots = doctor.today_slots || 0
  
  uni.showModal({
    title: `${doctor.name}医生详情`,
    content: `${doctor.title}\n医院：${hospitalName}\n科室：${departmentName}\n\n专业特长：${doctor.specialty}\n\n出诊时间：${workTime}\n挂号费：¥${price}\n今日余号：${todaySlots > 0 ? todaySlots + '个' : '无'}\n\n${doctor.introduction || '暂无详细介绍'}`,
    showCancel: false,
    confirmText: '关闭',
    confirmColor: '#00BFCC'
  })
}

// 初始化
onLoad(async () => {
  await Promise.all([fetchHospitals(), fetchDepartmentCategories(), fetchDoctors()])
})

// 监听
watch(deptKeyword, (newVal) => {
  if (newVal.trim()) selectedCategory.value = null
})
</script>

<style lang="scss" scoped>
.container {
  background: #f8fafc;
  min-height: 100vh;
  padding-top: 88rpx;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
  z-index: 1000;
  
  .nav-back {
    display: flex;
    align-items: center;
    padding: 16rpx;
    .back-icon {
      font-size: 36rpx;
      color: #0f172a;
      margin-right: 8rpx;
    }
    .back-text {
      font-size: 28rpx;
      color: #0f172a;
    }
  }
  
  .nav-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #0f172a;
  }
  
  .nav-right {
    width: 100rpx;
  }
}

.page-content {
  padding: 0 24rpx 40rpx;
}

.page-header {
  padding: 24rpx 0;
  .title {
    font-size: 36rpx;
    font-weight: 700;
    color: #0f172a;
    display: block;
    margin-bottom: 8rpx;
  }
  .subtitle {
    font-size: 24rpx;
    color: #64748b;
    line-height: 1.4;
  }
}

// 搜索框样式 - 改为第一张图片样式
.search-box {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid #e2e8f0;
  margin-bottom: 24rpx;
  
  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: #0f172a;
    height: 40rpx;
    border: none;
    outline: none;
    
    &::placeholder {
      color: #94a3b8;
    }
  }
  
  .search-btn {
    margin-left: 16rpx;
    background: #00BFCC;
    color: white;
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 500;
  }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24rpx 0 16rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
  }
  
  .sort-text, .count-text {
    font-size: 24rpx;
    color: #64748b;
  }
}

.hospital-list {
  .hospital-card {
    background: white;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #e2e8f0;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .hospital-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #0f172a;
      }
      
      .level-tag {
        padding: 6rpx 16rpx;
        background: #00BFCC;
        color: white;
        border-radius: 6rpx;
        font-size: 22rpx;
      }
    }
    
    .hospital-details {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .detail-item {
        font-size: 24rpx;
        color: #64748b;
      }
    }
  }
}

.categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.category-card {
  background: white;
  border-radius: 12rpx;
  padding: 36rpx 24rpx;
  text-align: center;
  border: 2rpx solid #e2e8f0;
  
  &.active {
    border-color: #00BFCC;
    background: #00BFCC;
    .category-name { color: white; }
  }
  
  .category-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
  }
}

.department-list {
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #e2e8f0;
  
  .dept-card {
    padding: 28rpx 24rpx;
    border-bottom: 1rpx solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .dept-info {
      flex: 1;
      .dept-name {
        font-size: 28rpx;
        color: #0f172a;
        font-weight: 500;
        display: block;
        margin-bottom: 8rpx;
      }
      .dept-description {
        font-size: 24rpx;
        color: #64748b;
        line-height: 1.4;
      }
    }
    
    .arrow-icon {
      font-size: 36rpx;
      color: #94a3b8;
    }
  }
  
  .dept-card:last-child {
    border-bottom: none;
  }
}

.current-hospital {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .hospital-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .hospital-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .hospital-level {
      font-size: 24rpx;
      color: #00BFCC;
      background: #f0f9ff;
      padding: 4rpx 12rpx;
      border-radius: 6rpx;
    }
    
    .intro-link {
      font-size: 24rpx;
      color: #00BFCC;
    }
  }
}

.path-nav {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  
  .path-item {
    font-size: 26rpx;
    color: #00BFCC;
    font-weight: 500;
    padding: 4rpx 0;
    &.current { color: #0f172a; }
  }
  
  .separator {
    margin: 0 12rpx;
    color: #cbd5e1;
  }
  
  .search-tag {
    margin-left: 16rpx;
    padding: 4rpx 12rpx;
    background: #f0f9ff;
    color: #00BFCC;
    border-radius: 6rpx;
    font-size: 22rpx;
  }
}

.dept-info-card, .global-search-info {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .dept-name, .search-keyword {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .info-text, .search-result {
    font-size: 24rpx;
    color: #0f172a;
    line-height: 1.4;
  }
}

.filter-section {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .filter-group {
    margin-bottom: 24rpx;
    .filter-label {
      font-size: 26rpx;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16rpx;
      display: block;
    }
  }
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  
  .filter-tag {
    padding: 16rpx 28rpx;
    background: #f8fafc;
    border: 1rpx solid #e2e8f0;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #64748b;
    font-weight: 500;
    
    &.active {
      background: #00BFCC;
      color: white;
      border-color: #00BFCC;
    }
  }
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f1f5f9;
  
  .filter-count {
    font-size: 24rpx;
    color: #64748b;
  }
  
  .clear-btn {
    background: #f8fafc;
    border: 1rpx solid #e2e8f0;
    border-radius: 8rpx;
    padding: 12rpx 24rpx;
    font-size: 24rpx;
    color: #64748b;
  }
}

.doctor-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .doctor-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .avatar {
      width: 80rpx;
      height: 80rpx;
      background: #00BFCC;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32rpx;
      font-weight: 600;
      margin-right: 20rpx;
    }
    
    .doctor-info {
      flex: 1;
      
      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        .doctor-name {
          font-size: 28rpx;
          font-weight: 700;
          color: #0f172a;
          margin-right: 16rpx;
        }
        
        .level-tag {
          padding: 6rpx 16rpx;
          border-radius: 6rpx;
          font-size: 22rpx;
          font-weight: 500;
          
          &.expert {
            background: #fef3c7;
            color: #d97706;
          }
          &.senior {
            background: #dbeafe;
            color: #1d4ed8;
          }
          &.regular {
            background: #f3f4f6;
            color: #6b7280;
          }
        }
      }
      
      .doctor-title {
        font-size: 24rpx;
        color: #00BFCC;
        font-weight: 500;
        display: block;
        margin-bottom: 4rpx;
      }
      
      .doctor-dept {
        font-size: 22rpx;
        color: #64748b;
      }
    }
  }
  
  .doctor-specialty, .doctor-intro {
    margin-bottom: 16rpx;
    
    .specialty-label, .intro-label {
      font-size: 24rpx;
      color: #64748b;
      margin-right: 8rpx;
      font-weight: 500;
    }
    
    .specialty-text, .intro-text {
      font-size: 24rpx;
      color: #374151;
      line-height: 1.4;
    }
  }
  
  .doctor-schedule {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-top: 1rpx solid #f1f5f9;
    border-bottom: 1rpx solid #f1f5f9;
    margin-bottom: 16rpx;
    
    .schedule-item {
      flex: 1;
      text-align: center;
      
      .item-label {
        font-size: 22rpx;
        color: #64748b;
        display: block;
        margin-bottom: 4rpx;
      }
      
      .item-value {
        font-size: 24rpx;
        color: #0f172a;
        font-weight: 500;
        
        &.price { color: #00BFCC; }
        &.available { color: #10b981; }
        &.unavailable { color: #ef4444; }
      }
    }
  }
  
  .doctor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .status-badge {
      padding: 8rpx 16rpx;
      border-radius: 6rpx;
      font-size: 22rpx;
      font-weight: 500;
      
      &.available {
        background: #d1fae5;
        color: #10b981;
      }
      
      &:not(.available) {
        background: #fee2e2;
        color: #ef4444;
      }
    }
    
    .view-detail {
      padding: 12rpx 24rpx;
      background: #00BFCC;
      color: white;
      border-radius: 8rpx;
      font-size: 24rpx;
      font-weight: 500;
    }
  }
}

.empty-state, .selection-prompt {
  text-align: center;
  padding: 80rpx 40rpx;
  background: white;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
  margin-top: 24rpx;
  
  .empty-title, .prompt-title {
    font-size: 28rpx;
    color: #0f172a;
    display: block;
    margin-bottom: 16rpx;
    font-weight: 600;
  }
  
  .empty-desc, .prompt-desc {
    font-size: 24rpx;
    color: #64748b;
    display: block;
    margin-bottom: 32rpx;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    
    .action-btn {
      padding: 16rpx 32rpx;
      background: #f8fafc;
      border: 1rpx solid #e2e8f0;
      border-radius: 8rpx;
      font-size: 24rpx;
      color: #64748b;
      font-weight: 500;
      
      &.primary {
        background: #00BFCC;
        color: white;
        border: none;
      }
    }
  }
}
</style>