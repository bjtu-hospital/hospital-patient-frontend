<template>
  <view class="select-department-container">
    <!-- 顶部提示 -->
    <view class="notice-bar">
      <text class="notice-icon">🔊</text>
      <text class="notice-text">内号源，每日早7点开始可挂第8日号源</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <input 
        class="search-input" 
        type="text" 
        placeholder="请输入科室名"
        v-model="searchKeyword"
        @input="handleSearch"
      />
    </view>

    <!-- 医院信息 + 切换院区 -->
    <view class="hospital-info">
      <image class="hospital-thumb" :src="currentHospital?.image" mode="aspectFill"></image>
      <view class="hospital-detail">
        <text class="hospital-name-small">{{ currentHospital?.name }}</text>
        <view class="hospital-action" @tap="showHospitalIntro">
          <text class="action-text">查看简介</text>
          <text class="action-icon">›</text>
        </view>
        <text class="hospital-address-small">{{ currentHospital?.address }}</text>
      </view>
      <view class="switch-hospital" @tap="switchHospital">
        <text class="switch-text">⇄ 院区切换</text>
      </view>
    </view>

    <!-- 左右布局：分类 + 科室列表 -->
    <view class="content-wrapper">
      <!-- 左侧：大科室分类 -->
      <scroll-view class="category-sidebar" scroll-y>
        <view 
          class="category-item"
          :class="{ active: selectedCategory === category.key }"
          v-for="category in categories" 
          :key="category.key"
          @tap="selectCategory(category.key)"
        >
          <text class="category-text">{{ category.name }}</text>
          <view class="category-indicator" v-if="selectedCategory === category.key"></view>
        </view>
      </scroll-view>

      <!-- 右侧：科室列表 -->
      <scroll-view class="department-content" scroll-y>
        <view 
          class="department-item" 
          v-for="dept in filteredDepartments" 
          :key="dept.id"
          @tap="selectDepartment(dept)"
        >
          <text class="dept-name">{{ dept.name }}</text>
        </view>
        
        <view class="empty-state" v-if="filteredDepartments.length === 0">
          <text class="empty-text">暂无相关科室</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { getDepartments } from '@/api/appointment'  // ✨ 直接使用 API

const appointmentStore = useAppointmentStore()
const currentHospital = ref(null)
const selectedCategory = ref('internal')
const searchKeyword = ref('')
const loading = ref(false)

// 大科室分类
const categories = ref([
  { key: 'internal', name: '内科' },
  { key: 'surgical', name: '外科' },
  { key: 'gynecology', name: '妇产科' },
  { key: 'pediatrics', name: '儿科' },
  { key: 'ent', name: '五官科' },
  { key: 'tcm', name: '中医科' },
  { key: 'dermatology', name: '皮科' },
  { key: 'other', name: '其他科' },
  { key: 'preop', name: '术前管理中心' },
  { key: 'international', name: '国际医疗部' }
])

// 科室数据（从 API 获取）
const departments = ref([])

// 加载科室数据
const loadDepartments = async () => {
  if (!currentHospital.value?.id) {
    console.warn('没有选择医院')
    return
  }
  
  try {
    loading.value = true
    // ✨ 调用 API，自动判断使用 Mock 还是真实接口
    const data = await getDepartments(currentHospital.value.id)
    departments.value = data
  } catch (error) {
    console.error('获取科室列表失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 过滤后的科室列表
const filteredDepartments = computed(() => {
  let filtered = departments.value.filter(dept => dept.category === selectedCategory.value)
  
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(dept => 
      dept.name.toLowerCase().includes(keyword)
    )
  }
  
  return filtered
})

// 选择分类
const selectCategory = (categoryKey) => {
  selectedCategory.value = categoryKey
}

// 搜索处理
const handleSearch = () => {
  // 搜索时自动切换到"全部"
  // 暂不实现跨分类搜索，保持简单
}

// 切换医院
const switchHospital = () => {
  uni.navigateBack()
}

// 查看医院简介
const showHospitalIntro = () => {
  uni.showModal({
    title: currentHospital.value?.name,
    content: `地址：${currentHospital.value?.address}\n科室：${currentHospital.value?.departmentCount}个\n医生：${currentHospital.value?.doctorCount}位`,
    showCancel: false
  })
}

// 选择科室
const selectDepartment = (dept) => {
  // 保存选择的科室到 Store
  appointmentStore.setSelectedDepartment(dept)
  
  // 跳转到选择医生页面
  uni.navigateTo({
    url: '/pages/home/appointment/select-doctor'
  })
}

onMounted(() => {
  // 从 Store 获取选中的医院信息
  currentHospital.value = appointmentStore.selectedHospital
  
  // 加载科室列表
  loadDepartments()
})
</script>

<style lang="scss" scoped>
.select-department-container {
  background: $color-slate-50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部提示 */
.notice-bar {
  background: #FFF7ED;
  padding: $spacing-sm $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.notice-icon {
  font-size: 24rpx;
}

.notice-text {
  font-size: 24rpx;
  color: #ea580c;
  flex: 1;
}

/* 搜索栏 */
.search-section {
  padding: $spacing-md;
  background: white;
}

.search-input {
  width: 100%;
  height: 72rpx;
  background: $color-slate-50;
  border: 1rpx solid $color-slate-200;
  border-radius: $border-radius-base;
  padding: 0 $spacing-md;
  font-size: 26rpx;
  color: $color-slate-900;
}

/* 医院信息 */
.hospital-info {
  background: $color-slate-50;
  padding: $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  border-bottom: 1rpx solid $color-slate-200;
}

.hospital-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: $border-radius-base;
  background: white;
}

.hospital-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hospital-name-small {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.hospital-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.action-text {
  font-size: 22rpx;
  color: $hospital-primary;
}

.action-icon {
  font-size: 20rpx;
  color: $hospital-primary;
}

.hospital-address-small {
  font-size: 22rpx;
  color: $color-slate-600;
}

.switch-hospital {
  padding: 12rpx 20rpx;
  background: white;
  border: 1rpx solid $hospital-primary;
  border-radius: $border-radius-base;
}

.switch-text {
  font-size: 22rpx;
  color: $hospital-primary;
  font-weight: $font-medium;
}

/* 左右布局 */
.content-wrapper {
  flex: 1;
  display: flex;
  background: white;
}

/* 左侧分类栏 */
.category-sidebar {
  width: 200rpx;
  background: $color-slate-50;
  border-right: 1rpx solid $color-slate-200;
}

.category-item {
  padding: 32rpx 0;
  text-align: center;
  position: relative;
  transition: all 0.2s ease;
}

.category-item.active {
  background: white;
}

.category-text {
  font-size: 26rpx;
  color: $color-slate-700;
}

.category-item.active .category-text {
  color: $hospital-primary;
  font-weight: $font-semibold;
}

.category-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 40rpx;
  background: $hospital-primary;
  border-radius: 0 6rpx 6rpx 0;
}

/* 右侧科室列表 */
.department-content {
  flex: 1;
  padding: $spacing-md;
}

.department-item {
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $color-slate-100;
  transition: all 0.2s ease;
}

.department-item:active {
  background: $color-slate-50;
}

.dept-name {
  font-size: 28rpx;
  color: $color-slate-900;
  font-weight: $font-medium;
}

.empty-state {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: $color-slate-400;
}
</style>
