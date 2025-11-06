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

const appointmentStore = useAppointmentStore()
const currentHospital = ref(null)
const selectedCategory = ref('internal')
const searchKeyword = ref('')

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

// 科室数据（完整版）
const departments = ref([
  // 内科
  { id: 1, name: '呼吸与危重症医学科门诊', category: 'internal', todaySlots: 8, tomorrowSlots: 10, priceRange: '¥15-50' },
  { id: 2, name: '呼吸睡眠医学科门诊（西直门）', category: 'internal', todaySlots: 6, tomorrowSlots: 8, priceRange: '¥15-50' },
  { id: 3, name: '消化内科门诊', category: 'internal', todaySlots: 10, tomorrowSlots: 12, priceRange: '¥15-50' },
  { id: 4, name: '肝病门诊（西直门院区）', category: 'internal', todaySlots: 5, tomorrowSlots: 7, priceRange: '¥15-50' },
  { id: 5, name: '心内科门诊（西直门院区）', category: 'internal', todaySlots: 12, tomorrowSlots: 15, priceRange: '¥15-50' },
  { id: 6, name: '高血压科门诊(西直门)', category: 'internal', todaySlots: 25, tomorrowSlots: 25, priceRange: '¥15-50' },
  { id: 7, name: '肾内科门诊', category: 'internal', todaySlots: 8, tomorrowSlots: 9, priceRange: '¥15-50' },
  { id: 8, name: '血液科门诊', category: 'internal', todaySlots: 6, tomorrowSlots: 8, priceRange: '¥15-50' },
  { id: 9, name: '内分泌科门诊', category: 'internal', todaySlots: 15, tomorrowSlots: 18, priceRange: '¥15-50' },
  
  // 外科
  { id: 101, name: '普通外科', category: 'surgical', todaySlots: 8, tomorrowSlots: 10, priceRange: '¥20-60' },
  { id: 102, name: '骨科门诊', category: 'surgical', todaySlots: 12, tomorrowSlots: 15, priceRange: '¥20-60' },
  { id: 103, name: '泌尿外科', category: 'surgical', todaySlots: 6, tomorrowSlots: 8, priceRange: '¥20-60' },
  { id: 104, name: '神经外科', category: 'surgical', todaySlots: 5, tomorrowSlots: 7, priceRange: '¥20-80' },
  
  // 妇产科
  { id: 201, name: '妇科门诊', category: 'gynecology', todaySlots: 15, tomorrowSlots: 18, priceRange: '¥25-60' },
  { id: 202, name: '产科门诊', category: 'gynecology', todaySlots: 10, tomorrowSlots: 12, priceRange: '¥25-60' },
  
  // 儿科
  { id: 301, name: '儿科门诊', category: 'pediatrics', todaySlots: 20, tomorrowSlots: 25, priceRange: '¥15-40' },
  { id: 302, name: '新生儿科', category: 'pediatrics', todaySlots: 8, tomorrowSlots: 10, priceRange: '¥15-40' },
  
  // 五官科
  { id: 401, name: '眼科门诊', category: 'ent', todaySlots: 12, tomorrowSlots: 15, priceRange: '¥25-70' },
  { id: 402, name: '耳鼻喉科', category: 'ent', todaySlots: 10, tomorrowSlots: 12, priceRange: '¥25-60' },
  { id: 403, name: '口腔科', category: 'ent', todaySlots: 15, tomorrowSlots: 18, priceRange: '¥30-100' },
  
  // 中医科
  { id: 501, name: '中医内科', category: 'tcm', todaySlots: 8, tomorrowSlots: 10, priceRange: '¥20-50' },
  { id: 502, name: '针灸科', category: 'tcm', todaySlots: 6, tomorrowSlots: 8, priceRange: '¥30-60' },
  
  // 皮科
  { id: 601, name: '皮肤科', category: 'dermatology', todaySlots: 12, tomorrowSlots: 15, priceRange: '¥25-60' },
  
  // 其他科
  { id: 701, name: '心理咨询科', category: 'other', todaySlots: 5, tomorrowSlots: 6, priceRange: '¥80-200' },
  { id: 702, name: '康复医学科', category: 'other', todaySlots: 8, tomorrowSlots: 10, priceRange: '¥40-100' },
  
  // 术前管理中心
  { id: 801, name: '术前评估门诊', category: 'preop', todaySlots: 10, tomorrowSlots: 12, priceRange: '¥30-80' },
  
  // 国际医疗部
  { id: 901, name: '国际医疗门诊', category: 'international', todaySlots: 5, tomorrowSlots: 6, priceRange: '¥200-500' }
])

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
  
  // 如果没有医院信息，不做任何处理
  // 页面会显示空数据，用户看到异常会回到正确流程
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
