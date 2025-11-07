<template>
  <view class="select-hospital-container">
    <!-- 顶部导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <uni-icons type="closeempty" size="32" color="#475569"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">预约挂号</text>
      </view>
      <view class="navbar-right" @tap="goToMyAppointments">
        <text class="link-text">我的预约</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <view class="search-icon">
          <uni-icons type="search" size="24" color="#94a3b8"></uni-icons>
        </view>
        <input 
          class="search-input" 
          type="text" 
          placeholder="请输入科室/医生/疾病/症状"
          v-model="searchKeyword"
          @confirm="handleSearch"
        />
      </view>
    </view>

    <!-- 医院列表标题 -->
    <view class="list-header">
      <text class="header-title">医院列表</text>
      <view class="sort-button" @tap="toggleSort">
        <text class="sort-text">{{ sortText }}</text>
        <text class="sort-icon">▼</text>
      </view>
    </view>

    <!-- 医院列表 -->
    <view class="hospital-list">
      <view 
        class="hospital-card" 
        v-for="hospital in filteredHospitals" 
        :key="hospital.id"
        @tap="selectHospital(hospital)"
      >
        <image class="hospital-image" :src="hospital.image" mode="aspectFill"></image>
        <view class="hospital-content">
          <view class="hospital-header">
            <text class="hospital-name">{{ hospital.name }}</text>
          </view>
          <view class="hospital-tags">
            <text class="tag tag-level">{{ hospital.level }}</text>
            <text class="tag tag-type">{{ hospital.type }}</text>
          </view>
          <view class="hospital-address">
            <view class="address-icon">
              <uni-icons type="location-filled" size="20" color="#00BFCC"></uni-icons>
            </view>
            <text class="address-text">{{ hospital.address }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { getHospitals } from '@/api/appointment'  // ✨ 直接使用 API

const appointmentStore = useAppointmentStore()
const searchKeyword = ref('')
const sortMode = ref('default') // default, distance, name
const loading = ref(false)

// 医院数据（从 API 获取）
const hospitals = ref([])

// 加载医院数据
const loadHospitals = async () => {
  try {
    loading.value = true
    // ✨ 调用 API，自动判断使用 Mock 还是真实接口
    const data = await getHospitals()
    hospitals.value = data
  } catch (error) {
    console.error('获取医院列表失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 排序文本
const sortText = computed(() => {
  const map = {
    'default': '默认排序',
    'distance': '距离优先',
    'name': '名称排序'
  }
  return map[sortMode.value]
})

// 过滤和排序后的医院列表
const filteredHospitals = computed(() => {
  let result = [...hospitals.value]
  
  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(h => 
      h.name.toLowerCase().includes(keyword) || 
      h.address.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  if (sortMode.value === 'distance') {
    result.sort((a, b) => a.distance - b.distance)
  } else if (sortMode.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }
  
  return result
})

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 前往我的预约
const goToMyAppointments = () => {
  uni.navigateTo({
    url: '/pages/profile/appointments'
  })
}

// 切换排序
const toggleSort = () => {
  uni.showActionSheet({
    itemList: ['默认排序', '距离优先', '名称排序'],
    success: (res) => {
      const modes = ['default', 'distance', 'name']
      sortMode.value = modes[res.tapIndex]
    }
  })
}

// 搜索
const handleSearch = () => {
  console.log('搜索:', searchKeyword.value)
}

// 选择医院
const selectHospital = (hospital) => {
  // 使用 Pinia Store 保存选择
  appointmentStore.setSelectedHospital(hospital)
  
  // 跳转到选择科室页面
  uni.navigateTo({
    url: '/pages/home/appointment/select-department'
  })
}

// 页面加载时获取医院列表
onMounted(() => {
  loadHospitals()
})
</script>

<style lang="scss" scoped>
.select-hospital-container {
  background: $color-slate-50;
  min-height: 100vh;
}

/* 自定义导航栏 */
.custom-navbar {
  background: white;
  padding: 32rpx $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid $color-slate-200;
}

.navbar-left {
  width: 80rpx;
}

.icon-back {
  font-size: 40rpx;
  color: $color-slate-700;
}

.navbar-center {
  flex: 1;
  text-align: center;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.navbar-right {
  width: 120rpx;
  text-align: right;
}

.link-text {
  font-size: 26rpx;
  color: $hospital-primary;
  font-weight: $font-medium;
}

/* 搜索栏 */
.search-section {
  padding: $spacing-md;
  background: white;
}

.search-bar {
  display: flex;
  align-items: center;
  background: $color-slate-50;
  border: 1rpx solid $color-slate-200;
  border-radius: $border-radius-base;
  padding: 0 $spacing-md;
  height: 72rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: $spacing-sm;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: $color-slate-900;
}

/* 列表头部 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: $color-slate-50;
}

.header-title {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.sort-text {
  font-size: 24rpx;
  color: $color-slate-600;
}

.sort-icon {
  font-size: 20rpx;
  color: $color-slate-400;
}

/* 医院列表 */
.hospital-list {
  padding: 0 $spacing-md $spacing-lg;
}

.hospital-card {
  background: white;
  border-radius: $border-radius-base;
  margin-bottom: $spacing-base;
  overflow: hidden;
  box-shadow: $box-shadow-base;
  transition: all 0.2s ease;
}

.hospital-card:active {
  transform: translateY(-2rpx);
  box-shadow: $box-shadow-md;
}

.hospital-image {
  width: 100%;
  height: 200rpx;
  background: $color-slate-100;
}

.hospital-content {
  padding: $spacing-md;
}

.hospital-header {
  margin-bottom: $spacing-sm;
}

.hospital-name {
  font-size: 30rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  line-height: 1.4;
}

.hospital-tags {
  display: flex;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.tag {
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: $font-medium;
}

.tag-level {
  background: #E0F2FE;
  color: #0284c7;
}

.tag-type {
  background: #F0FDFF;
  color: $hospital-primary;
}

.hospital-address {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.address-icon {
  font-size: 24rpx;
}

.address-text {
  font-size: 24rpx;
  color: $color-slate-600;
  line-height: 1.5;
}
</style>
