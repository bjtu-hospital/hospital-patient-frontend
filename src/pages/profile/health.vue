<template>
  <view class="health-container">
    <!-- 用户健康概览 -->
    <view class="health-overview">
      <view class="overview-header">
        <text class="header-title">健康概览</text>
        <text class="header-date">最近更新：{{ lastUpdateDate }}</text>
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
import { Activity, Heart, FileText, TestTube, Pill, Eye, Calendar, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-vue-next'

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
    icon: FileText,
    iconType: 'paperplane-filled'
  },
  {
    key: 'checkup',
    name: '体检报告',
    description: '年度体检、入学体检等',
    count: 3,
    icon: TestTube,
    iconType: 'compose'
  },
  {
    key: 'medication',
    name: '用药记录',
    description: '处方记录、药物过敏史',
    count: 8,
    icon: Pill,
    iconType: 'shop-filled'
  },
  {
    key: 'vision',
    name: '视力档案',
    description: '视力检查、配镜记录',
    count: 6,
    icon: Eye,
    iconType: 'eye-filled'
  },
  {
    key: 'vaccination',
    name: '疫苗接种',
    description: '疫苗接种记录',
    count: 2,
    icon: Activity,
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
    actionText: '立即预约',
    icon: TestTube
  },
  {
    id: 2,
    type: 'medication',
    title: '用药提醒',
    description: '您的感冒药今天需要服用',
    actionText: '已服用',
    icon: Pill
  }
])

// 查看分类详情
const viewCategory = (category) => {
  uni.showModal({
    title: category.name,
    content: `${category.description}\n共${category.count}条记录`,
    showCancel: false,
    confirmText: '知道了'
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
  uni.showModal({
    title: '就诊详情',
    content: `就诊时间：${record.visitDate}\n科室：${record.department}\n医生：${record.doctorName}\n诊断：${record.diagnosis}`,
    showCancel: false,
    confirmText: '知道了'
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
  console.log('健康档案页面加载')
})
</script>

<style lang="scss" scoped>
.health-container {
  background: #f8fafc;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* 健康概览 - 队友风格 */
.health-overview {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
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

.header-date {
  font-size: 22rpx;
  color: #94a3b8;
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
}

.stat-value.good {
  color: #16a34a;
}

.stat-value.warning {
  color: #dc2626;
}

/* 健康档案分类 - 队友风格 */
.health-categories {
  margin-bottom: 24rpx;
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
}

.category-card:active {
  background: #f8fafc;
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.card-icon.basic {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.card-icon.checkup {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.card-icon.medication {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.card-icon.vision {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.card-icon.vaccination {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 6rpx;
}

.card-desc {
  font-size: 22rpx;
  color: #64748b;
  display: block;
  margin-bottom: 8rpx;
}

.card-count {
  font-size: 20rpx;
  color: #00BFCC;
}

.card-arrow {
  margin-left: 16rpx;
}

/* 最近就诊记录 - 队友风格 */
.recent-records {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
}

.view-all {
  font-size: 22rpx;
  color: #00BFCC;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
  border-radius: 8rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.record-item:active {
  background: #f0fdff;
  border-color: #00BFCC;
}

.record-info {
  flex: 1;
}

.record-date {
  font-size: 22rpx;
  color: #00BFCC;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.record-dept,
.record-doctor {
  font-size: 24rpx;
  color: #475569;
  margin-bottom: 4rpx;
  display: block;
}

.record-diagnosis {
  font-size: 22rpx;
  color: #64748b;
}

.record-status {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.record-status.completed {
  background: #dcfce7;
  color: #16a34a;
}

/* 健康提醒 - 队友风格 */
.health-reminders {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 20rpx;
}

.reminder-item {
  background: #f8fafc;
  border-radius: 8rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid #f1f5f9;
  transition: all 0.2s ease;
}

.reminder-item:active {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.reminder-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.reminder-icon.checkup {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.reminder-icon.medication {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #0f172a;
  display: block;
  margin-bottom: 6rpx;
}

.reminder-desc {
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.3;
}

.reminder-action {
  background: #00BFCC;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
}

.action-text {
  font-size: 22rpx;
  color: white;
  font-weight: 500;
}
</style>