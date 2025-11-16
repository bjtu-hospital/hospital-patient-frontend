<template>
  <view class="health-detail-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <uni-icons type="left" size="24" color="#1f2937"></uni-icons>
      </view>
      <text class="navbar-title">{{ categoryName }}</text>
      <view class="navbar-right"></view>
    </view>

    <!-- 分类信息卡片 -->
    <view class="category-info-card">
      <view class="info-header">
        <view class="info-icon" :class="categoryKey">
          <uni-icons :type="iconType" size="32" color="white"></uni-icons>
        </view>
        <view class="info-text">
          <text class="info-title">{{ categoryName }}</text>
          <text class="info-desc">{{ categoryDesc }}</text>
        </view>
      </view>
      <view class="info-stats">
        <view class="stat">
          <text class="stat-label">总记录数</text>
          <text class="stat-value">{{ records.length }}</text>
        </view>
        <view class="stat">
          <text class="stat-label">最近更新</text>
          <text class="stat-value">{{ lastUpdateTime }}</text>
        </view>
      </view>
    </view>

    <!-- 筛选和排序 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="toggleSortOrder">
        <uni-icons type="sort" size="18" color="#64748b"></uni-icons>
        <text>{{ sortOrder === 'desc' ? '最新优先' : '最早优先' }}</text>
      </view>
      <view class="filter-divider"></view>
      <view class="filter-item" @tap="showFilterModal">
        <uni-icons type="funnel" size="18" color="#64748b"></uni-icons>
        <text>筛选</text>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="records-list">
      <view 
        v-if="filteredRecords.length === 0" 
        class="empty-state"
      >
        <view class="empty-icon">
          <uni-icons type="circle" size="48" color="#cbd5e1"></uni-icons>
        </view>
        <text class="empty-text">暂无记录</text>
        <text class="empty-desc">开始添加您的健康信息</text>
        <button class="empty-btn" @tap="addRecord">
          <uni-icons type="plus" size="18" color="white"></uni-icons>
          <text>添加记录</text>
        </button>
      </view>

      <view v-else class="records-content">
        <view 
          v-for="(record, index) in filteredRecords" 
          :key="record.id"
          class="record-card"
          @tap="viewRecordDetail(record)"
        >
          <view class="record-header">
            <text class="record-date">{{ formatDate(record.date) }}</text>
            <view class="record-actions" @tap.stop="showRecordMenu(record, $event)">
              <uni-icons type="ellipsis" size="18" color="#94a3b8"></uni-icons>
            </view>
          </view>

          <view class="record-content">
            <view v-if="categoryKey === 'basic'" class="basic-info">
              <view class="info-row">
                <text class="label">身高</text>
                <text class="value">{{ record.height }} cm</text>
              </view>
              <view class="info-row">
                <text class="label">体重</text>
                <text class="value">{{ record.weight }} kg</text>
              </view>
              <view class="info-row">
                <text class="label">血型</text>
                <text class="value">{{ record.bloodType }}</text>
              </view>
              <view v-if="record.allergies?.length" class="info-row">
                <text class="label">过敏史</text>
                <view class="tags">
                  <view v-for="allergy in record.allergies" :key="allergy" class="tag">
                    {{ allergy }}
                  </view>
                </view>
              </view>
            </view>

            <view v-else-if="categoryKey === 'checkup'" class="checkup-info">
              <view class="info-row">
                <text class="label">体检类型</text>
                <text class="value">{{ record.checkupType }}</text>
              </view>
              <view class="info-row">
                <text class="label">体检机构</text>
                <text class="value">{{ record.hospital }}</text>
              </view>
              <view class="info-row">
                <text class="label">总体评价</text>
                <text class="value" :class="record.result">{{ record.result }}</text>
              </view>
            </view>

            <view v-else-if="categoryKey === 'medication'" class="medication-info">
              <view class="info-row">
                <text class="label">药物名称</text>
                <text class="value">{{ record.medicationName }}</text>
              </view>
              <view class="info-row">
                <text class="label">用法用量</text>
                <text class="value">{{ record.dosage }}</text>
              </view>
              <view class="info-row">
                <text class="label">用药时长</text>
                <text class="value">{{ record.duration }}</text>
              </view>
            </view>

            <view v-else-if="categoryKey === 'vision'" class="vision-info">
              <view class="info-row">
                <text class="label">左眼视力</text>
                <text class="value">{{ record.leftEye }}</text>
              </view>
              <view class="info-row">
                <text class="label">右眼视力</text>
                <text class="value">{{ record.rightEye }}</text>
              </view>
              <view class="info-row">
                <text class="label">建议</text>
                <text class="value">{{ record.recommendation }}</text>
              </view>
            </view>

            <view v-else-if="categoryKey === 'vaccination'" class="vaccination-info">
              <view class="info-row">
                <text class="label">疫苗名称</text>
                <text class="value">{{ record.vaccineName }}</text>
              </view>
              <view class="info-row">
                <text class="label">批号</text>
                <text class="value">{{ record.batch }}</text>
              </view>
              <view class="info-row">
                <text class="label">下次接种</text>
                <text class="value">{{ formatDate(record.nextDue) }}</text>
              </view>
            </view>
          </view>

          <view class="record-footer">
            <text class="footer-text">点击查看详情</text>
            <uni-icons type="arrowright" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view v-if="filteredRecords.length > 0" class="add-button" @tap="addRecord">
      <uni-icons type="plus" size="24" color="white"></uni-icons>
    </view>

    <!-- 操作菜单 -->
    <view v-if="showMenu" class="menu-overlay" @tap="closeMenu">
      <view class="menu-popup" @tap.stop>
        <view class="menu-item edit" @tap="editRecord">
          <uni-icons type="compose" size="18" color="#3b82f6"></uni-icons>
          <text>编辑</text>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item delete" @tap="deleteRecord">
          <uni-icons type="trash" size="18" color="#ef4444"></uni-icons>
          <text>删除</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategoryRecords, getCategoryConfig } from './mock'

const categoryKey = ref('basic')
const categoryName = ref('基本信息')
const categoryDesc = ref('身高体重、血型等基础信息')
const iconType = ref('paperplane-filled')
const records = ref([])
const sortOrder = ref('desc')
const showMenu = ref(false)
const selectedRecord = ref(null)

// 计算属性
const filteredRecords = computed(() => {
  let result = [...records.value]
  if (sortOrder.value === 'asc') {
    result.reverse()
  }
  return result
})

const lastUpdateTime = computed(() => {
  if (records.value.length === 0) return '暂无'
  return formatDate(records.value[0].date)
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return dateStr
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const showFilterModal = () => {
  uni.showToast({
    title: '筛选功能开发中',
    icon: 'none'
  })
}

const viewRecordDetail = (record) => {
  uni.navigateTo({
    url: `/pages/profile/health/record-detail?id=${record.id}&category=${categoryKey.value}`
  })
}

const showRecordMenu = (record, event) => {
  selectedRecord.value = record
  showMenu.value = true
}

const closeMenu = () => {
  showMenu.value = false
  selectedRecord.value = null
}

const editRecord = () => {
  closeMenu()
  uni.showToast({
    title: '编辑功能开发中',
    icon: 'none'
  })
}

const deleteRecord = () => {
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条记录吗？',
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        records.value = records.value.filter(r => r.id !== selectedRecord.value.id)
        closeMenu()
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
      }
    }
  })
}

const addRecord = () => {
  uni.showToast({
    title: '添加记录功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  // 从路由参数获取分类信息
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options

  if (options.category) {
    categoryKey.value = options.category
    
    // 从 mock 数据获取分类配置
    const config = getCategoryConfig(categoryKey.value)
    categoryName.value = config.name
    categoryDesc.value = config.description
    iconType.value = config.icon
  }

  // 加载记录数据
  records.value = getCategoryRecords(categoryKey.value)
})
</script>

<style lang="scss" scoped>
$hospital-primary: #00BFCC;
$color-slate-50: #f8fafc;
$color-slate-100: #f1f5f9;
$color-slate-200: #e2e8f0;
$color-slate-300: #cbd5e1;
$color-slate-600: #475569;
$color-slate-900: #0f172a;
$spacing-sm: 8rpx;
$spacing-md: 16rpx;
$spacing-lg: 24rpx;
$border-radius-base: 12rpx;
$box-shadow-base: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

.health-detail-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding-bottom: 100rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  background: white;
  padding: 16rpx $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid $color-slate-200;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left,
.navbar-right {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-slate-900;
}

/* 分类信息卡片 */
.category-info-card {
  background: white;
  margin: $spacing-lg $spacing-md;
  padding: $spacing-lg;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.info-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-md;

  &.basic {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  }
  &.checkup {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  }
  &.medication {
    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
  }
  &.vision {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
  &.vaccination {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
}

.info-text {
  flex: 1;
}

.info-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-slate-900;
  margin-bottom: 4rpx;
}

.info-desc {
  display: block;
  font-size: 24rpx;
  color: $color-slate-600;
}

.info-stats {
  display: flex;
  gap: $spacing-lg;
  padding-top: $spacing-lg;
  border-top: 1rpx solid $color-slate-100;
}

.stat {
  flex: 1;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: $color-slate-600;
  margin-bottom: 4rpx;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $hospital-primary;
}

/* 筛选栏 */
.filter-bar {
  background: white;
  margin: 0 $spacing-md;
  padding: $spacing-md;
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  box-shadow: $box-shadow-base;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: $color-slate-600;
  padding: 8rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;

  &:active {
    background: $color-slate-100;
  }
}

.filter-divider {
  width: 1rpx;
  height: 24rpx;
  background: $color-slate-200;
}

/* 记录列表 */
.records-list {
  padding: $spacing-lg $spacing-md;
}

.empty-state {
  text-align: center;
  padding: 80rpx $spacing-md;
}

.empty-icon {
  margin-bottom: $spacing-lg;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-slate-900;
  margin-bottom: 8rpx;
}

.empty-desc {
  display: block;
  font-size: 24rpx;
  color: $color-slate-600;
  margin-bottom: $spacing-lg;
}

.empty-btn {
  background: $hospital-primary;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
}

.records-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.record-card {
  background: white;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;
  overflow: hidden;
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
  }
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid $color-slate-100;
}

.record-date {
  font-size: 26rpx;
  font-weight: 600;
  color: $color-slate-900;
}

.record-actions {
  padding: 8rpx;
  border-radius: 6rpx;
  transition: all 0.2s ease;

  &:active {
    background: $color-slate-100;
  }
}

.record-content {
  padding: $spacing-lg;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 24rpx;
  color: $color-slate-600;
  min-width: 80rpx;
}

.value {
  font-size: 24rpx;
  color: $color-slate-900;
  font-weight: 500;
  text-align: right;
  flex: 1;

  &.normal {
    color: #10b981;
  }
  &.warning {
    color: #f59e0b;
  }
  &.abnormal {
    color: #ef4444;
  }
}

.tags {
  display: flex;
  gap: 6rpx;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex: 1;
}

.tag {
  background: $color-slate-100;
  color: $color-slate-600;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
}

.record-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6rpx;
  padding: $spacing-md;
  background: $color-slate-50;
  font-size: 22rpx;
  color: $color-slate-600;
}

/* 添加按钮 */
.add-button {
  position: fixed;
  bottom: 80rpx;
  right: $spacing-lg;
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, #00a8b8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(0, 191, 204, 0.2);
  }
}

/* 操作菜单 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.menu-popup {
  background: white;
  width: 100%;
  border-radius: 16rpx 16rpx 0 0;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  font-size: 28rpx;
  transition: all 0.2s ease;

  &:active {
    background: $color-slate-50;
  }

  &.edit {
    color: #3b82f6;
  }

  &.delete {
    color: #ef4444;
  }
}

.menu-divider {
  height: 1rpx;
  background: $color-slate-200;
}
</style>
