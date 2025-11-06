<template>
  <view class="appointments-container">
    <!-- 状态筛选 -->
    <view class="status-tabs">
      <view 
        class="tab-item" 
        :class="{ 'active': selectedStatus === status.key }"
        v-for="status in statusTabs" 
        :key="status.key"
        @tap="switchStatus(status.key)"
      >
        <text class="tab-text">{{ status.name }}</text>
        <text class="tab-count" v-if="status.count > 0">({{ status.count }})</text>
      </view>
    </view>

    <!-- 预约列表 -->
    <view class="appointment-list">
      <!-- 使用新的 AppointmentCard 组件 - 代码更简洁！ -->
      <AppointmentCard
        v-for="appointment in filteredAppointments"
        :key="appointment.id"
        :appointment="appointment"
        @click="viewDetails"
        @cancel="cancelAppointment"
        @reschedule="rescheduleAppointment"
        @evaluate="evaluateAppointment"
      />

      <!-- 使用新的 EmptyState 组件 -->
      <EmptyState 
        v-if="filteredAppointments.length === 0"
        icon="list"
        :text="`暂无${getStatusText(selectedStatus)}预约`"
      >
        <template #action>
          <button class="go-appointment-btn" @tap="goToAppointment">
            立即预约
          </button>
        </template>
      </EmptyState>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const selectedStatus = ref('all')

// 状态标签
const statusTabs = ref([
  { key: 'all', name: '全部', count: 8 },
  { key: 'pending', name: '待就诊', count: 2 },
  { key: 'completed', name: '已完成', count: 5 },
  { key: 'cancelled', name: '已取消', count: 1 }
])

// 预约数据 - 从本地存储加载
const appointments = ref([])

// 过滤后的预约列表
const filteredAppointments = computed(() => {
  if (selectedStatus.value === 'all') {
    return appointments.value
  }
  return appointments.value.filter(appointment => appointment.status === selectedStatus.value)
})

// 切换状态
const switchStatus = (statusKey) => {
  selectedStatus.value = statusKey
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    all: '全部',
    pending: '待就诊',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 查看详情
const viewDetails = (appointment) => {
  uni.showModal({
    title: '预约详情',
    content: `${appointment.hospitalName}\n${appointment.departmentName} - ${appointment.doctorName}\n${appointment.appointmentDate} ${appointment.appointmentTime}`,
    showCancel: false,
    confirmText: '知道了'
  })
}

// 取消预约 - 使用新的 UI 工具函数，代码更简洁！
const cancelAppointment = async (appointment) => {
  // 动态导入工具函数
  const { showConfirm, showSuccess } = await import('@/utils/ui')
  
  const confirmed = await showConfirm({
    title: '取消预约',
    content: '确定要取消这个预约吗？取消后可能需要重新预约。'
  })
  
  if (confirmed) {
    // 更新状态
    appointment.status = 'cancelled'
    
    // 保存到本地存储
    uni.setStorageSync('myAppointments', appointments.value)
    
    // 刷新数据
    loadAppointments()
    
    showSuccess('预约已取消')
  }
}

// 改约 - 使用新的 UI 工具函数
const rescheduleAppointment = async (appointment) => {
  const { showAlert } = await import('@/utils/ui')
  await showAlert({
    title: '改约',
    content: '改约功能开发中，请稍后再试。'
  })
}

// 评价 - 使用新的 UI 工具函数
const evaluateAppointment = async (appointment) => {
  const { showAlert } = await import('@/utils/ui')
  await showAlert({
    title: '评价医生',
    content: '评价功能开发中，请稍后再试。'
  })
}

// 去预约 - 使用新的导航工具函数
const goToAppointment = async () => {
  const { navigateTo } = await import('@/utils/navigation')
  navigateTo('/pages/home/appointment/select-hospital')
}

// 加载预约数据
const loadAppointments = () => {
  // 从本地存储获取预约数据（模拟）
  const savedAppointments = uni.getStorageSync('myAppointments') || []
  appointments.value = savedAppointments
  
  // 更新状态标签计数
  statusTabs.value.forEach(tab => {
    if (tab.key === 'all') {
      tab.count = appointments.value.length
    } else {
      tab.count = appointments.value.filter(a => a.status === tab.key).length
    }
  })
}

onMounted(() => {
  console.log('我的预约页面加载')
  loadAppointments()
})
</script>

<style lang="scss" scoped>
.appointments-container {
  background: $hospital-gradient-start;
  min-height: 100vh;
  padding: 32rpx;
  padding-bottom: 120rpx;
}

/* 状态筛选 */
.status-tabs {
  display: flex;
  background: white;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: $hospital-primary;
  color: white;
}

.tab-text {
  font-size: 26rpx;
  color: #666;
}

.tab-count {
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
}

.tab-item.active .tab-text,
.tab-item.active .tab-count {
  color: white;
}

/* 预约列表 */
.appointment-list {
  margin-bottom: 32rpx;
}

.appointment-item {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.appointment-item:active {
  transform: translateY(-1rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.12);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.hospital-info {
  flex: 1;
}

.hospital-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.department-name {
  font-size: 24rpx;
  color: #666;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.status-badge.pending {
  background: #E8F4FD;
  color: #007AFF;
}

.status-badge.completed {
  background: #E8F5E8;
  color: #4cd964;
}

.status-badge.cancelled {
  background: #FFF2F0;
  color: #ff3b30;
}

.appointment-content {
  border-top: 1rpx solid #F5F5F5;
  padding-top: 20rpx;
}

.doctor-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.doctor-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-right: 16rpx;
}

.doctor-title {
  font-size: 22rpx;
  color: $hospital-primary;
}

.time-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.appointment-date {
  font-size: 24rpx;
  color: #333;
  margin-right: 16rpx;
}

.appointment-time {
  font-size: 22rpx;
  color: #666;
}

.patient-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.patient-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
}

.patient-name {
  font-size: 24rpx;
  color: #333;
}

.appointment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #F5F5F5;
  padding-top: 20rpx;
}

.price {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b35;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  border: none;
  transition: all 0.3s ease;
}

.action-btn.cancel {
  background: #FFF2F0;
  color: #ff3b30;
}

.action-btn.reschedule {
  background: #E8F4FD;
  color: #007AFF;
}

.action-btn.evaluate {
  background: #FFF3E0;
  color: #ff9500;
}

.action-btn:active {
  transform: translateY(-1rpx);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 32rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
}

.go-appointment-btn {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  color: white;
  border: none;
  border-radius: 24rpx;
  padding: 24rpx 48rpx;
  font-size: 26rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 25rpx rgba(0, 191, 204, 0.3);
}

.go-appointment-btn:active {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 35rpx rgba(0, 191, 204, 0.4);
}
</style>
