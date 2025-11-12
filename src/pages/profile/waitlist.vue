<template>
  <view class="waitlist-container">
    <!-- 候补列表 -->
    <view class="waitlist-list">
      <view 
        class="waitlist-card" 
        v-for="item in waitlist" 
        :key="item.id"
      >
        <!-- 医生信息头部 -->
        <view class="card-header">
          <view class="doctor-info">
            <text class="doctor-name">{{ item.doctorName }} {{ item.doctorTitle }}</text>
            <text class="department-info">{{ item.departmentName }} {{ item.hospitalName }}</text>
          </view>
          <view class="status-badge" :class="getStatusClass(item.status)">
            <text class="status-text">{{ getStatusText(item.status) }}</text>
          </view>
        </view>
        
        <!-- 候补详细信息 -->
        <view class="card-content">
          <view class="info-item">
            <text class="info-label">就诊人</text>
            <text class="info-value">{{ item.patientName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">候补日期</text>
            <text class="info-value">{{ item.appointmentDate }} {{ item.period }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">门诊类型</text>
            <text class="info-value">{{ item.appointmentType }} <text class="price">¥{{ item.price }}</text></text>
          </view>
          <view class="info-item">
            <text class="info-label">提交时间</text>
            <text class="info-value">{{ item.createdAt }}</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="card-actions">
          <button class="detail-btn" @tap="viewDetail(item)">
            查看详情
          </button>
          <button class="cancel-btn" @tap="handleCancel(item.id)" v-if="item.status === 'waiting'">
            取消候补
          </button>
        </view>
      </view>
    </view>
    
    <!-- 温馨提示 -->
    <view class="bottom-tip" v-if="waitlist.length > 0">
      <view class="tip-icon">
        <uni-icons type="info-filled" size="18" color="#ef4444"></uni-icons>
      </view>
      <text class="tip-text">温馨提示：候补成功的订单，请前往"我的预约"中查看或取消</text>
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
  console.log('点击取消候补，ID:', waitlistId)
  
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
          
          // 立即刷新列表
          loadWaitlist()
          
        } catch (error) {
          uni.hideLoading()
          console.error('取消候补失败:', error)
          uni.showToast({
            title: error.message || '取消失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 查看详情
const viewDetail = (item) => {
  // 跳转到候补详情页面（候补成功页面）
  uni.navigateTo({
    url: `/pages/home/appointment/waitlist-success?waitlistId=${item.id}&position=${item.position || 0}&status=${item.status}`
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
    'status-expired': status === 'expired',
    'status-cancelled': status === 'cancelled'
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
  align-items: flex-start;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid $color-slate-100;
}

.doctor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.doctor-name {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.department-info {
  font-size: 24rpx;
  color: $color-slate-600;
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

.status-badge.status-cancelled {
  background: #fef2f2;
  color: #dc2626;
  border: 1rpx solid #fca5a5;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  margin-bottom: 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $color-slate-50;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: $color-slate-600;
}

.info-value {
  font-size: 26rpx;
  color: $color-slate-900;
  font-weight: $font-medium;
  text-align: right;
}

.price {
  color: #dc2626;
  font-weight: $font-semibold;
  margin-left: 4rpx;
}


/* 操作按钮 */
.card-actions {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-btn {
  flex: 1;
  padding: 20rpx;
  background: white;
  border: 1rpx solid $hospital-primary;
  border-radius: $border-radius-base;
  color: $hospital-primary;
  font-size: 26rpx;
  font-weight: $font-medium;
  transition: all 0.2s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    background: #f0fdff;
  }
}

.cancel-btn {
  flex: 1;
  padding: 20rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  border: none;
  border-radius: $border-radius-base;
  color: white;
  font-size: 26rpx;
  font-weight: $font-medium;
  transition: all 0.2s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.9;
  }
}

/* 底部提示 */
.bottom-tip {
  background: #fef2f2;
  margin: 24rpx 32rpx;
  padding: 20rpx 24rpx;
  border-radius: $border-radius-base;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  border: 1rpx solid #fecaca;
}

.tip-icon {
  margin-top: 2rpx;
}

.tip-text {
  flex: 1;
  font-size: 24rpx;
  color: #991b1b;
  line-height: 1.5;
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


