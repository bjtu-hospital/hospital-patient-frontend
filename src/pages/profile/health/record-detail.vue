<template>
  <view class="record-detail-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <uni-icons type="left" size="24" color="#1f2937"></uni-icons>
      </view>
      <text class="navbar-title">记录详情</text>
      <view class="navbar-right" @tap="showMenu">
        <uni-icons type="ellipsis" size="24" color="#1f2937"></uni-icons>
      </view>
    </view>

    <!-- 详情内容 -->
    <view class="detail-content">
      <!-- 基本信息卡片 -->
      <view class="detail-card">
        <view class="card-header">
          <text class="card-title">记录信息</text>
          <text class="card-date">{{ formatDate(recordData.date) }}</text>
        </view>
        <view class="card-body">
          <view v-for="(value, key) in displayFields" :key="key" class="detail-row">
            <text class="row-label">{{ getFieldLabel(key) }}</text>
            <view class="row-value-wrapper">
              <text v-if="!Array.isArray(value)" class="row-value">{{ value }}</text>
              <view v-else class="tags-wrapper">
                <view v-for="tag in value" :key="tag" class="tag">{{ tag }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 备注卡片 -->
      <view v-if="recordData.notes" class="detail-card">
        <view class="card-header">
          <text class="card-title">备注</text>
        </view>
        <view class="card-body">
          <text class="notes-text">{{ recordData.notes }}</text>
        </view>
      </view>

      <!-- 附件卡片 -->
      <view v-if="recordData.attachments?.length" class="detail-card">
        <view class="card-header">
          <text class="card-title">附件</text>
        </view>
        <view class="card-body">
          <view v-for="(attachment, index) in recordData.attachments" :key="index" class="attachment-item">
            <view class="attachment-icon">
              <uni-icons type="paperclip" size="20" color="#3b82f6"></uni-icons>
            </view>
            <view class="attachment-info">
              <text class="attachment-name">{{ attachment.name }}</text>
              <text class="attachment-size">{{ formatFileSize(attachment.size) }}</text>
            </view>
            <view class="attachment-action">
              <uni-icons type="download" size="20" color="#64748b"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="btn btn-secondary" @tap="shareRecord">
          <uni-icons type="share" size="20" color="#00BFCC"></uni-icons>
          <text>分享</text>
        </button>
        <button class="btn btn-primary" @tap="editRecord">
          <uni-icons type="compose" size="20" color="white"></uni-icons>
          <text>编辑</text>
        </button>
      </view>
    </view>

    <!-- 操作菜单 -->
    <view v-if="showMenuFlag" class="menu-overlay" @tap="closeMenu">
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
import { getRecordDetail } from './mock'

const recordId = ref('')
const categoryKey = ref('')
const recordData = ref({})
const showMenuFlag = ref(false)

// 字段标签映射
const fieldLabels = {
  height: '身高',
  weight: '体重',
  bloodType: '血型',
  allergies: '过敏史',
  checkupType: '体检类型',
  hospital: '体检机构',
  result: '总体评价',
  medicationName: '药物名称',
  dosage: '用法用量',
  duration: '用药时长',
  reason: '用药原因',
  leftEye: '左眼视力',
  rightEye: '右眼视力',
  recommendation: '建议',
  vaccineName: '疫苗名称',
  batch: '批号',
  nextDue: '下次接种'
}

// 计算属性
const displayFields = computed(() => {
  const fields = {}
  const excludeFields = ['date', 'notes', 'attachments']
  
  for (const [key, value] of Object.entries(recordData.value)) {
    if (!excludeFields.includes(key) && value !== undefined && value !== null && value !== '') {
      fields[key] = value
    }
  }
  
  return fields
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFieldLabel = (key) => {
  return fieldLabels[key] || key
}

const showMenu = () => {
  showMenuFlag.value = true
}

const closeMenu = () => {
  showMenuFlag.value = false
}

const editRecord = () => {
  closeMenu()
  uni.showToast({
    title: '编辑功能开发中',
    icon: 'none'
  })
}

const deleteRecord = () => {
  closeMenu()
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条记录吗？',
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '已删除',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}

const shareRecord = () => {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  // 从路由参数获取记录ID和分类
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options

  recordId.value = options.id
  categoryKey.value = options.category

  // 从 mock 数据加载记录
  recordData.value = getRecordDetail(recordId.value)
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

.record-detail-container {
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
  border-radius: 6rpx;
  transition: all 0.2s ease;

  &:active {
    background: $color-slate-100;
  }
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-slate-900;
}

/* 详情内容 */
.detail-content {
  padding: $spacing-lg $spacing-md;
}

.detail-card {
  background: white;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;
  margin-bottom: $spacing-lg;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1rpx solid $color-slate-100;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-slate-900;
}

.card-date {
  font-size: 24rpx;
  color: $color-slate-600;
}

.card-body {
  padding: $spacing-lg;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

.row-label {
  font-size: 24rpx;
  color: $color-slate-600;
  min-width: 100rpx;
  flex-shrink: 0;
}

.row-value-wrapper {
  flex: 1;
  text-align: right;
}

.row-value {
  display: block;
  font-size: 24rpx;
  color: $color-slate-900;
  font-weight: 500;
}

.tags-wrapper {
  display: flex;
  gap: $spacing-sm;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.tag {
  background: linear-gradient(135deg, $hospital-primary 0%, #00a8b8 100%);
  color: white;
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.notes-text {
  display: block;
  font-size: 24rpx;
  color: $color-slate-600;
  line-height: 1.6;
}

/* 附件 */
.attachment-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $color-slate-50;
  border-radius: 8rpx;
  margin-bottom: $spacing-md;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    background: $color-slate-100;
  }
}

.attachment-icon {
  width: 40rpx;
  height: 40rpx;
  background: white;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  display: block;
  font-size: 24rpx;
  color: $color-slate-900;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.attachment-size {
  display: block;
  font-size: 22rpx;
  color: $color-slate-600;
}

.attachment-action {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.btn {
  flex: 1;
  height: 56rpx;
  border: none;
  border-radius: $border-radius-base;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2rpx);
  }
}

.btn-primary {
  background: linear-gradient(135deg, $hospital-primary 0%, #00a8b8 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.3);

  &:active {
    box-shadow: 0 2rpx 8rpx rgba(0, 191, 204, 0.2);
  }
}

.btn-secondary {
  background: white;
  color: $hospital-primary;
  border: 2rpx solid $hospital-primary;
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
