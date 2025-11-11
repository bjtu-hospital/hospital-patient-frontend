<template>
  <view class="waitlist-container">
    <!-- 候补列表 -->
    <view class="waitlist-list">
      <view 
        class="waitlist-card" 
        v-for="item in waitlist" 
        :key="item.id"
      >
        <!-- 医院和科室信息 -->
        <view class="card-header">
          <text class="hospital-name">{{ item.hospitalName }}</text>
          <view class="status-badge" :class="getStatusClass(item.status)">
            <text class="status-text">{{ getStatusText(item.status) }}</text>
          </view>
        </view>
        
        <!-- 医生和时间信息 -->
        <view class="card-content">
          <view class="info-row">
            <view class="info-icon">
              <uni-icons type="person" size="20" color="#64748b"></uni-icons>
            </view>
            <text class="info-text">{{ item.doctorName }} {{ item.doctorTitle }}</text>
          </view>
          
          <view class="info-row">
            <view class="info-icon">
              <uni-icons type="calendar" size="20" color="#64748b"></uni-icons>
            </view>
            <text class="info-text">{{ item.appointmentDate }} {{ item.period }}</text>
          </view>
          
          <view class="info-row">
            <view class="info-icon">
              <uni-icons type="location" size="20" color="#64748b"></uni-icons>
            </view>
            <text class="info-text">{{ item.departmentName }}</text>
          </view>
          
          <view class="info-row">
            <view class="info-icon">
              <uni-icons type="person-filled" size="20" color="#64748b"></uni-icons>
            </view>
            <text class="info-text">就诊人：{{ item.patientName }}</text>
          </view>
        </view>
        
        <!-- 候补状态信息 -->
        <view class="card-status">
          <view v-if="item.status === 'waiting'" class="waiting-info">
            <view class="position-badge">
              <text class="position-text">排第 {{ item.position }} 位</text>
            </view>
            <text class="waiting-tip">有号源释放时将自动通知您</text>
          </view>
          
          <view v-else-if="item.status === 'success'" class="success-info">
            <text class="success-text">✅ 候补成功，已自动为您预约</text>
            <button class="view-appointment-btn" @tap="viewAppointment(item)">
              查看预约
            </button>
          </view>
          
          <view v-else-if="item.status === 'expired'" class="expired-info">
            <text class="expired-text">候补已过期</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="card-actions" v-if="item.status === 'waiting'">
          <button class="cancel-btn" @tap="handleCancel(item.id)">
            取消候补
          </button>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <EmptyState 
      v-if="waitlist.length === 0"
      icon="list"
      text="暂无候补记录"
    >
      <template #action>
        <button class="go-appointment-btn" @tap="goToAppointment">
          立即预约
        </button>
      </template>
    </EmptyState>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyWaitlist, cancelWaitlist } from '@/api/appointment'

const waitlist = ref([])
const loading = ref(false)

// 加载候补列表
const loadWaitlist = async () => {
  try {
    loading.value = true
    const data = await getMyWaitlist()
    waitlist.value = data || []
  } catch (error) {
    console.error('获取候补列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 取消候补
const handleCancel = (waitlistId) => {
  uni.showModal({
    title: '取消候补',
    content: '确定要取消候补吗？取消后需重新加入候补队列。',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '取消中...' })
          
          await cancelWaitlist(waitlistId)
          
          uni.hideLoading()
          uni.showToast({
            title: '已取消候补',
            icon: 'success'
          })
          
          // 刷新列表
          loadWaitlist()
          
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: error.message || '取消失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 查看预约（候补成功后）
const viewAppointment = (item) => {
  uni.navigateTo({
    url: '/pages/profile/appointments'
  })
}

// 去预约
const goToAppointment = () => {
  uni.navigateTo({
    url: '/pages/home/appointment/select-hospital'
  })
}

// 获取状态样式类
const getStatusClass = (status) => {
  return {
    'status-waiting': status === 'waiting',
    'status-success': status === 'success',
    'status-expired': status === 'expired'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    waiting: '候补中',
    success: '候补成功',
    expired: '已过期',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadWaitlist()
})
</script>

<style lang="scss" scoped>
.waitlist-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* 候补列表 */
.waitlist-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.waitlist-card {
  background: white;
  border-radius: $border-radius-lg;
  padding: 32rpx;
  box-shadow: $box-shadow-base;
  transition: all 0.2s ease;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid $color-slate-100;
}

.hospital-name {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  flex: 1;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: $font-medium;
}

.status-badge.status-waiting {
  background: #f0fdff;
  color: $hospital-primary;
  border: 1rpx solid $hospital-primary;
}

.status-badge.status-success {
  background: #ecfdf5;
  color: #10b981;
  border: 1rpx solid #10b981;
}

.status-badge.status-expired {
  background: $color-slate-100;
  color: $color-slate-500;
  border: 1rpx solid $color-slate-300;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.info-icon {
  width: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-text {
  font-size: 26rpx;
  color: $color-slate-700;
  flex: 1;
}

/* 候补状态信息 */
.card-status {
  background: $color-slate-50;
  padding: 20rpx;
  border-radius: $border-radius-base;
  margin-bottom: 20rpx;
}

.waiting-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.position-badge {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  border-radius: 24rpx;
}

.position-text {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: white;
}

.waiting-tip {
  font-size: 22rpx;
  color: $color-slate-600;
}

.success-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.success-text {
  font-size: 26rpx;
  color: #10b981;
  font-weight: $font-medium;
}

.view-appointment-btn {
  padding: 12rpx 32rpx;
  background: white;
  border: 1rpx solid #10b981;
  border-radius: 20rpx;
  color: #10b981;
  font-size: 24rpx;
  
  &::after {
    border: none;
  }
}

.expired-info {
  text-align: center;
}

.expired-text {
  font-size: 24rpx;
  color: $color-slate-500;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 16rpx 48rpx;
  background: white;
  border: 1rpx solid $color-slate-300;
  border-radius: $border-radius-base;
  color: $color-slate-700;
  font-size: 26rpx;
  font-weight: $font-medium;
  transition: all 0.2s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    background: $color-slate-50;
    border-color: $color-slate-400;
  }
}

/* 空状态 */
.go-appointment-btn {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  color: white;
  border: none;
  border-radius: 24rpx;
  padding: 24rpx 48rpx;
  font-size: 26rpx;
  font-weight: $font-medium;
  box-shadow: 0 8rpx 25rpx rgba(0, 213, 217, 0.3);
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 35rpx rgba(0, 213, 217, 0.4);
  }
}
</style>


