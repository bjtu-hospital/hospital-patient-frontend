<template>
  <view class="health-container">
    <!-- 用户健康概览 -->
    <view class="health-overview">
      <view class="overview-header">
        <text class="header-title">健康概览</text>
        <view class="header-actions">
          <text class="header-date">最近更新：{{ lastUpdateDate }}</text>
          <button class="edit-btn" @tap="editBasicInfo">
            <uni-icons type="compose" size="18" color="#00BFCC"></uni-icons>
          </button>
        </view>
      </view>
      
      <view class="health-stats">
        <view class="stat-item">
          <view class="stat-icon">
            <uni-icons type="heart-filled" size="20" color="#16a34a"></uni-icons>
          </view>
          <text class="stat-label">健康指数</text>
          <text class="stat-value good">{{ healthIndex }}</text>
        </view>
        <view class="stat-item">
          <view class="stat-icon">
            <uni-icons type="heart-filled" size="20" color="#dc2626"></uni-icons>
          </view>
          <text class="stat-label">风险提示</text>
          <text class="stat-value warning">{{ riskCount }}项</text>
        </view>
        <view class="stat-item">
          <view class="stat-icon">
            <uni-icons type="paperplane-filled" size="20" color="#3b82f6"></uni-icons>
          </view>
          <text class="stat-label">档案记录</text>
          <text class="stat-value">{{ totalRecords }}条</text>
        </view>
      </view>
    </view>

    <!-- 健康档案分类 -->
    <view class="health-categories">
      <view 
        class="category-card" 
        v-for="category in healthCategories" 
        :key="category.key"
        @tap="viewCategory(category)"
      >
        <view class="card-icon" :class="category.key">
          <uni-icons :type="category.iconType" size="24" color="white"></uni-icons>
        </view>
        <view class="card-info">
          <text class="card-title">{{ category.name }}</text>
          <text class="card-desc">{{ category.description }}</text>
          <text class="card-count">{{ category.count }}条记录</text>
        </view>
        <view class="card-arrow">
          <uni-icons type="arrowright" size="16" color="#cbd5e1"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 最近就诊记录 -->
    <view class="recent-records">
      <view class="section-header">
        <text class="section-title">最近就诊</text>
        <text class="view-all" @tap="viewAllRecords">查看全部</text>
      </view>
      
      <view class="records-list">
        <view 
          class="record-item" 
          v-for="record in recentRecords" 
          :key="record.id"
          @tap="viewRecord(record)"
        >
          <view class="record-info">
            <text class="record-date">{{ record.visitDate }}</text>
            <text class="record-dept">{{ record.department }}</text>
            <text class="record-doctor">{{ record.doctorName }}</text>
            <text class="record-diagnosis">{{ record.diagnosis }}</text>
          </view>
          <view class="record-status" :class="record.status">
            <text class="status-text">{{ getRecordStatusText(record.status) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 健康提醒 -->
    <view class="health-reminders">
      <view class="section-header">
        <text class="section-title">健康提醒</text>
      </view>
      
      <view class="reminder-list">
        <view 
          class="reminder-item" 
          v-for="reminder in healthReminders" 
          :key="reminder.id"
          @tap="handleReminder(reminder)"
        >
          <view class="reminder-icon" :class="reminder.type">
            <uni-icons :type="getReminderIconType(reminder.type)" size="18" color="white"></uni-icons>
          </view>
          <view class="reminder-content">
            <text class="reminder-title">{{ reminder.title }}</text>
            <text class="reminder-desc">{{ reminder.description }}</text>
          </view>
          <view class="reminder-action">
            <text class="action-text">{{ reminder.actionText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { mockHealthData } from './mock'

const lastUpdateDate = ref('2024-10-28')
const healthIndex = ref(85)
const riskCount = ref(2)
const totalRecords = ref(24)

// 健康档案分类
const healthCategories = ref([
  {
    key: 'basic',
    name: '基本信息',
    description: '身高体重、血型等基础信息',
    count: 5,
    iconType: 'paperplane-filled'
  },
  {
    key: 'checkup',
    name: '体检报告',
    description: '年度体检、入学体检等',
    count: 3,
    iconType: 'compose'
  },
  {
    key: 'medication',
    name: '用药记录',
    description: '处方记录、药物过敏史',
    count: 8,
    iconType: 'shop-filled'
  },
  {
    key: 'vision',
    name: '视力档案',
    description: '视力检查、配镜记录',
    count: 6,
    iconType: 'eye-filled'
  },
  {
    key: 'vaccination',
    name: '疫苗接种',
    description: '疫苗接种记录',
    count: 2,
    iconType: 'heart-filled'
  }
])

// 最近就诊记录
const recentRecords = ref([
  {
    id: 1,
    visitDate: '2024-10-28',
    department: '内科',
    doctorName: '张主任',
    diagnosis: '急性上呼吸道感染',
    status: 'completed'
  },
  {
    id: 2,
    visitDate: '2024-10-15',
    department: '口腔科',
    doctorName: '李医生',
    diagnosis: '龋齿',
    status: 'completed'
  },
  {
    id: 3,
    visitDate: '2024-10-10',
    department: '眼科',
    doctorName: '王医生',
    diagnosis: '近视',
    status: 'completed'
  }
])

// 健康提醒
const healthReminders = ref([
  {
    id: 1,
    type: 'checkup',
    title: '年度体检提醒',
    description: '距离上次体检已过11个月，建议进行年度体检',
    actionText: '立即预约'
  },
  {
    id: 2,
    type: 'medication',
    title: '用药提醒',
    description: '您的感冒药今天需要服用',
    actionText: '已服用'
  }
])

// 编辑基本信息
const editBasicInfo = () => {
  uni.navigateTo({
    url: '/pages/profile/health/basic-info'
  })
}

// 查看分类详情
const viewCategory = (category) => {
  uni.navigateTo({
    url: `/pages/profile/health/detail?category=${category.key}`
  })
}

// 查看所有记录
const viewAllRecords = () => {
  uni.showModal({
    title: '就诊记录',
    content: '查看全部就诊记录功能开发中...',
    showCancel: false,
    confirmText: '知道了'
  })
}

// 查看记录详情
const viewRecord = (record) => {
  uni.showToast({
    title: '就诊记录详情功能开发中',
    icon: 'none'
  })
}

// 获取记录状态文本
const getRecordStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    pending: '进行中'
  }
  return statusMap[status] || status
}

// 获取提醒图标类型（uni-icons）
const getReminderIconType = (type) => {
  const iconMap = {
    checkup: 'compose',
    medication: 'shop-filled',
    appointment: 'calendar'
  }
  return iconMap[type] || 'info-filled'
}

// 处理提醒
const handleReminder = (reminder) => {
  uni.showModal({
    title: reminder.title,
    content: reminder.description,
    confirmText: reminder.actionText,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '操作成功',
          icon: 'success'
        })
      }
    }
  })
}

onMounted(() => {
  // 从本地存储加载基本信息
  const basicInfo = uni.getStorageSync('basicHealthInfo')
  if (basicInfo) {
    lastUpdateDate.value = new Date(basicInfo.lastUpdated).toLocaleDateString('zh-CN')
  }
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

.health-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding: 24rpx 0;
}

/* 健康概览 */
.health-overview {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin: 0 24rpx 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.header-date {
  font-size: 22rpx;
  color: #94a3b8;
}

.edit-btn {
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 191, 204, 0.1);
  border: none;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:active {
    background: rgba(0, 191, 204, 0.2);
    transform: scale(0.95);
  }
}

.health-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-icon {
  width: 56rpx;
  height: 56rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12rpx;
  border: 1rpx solid #e2e8f0;
}

.stat-label {
  font-size: 22rpx;
  color: #64748b;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;

  &.good {
    color: #16a34a;
  }

  &.warning {
    color: #dc2626;
  }
}

/* 健康档案分类 */
.health-categories {
  margin: 0 24rpx 24rpx;
}

.category-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:active {
    background: #f8fafc;
    transform: translateY(-1rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
}

.card-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;

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

.card-info {
  flex: 1;
}

.card-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 4rpx;
}

.card-desc {
  font-size: 22rpx;
  color: #64748b;
  display: block;
  margin-bottom: 8rpx;
}

.card-count {
  font-size: 20rpx;
  color: #94a3b8;
  display: block;
}

.card-arrow {
  margin-left: 16rpx;
  flex-shrink: 0;
}

/* 最近就诊 */
.recent-records {
  margin: 0 24rpx 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 0 0 12rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.view-all {
  font-size: 22rpx;
  color: $hospital-primary;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-item {
  background: white;
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:active {
    background: #f8fafc;
    transform: translateY(-1rpx);
  }
}

.record-info {
  flex: 1;
}

.record-date {
  font-size: 24rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 4rpx;
}

.record-dept {
  font-size: 22rpx;
  color: #64748b;
  display: block;
}

.record-doctor {
  font-size: 20rpx;
  color: #94a3b8;
  display: block;
}

.record-diagnosis {
  font-size: 20rpx;
  color: #94a3b8;
  display: block;
  margin-top: 4rpx;
}

.record-status {
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 600;
  white-space: nowrap;

  &.completed {
    background: #d1fae5;
    color: #065f46;
  }

  &.pending {
    background: #fef3c7;
    color: #92400e;
  }
}

.status-text {
  display: block;
}

/* 健康提醒 */
.health-reminders {
  margin: 0 24rpx;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.reminder-item {
  background: white;
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12rpx;
  transition: all 0.2s ease;

  &:active {
    background: #f8fafc;
    transform: translateY(-1rpx);
  }
}

.reminder-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.checkup {
    background: #dbeafe;
  }

  &.medication {
    background: #fce7f3;
  }

  &.appointment {
    background: #e0e7ff;
  }
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 4rpx;
}

.reminder-desc {
  font-size: 22rpx;
  color: #64748b;
  display: block;
}

.reminder-action {
  flex-shrink: 0;
}

.action-text {
  font-size: 22rpx;
  color: $hospital-primary;
  font-weight: 600;
}
</style>
