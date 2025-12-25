<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="nav">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
        <text>返回</text>
      </view>
      <text class="nav-title">{{ navTitle }}</text>
      <view class="nav-right"></view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-box">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 院区选择 -->
    <view v-if="step === 'hospital' && !loading" class="content">
      <view class="header">
        <text class="title">选择院区</text>
        <text class="subtitle">请选择就诊院区，或直接搜索医生</text>
      </view>
      
      <view class="search-box">
        <input placeholder="请输入医生姓名关键字" v-model="hospitalKeyword" @confirm="handleGlobalSearch" />
        <view class="search-btn" @tap="handleGlobalSearch">搜索</view>
      </view>
      
      <view class="section-header">
        <text class="section-title">医院列表</text>
      </view>
      
      <view class="hospital-list">
        <view class="hospital-card" v-for="h in filteredHospitals" :key="h.area_id" @tap="selectHospital(h)">
          <view class="card-top">
            <text class="name">{{ h.name }}</text>
            <view class="tag">{{ h.level }}</view>
          </view>
          <view class="card-info">
            <text>类型：{{ h.type }}</text>
            <text>地址：{{ h.destination }}</text>
          </view>
        </view>
        <view v-if="filteredHospitals.length === 0" class="empty">未找到相关医院</view>
      </view>
    </view>

    <!-- 科室选择 -->
    <view v-if="step === 'department' && !loading" class="content">
      <view class="header">
        <text class="title">选择科室</text>
        <text class="subtitle">每日早7点开始可挂第8日号源</text>
      </view>
      
      <view class="search-box">
        <input placeholder="请输入科室名" v-model="deptKeyword" @confirm="handleDeptSearch" />
        <view class="search-btn" @tap="handleDeptSearch">搜索</view>
      </view>
      
      <view class="hospital-info" @tap="viewHospitalIntro">
        <text class="name">{{ selectedHospital?.name }}</text>
        <view class="info-row">
          <text class="level">{{ selectedHospital?.level }}</text>
          <text class="link">查看简介</text>
        </view>
      </view>
      
      <!-- 搜索结果或分类展示 -->
      <template v-if="deptKeyword.trim()">
        <view class="section-header">
          <text class="section-title">搜索结果</text>
          <text class="count">{{ filteredDepartments.length }}个科室</text>
        </view>
        <view class="dept-list">
          <view class="dept-item" v-for="d in filteredDepartments" :key="d.minor_dept_id" @tap="selectDepartment(d)">
            <view class="dept-info">
              <text class="dept-name">{{ d.name }}</text>
              <text v-if="d.description" class="dept-desc">{{ d.description }}</text>
            </view>
            <text class="arrow">›</text>
          </view>
          <view v-if="filteredDepartments.length === 0" class="empty">未找到相关科室</view>
        </view>
      </template>
      
      <template v-else>
        <view class="categories">
          <view 
            class="category-item" 
            v-for="c in departmentCategories" 
            :key="c.major_dept_id"
            :class="{ active: selectedCategory == c.major_dept_id }"
            @tap="selectCategory(c.major_dept_id)"
          >
            {{ c.name }}
          </view>
        </view>
        
        <template v-if="selectedCategory">
          <view class="section-header">
            <text class="section-title">科室列表</text>
            <text class="count">{{ categoryDepartments.length }}个科室</text>
          </view>
          <view class="dept-list">
            <view class="dept-item" v-for="d in categoryDepartments" :key="d.minor_dept_id" @tap="selectDepartment(d)">
              <view class="dept-info">
                <text class="dept-name">{{ d.name }}</text>
                <text v-if="d.description" class="dept-desc">{{ d.description }}</text>
              </view>
              <text class="arrow">›</text>
            </view>
            <view v-if="categoryDepartments.length === 0" class="empty">当前分类暂无科室</view>
          </view>
        </template>
        
        <view v-else class="empty">请选择科室分类</view>
      </template>
    </view>

    <!-- 医生列表 -->
    <view v-if="step === 'doctors' && !showDoctorDetail" class="content">
      <view class="breadcrumb">
        <text class="crumb" @tap="goToHospital">{{ selectedHospital?.name || '全部医院' }}</text>
        <text class="sep">/</text>
        <text class="crumb current" @tap="goToDepartment">{{ selectedDepartment?.name || '全部科室' }}</text>
        <text v-if="isGlobalSearch" class="search-tag">搜索结果</text>
      </view>
      
      <view v-if="selectedDepartment && !isGlobalSearch" class="dept-card">
        <text class="dept-name">{{ selectedDepartment.name }}</text>
        <text v-if="selectedDepartment.description" class="dept-desc">{{ selectedDepartment.description }}</text>
      </view>
      
      <view v-if="isGlobalSearch" class="search-info">
        <text>搜索关键词：{{ globalSearchKeyword }}</text>
        <text>找到 {{ filteredDoctors.length }} 个相关医生</text>
      </view>
      
      <view class="search-box">
        <input placeholder="搜索医生姓名或专长..." v-model="searchKeyword" />
        <view class="search-btn" @tap="() => {}">搜索</view>
      </view>

      <!-- 筛选 -->
      <view class="filter-box">
        <view class="filter-group">
          <text class="filter-label">职称筛选：</text>
          <view class="filter-tags">
            <view class="tag" :class="{ active: filterTitle === 'all' }" @tap="filterTitle = 'all'">全部</view>
            <view class="tag" :class="{ active: filterTitle === '主任医师' }" @tap="filterTitle = '主任医师'">主任医师</view>
            <view class="tag" :class="{ active: filterTitle === '副主任医师' }" @tap="filterTitle = '副主任医师'">副主任医师</view>
            <view class="tag" :class="{ active: filterTitle === '其他职称' }" @tap="filterTitle = '其他职称'">其他职称</view>
          </view>
        </view>
        <view v-if="hasActiveFilters" class="filter-actions">
          <button class="clear-btn" @tap="clearFilters">重置筛选</button>
        </view>
      </view>

      <!-- 医生卡片 -->
      <view class="section-header">
        <text class="section-title">{{ isGlobalSearch ? '搜索结果' : '医生列表' }}</text>
        <text class="count">{{ filteredDoctors.length }}位医生</text>
      </view>
      
      <view class="doctor-list">
        <view class="doctor-card" v-for="d in filteredDoctors" :key="d.doctor_id">
          <view class="doctor-top">
            <image v-if="d.avatar" :src="d.avatar" class="avatar" mode="aspectFill" />
            <view v-else class="avatar placeholder">{{ d.name.charAt(0) }}</view>
            <view class="doctor-info">
              <view class="name-row">
                <text class="name">{{ d.name }}</text>
                <view class="title-tag">{{ d.title }}</view>
              </view>
            </view>
          </view>
          <text class="specialty">{{ d.specialty }}</text>
          <view class="doctor-actions">
            <view class="detail-btn" @tap="viewDoctorDetail(d)">查看详情</view>
          </view>
        </view>
        <view v-if="filteredDoctors.length === 0" class="empty">
          <text>未找到相关医生</text>
          <view class="empty-actions">
            <button @tap="clearFilters">清除筛选</button>
            <button class="primary" @tap="isGlobalSearch ? goToHospital() : goToDepartment()">
              {{ isGlobalSearch ? '返回院区' : '返回科室' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 医生详情 -->
    <view v-if="showDoctorDetail && selectedDoctor" class="content">
      <view class="detail-header">
        <image v-if="selectedDoctor.avatar" :src="selectedDoctor.avatar" class="avatar-lg" mode="aspectFill" />
        <view v-else class="avatar-lg placeholder">{{ selectedDoctor.name.charAt(0) }}</view>
        <view class="detail-info">
          <view class="name-row">
            <text class="name">{{ selectedDoctor.name }}</text>
            <view class="title-badge">{{ selectedDoctor.title }}</view>
          </view>
        </view>
      </view>

      <view class="info-card">
        <view class="card-header">专业信息</view>
        <view class="card-content">
          <text class="label">专业特长</text>
          <text class="value">{{ selectedDoctor.specialty }}</text>
        </view>
      </view>

      <view class="info-card">
        <view class="card-header">详细介绍</view>
        <view class="card-content">
          <text class="intro">{{ selectedDoctor.introduction || '暂无介绍' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useDoctorsStore, resetDoctorsStore } from '@/api/doctors.js'

const store = useDoctorsStore()

const {
  step, searchKeyword, deptKeyword, hospitalKeyword, filterTitle,
  selectedCategory, selectedHospital, selectedDepartment,
  isGlobalSearch, globalSearchKeyword, selectedDoctor, showDoctorDetail,
  loading, hospitals, departmentCategories, departments, doctors,
  navTitle, filteredHospitals, filteredDepartments, categoryDepartments,
  hasActiveFilters, filteredDoctors,
  init, initWithParams, goBack, goToHospital, goToDepartment, selectHospital,
  handleDeptSearch, handleGlobalSearch, viewHospitalIntro,
  selectCategory, selectDepartment, clearFilters, viewDoctorDetail
} = store

onLoad((options) => {
  console.log('📄 doctors.vue onLoad')
  
  // 检查是否有URL参数，如果有则使用参数导航
  if (options.hospital || options.department || options.keyword || options.level) {
    initWithParams({
      hospital: options.hospital ? decodeURIComponent(options.hospital) : undefined,
      department: options.department ? decodeURIComponent(options.department) : undefined,
      keyword: options.keyword ? decodeURIComponent(options.keyword) : undefined,
      level: options.level ? decodeURIComponent(options.level) : undefined
    })
  } else {
    init()
  }
})

// 🔧 修复：页面卸载时完全重置 store 实例，确保下次进入时使用全新的响应式状态
onUnload(() => {
  console.log('📄 doctors.vue onUnload - 完全重置 store')
  resetDoctorsStore()
})
</script>

<style lang="scss" scoped>
$primary: #00BFCC;
$text: #0f172a;
$text-light: #64748b;
$border: #e2e8f0;
$bg: #f8fafc;

.container {
  background: $bg;
  min-height: 100vh;
  padding-top: 88rpx;
}

.nav {
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
  border-bottom: 1rpx solid $border;
  z-index: 1000;

  .nav-back {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: $text;
    .back-icon { font-size: 36rpx; margin-right: 8rpx; }
  }
  .nav-title { font-size: 32rpx; font-weight: 600; color: $text; }
  .nav-right { width: 100rpx; }
}

.content { padding: 0 24rpx 40rpx; }

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid $border;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: $text-light;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.header {
  padding: 24rpx 0;
  .title { font-size: 36rpx; font-weight: 700; color: $text; display: block; margin-bottom: 8rpx; }
  .subtitle { font-size: 24rpx; color: $text-light; }
}

.search-box {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid $border;
  margin-bottom: 24rpx;

  input { flex: 1; font-size: 28rpx; }
  .search-btn {
    margin-left: 16rpx;
    background: $primary;
    color: white;
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24rpx 0 16rpx;
  .section-title { font-size: 28rpx; font-weight: 600; color: $text; }
  .count { font-size: 24rpx; color: $text-light; }
}

.hospital-list {
  .hospital-card {
    background: white;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid $border;

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      .name { font-size: 28rpx; font-weight: 600; color: $text; }
      .tag { padding: 6rpx 16rpx; background: $primary; color: white; border-radius: 6rpx; font-size: 22rpx; }
    }
    .card-info {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      font-size: 24rpx;
      color: $text-light;
    }
  }
}

.hospital-info {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid $border;
  .name { font-size: 28rpx; font-weight: 600; color: $text; display: block; margin-bottom: 8rpx; }
  .info-row { display: flex; justify-content: space-between; }
  .level { font-size: 24rpx; color: $primary; background: #f0f9ff; padding: 4rpx 12rpx; border-radius: 6rpx; }
  .link { font-size: 24rpx; color: $primary; }
}

.categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;

  .category-item {
    background: white;
    border-radius: 12rpx;
    padding: 36rpx 24rpx;
    text-align: center;
    border: 2rpx solid $border;
    font-size: 28rpx;
    font-weight: 600;
    color: $text;
    &.active { border-color: $primary; background: $primary; color: white; }
  }
}

.dept-list {
  background: white;
  border-radius: 12rpx;
  border: 1rpx solid $border;

  .dept-item {
    padding: 28rpx 24rpx;
    border-bottom: 1rpx solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .dept-info { flex: 1; }
    .dept-name { font-size: 28rpx; color: $text; font-weight: 500; display: block; margin-bottom: 8rpx; }
    .dept-desc { font-size: 24rpx; color: $text-light; }
    .arrow { font-size: 36rpx; color: #94a3b8; }
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  flex-wrap: wrap;
  .crumb { font-size: 26rpx; color: $primary; font-weight: 500; &.current { color: $text; } }
  .sep { margin: 0 12rpx; color: #cbd5e1; }
  .search-tag { margin-left: 16rpx; padding: 4rpx 12rpx; background: #f0f9ff; color: $primary; border-radius: 6rpx; font-size: 22rpx; }
}

.dept-card, .search-info {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid $border;
  .dept-name { font-size: 28rpx; font-weight: 600; color: $text; display: block; margin-bottom: 8rpx; }
  .dept-desc { font-size: 24rpx; color: $text-light; }
}

.filter-box {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid $border;

  .filter-group { margin-bottom: 16rpx; }
  .filter-label { font-size: 26rpx; font-weight: 600; color: $text; display: block; margin-bottom: 16rpx; }
  .filter-tags { display: flex; flex-wrap: wrap; gap: 16rpx; }
  .tag {
    padding: 16rpx 28rpx;
    background: $bg;
    border: 1rpx solid $border;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: $text-light;
    &.active { background: $primary; color: white; border-color: $primary; }
  }
  .filter-actions { padding-top: 16rpx; border-top: 1rpx solid #f1f5f9; }
  .clear-btn { background: $bg; border: 1rpx solid $border; border-radius: 8rpx; padding: 12rpx 24rpx; font-size: 24rpx; color: $text-light; }
}

.doctor-list {
  .doctor-card {
    background: white;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    border: 1rpx solid $border;

    .doctor-top { display: flex; align-items: center; margin-bottom: 16rpx; }
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      &.placeholder { background: $primary; display: flex; align-items: center; justify-content: center; color: white; font-size: 32rpx; font-weight: 600; }
    }
    .doctor-info { flex: 1; }
    .name-row { display: flex; align-items: center; }
    .name { font-size: 28rpx; font-weight: 700; color: $text; margin-right: 16rpx; }
    .title-tag { padding: 6rpx 16rpx; background: $primary; color: white; border-radius: 6rpx; font-size: 22rpx; }
    .specialty { font-size: 24rpx; color: #374151; line-height: 1.4; margin-bottom: 16rpx; }
    .doctor-actions { display: flex; justify-content: flex-end; padding-top: 16rpx; border-top: 1rpx solid #f1f5f9; }
    .detail-btn { padding: 12rpx 24rpx; background: $primary; color: white; border-radius: 8rpx; font-size: 24rpx; }
  }
}

.empty {
  text-align: center;
  padding: 80rpx 40rpx;
  background: white;
  border-radius: 12rpx;
  border: 1rpx solid $border;
  font-size: 28rpx;
  color: $text;

  .empty-actions {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    margin-top: 24rpx;
    button {
      padding: 16rpx 32rpx;
      background: $bg;
      border: 1rpx solid $border;
      border-radius: 8rpx;
      font-size: 24rpx;
      color: $text-light;
      &.primary { background: $primary; color: white; border: none; }
    }
  }
}

.detail-header {
  background: white;
  border-radius: 12rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid $border;
  display: flex;
  align-items: center;

  .avatar-lg {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 32rpx;
    &.placeholder { background: $primary; display: flex; align-items: center; justify-content: center; color: white; font-size: 48rpx; font-weight: 600; }
  }
  .detail-info { flex: 1; }
  .name-row { display: flex; align-items: center; margin-bottom: 12rpx; }
  .name { font-size: 32rpx; font-weight: 700; color: $text; margin-right: 16rpx; }
  .title-badge { padding: 6rpx 16rpx; background: $primary; color: white; border-radius: 6rpx; font-size: 22rpx; }
}

.info-card {
  background: white;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid $border;

  .card-header { padding: 24rpx; border-bottom: 1rpx solid #f1f5f9; font-size: 28rpx; font-weight: 600; color: $text; }
  .card-content { padding: 24rpx; }
  .label { font-size: 24rpx; color: $text-light; display: block; margin-bottom: 8rpx; }
  .value { font-size: 26rpx; color: $text; line-height: 1.4; }
  .intro { font-size: 24rpx; color: #374151; line-height: 1.6; }
}
</style>
