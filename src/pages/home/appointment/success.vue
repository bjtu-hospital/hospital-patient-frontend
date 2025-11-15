<template>
  <view class="success-container">
    <!-- 顶部状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <text class="status-title">待支付</text>
        <view class="countdown">
          <text class="countdown-label">剩余:</text>
          <text class="countdown-time">{{ countdownText }}</text>
        </view>
      </view>
      <text class="status-subtitle">预约成功</text>
      <text class="status-desc">请准时于就诊当天前往医院门诊就诊。</text>
    </view>

    <!-- 就诊时间和排队号 -->
    <view class="time-card">
      <view class="time-main">
        <text class="time-date">{{ appointmentData.appointmentDate }}</text>
        <text class="time-period">{{ appointmentData.appointmentTime }}</text>
        <view class="queue-number">
          <text class="queue-label">{{ appointmentData.queueNumber }}</text>
          <text class="queue-unit">号</text>
        </view>
      </view>
    </view>

    <!-- 详细信息 -->
    <view class="detail-card">
      <view class="detail-row">
        <text class="detail-label">就诊院区</text>
        <text class="detail-value">{{ appointmentData.hospitalName }}</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">就诊科室</text>
        <text class="detail-value">{{ appointmentData.departmentName }}</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">门诊类型</text>
        <view class="detail-value-group">
          <text class="detail-value">{{ appointmentData.appointmentType }}</text>
          <text class="detail-price">¥ {{ appointmentData.price }}元</text>
        </view>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">专病名称</text>
        <text class="detail-value">{{ appointmentData.departmentName }}</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">候诊时间</text>
        <text class="detail-value highlight">{{ appointmentData.appointmentDate }} {{ appointmentData.period }}</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">就诊地点</text>
        <text class="detail-value location">{{ appointmentData.location || '门诊楼二层4号分诊台（北侧）' }}</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">就 诊 人</text>
        <text class="detail-value">{{ appointmentData.patientName }}</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">就诊卡号</text>
        <view class="detail-value-group">
          <text class="detail-value">{{ appointmentData.cardNo || '061651734' }}</text>
          <text class="detail-tag">（自费/公费）</text>
        </view>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="notice-card">
      <text class="notice-text">自费/公费患者无需取号，持此码可直接到就诊地点报到</text>
    </view>

    <!-- 二维码/就诊卡号 -->
    <view class="qrcode-card">
      <text class="card-number">{{ appointmentData.cardNo || '061651734' }}</text>
      <!-- 这里可以集成二维码生成库 -->
      <view class="qrcode-placeholder">
        <view class="barcode">
          <view class="bar" v-for="i in 50" :key="i"></view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="action-btn secondary" @tap="handleConsult">
        预问诊
      </button>
      <button class="action-btn secondary" @tap="handleCancel">
        取消预约
      </button>
      <button class="action-btn primary" @tap="handlePay">
        立即支付
      </button>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item" @tap="goBack">
        <uni-icons type="back" size="24" color="#666"></uni-icons>
      </view>
      <view class="nav-item" @tap="goNext">
        <uni-icons type="forward" size="24" color="#666"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { usePaymentStore } from '@/stores/payment'
import { createPaymentOrder } from '@/api/payment'

// 🔧 获取 stores
const appointmentStore = useAppointmentStore()
const paymentStore = usePaymentStore()

// 预约数据
const appointmentData = reactive({
  orderNo: '',
  hospitalName: '',
  departmentName: '',
  appointmentType: '',
  appointmentDate: '',
  appointmentTime: '',
  period: '',
  patientName: '',
  cardNo: '',
  queueNumber: '',
  price: 0,
  location: ''
})

// 倒计时（30分钟）
const countdown = ref(30 * 60) // 秒
const countdownText = ref('29分57秒')
let timer = null

// 启动倒计时
const startCountdown = () => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
      const minutes = Math.floor(countdown.value / 60)
      const seconds = countdown.value % 60
      countdownText.value = `${minutes}分${seconds}秒`
    } else {
      clearInterval(timer)
      // 倒计时结束
      uni.showModal({
        title: '订单已取消',
        content: '支付超时，订单已自动取消',
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
    }
  }, 1000)
}

// 预问诊
const handleConsult = () => {
  uni.showToast({
    title: '预问诊功能开发中',
    icon: 'none'
  })
}

// 取消预约
const handleCancel = async () => {
  const { showConfirm, showSuccess } = await import('@/utils/ui')
  
  const confirmed = await showConfirm({
    title: '取消预约',
    content: '确定要取消这个预约吗？'
  })
  
  if (confirmed) {
    clearInterval(timer)
    showSuccess('预约已取消')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

// 立即支付
const handlePay = async () => {
  if (appointmentData.price <= 0) {
    uni.showToast({
      title: '金额异常，无法支付',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '准备支付...',
    mask: true
  })
  
  try {
    // 创建支付订单
    const paymentOrder = await createPaymentOrder({
      appointmentId: appointmentData.orderNo,
      amount: appointmentData.price,
      paymentMethod: 'wechat'
    })
    
    // 保存支付订单到 Store
    paymentStore.createOrder(paymentOrder)
    
    uni.hideLoading()
    
    // 跳转到支付页面
    uni.navigateTo({
      url: '/pages/home/appointment/payment'
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '支付准备失败，请重试',
      icon: 'none'
    })
  }
}

// 返回
const goBack = () => {
  clearInterval(timer)
  uni.navigateBack()
}

// 下一页（如果有多个预约）
const goNext = () => {
  uni.showToast({
    title: '没有更多预约',
    icon: 'none'
  })
}

onMounted(() => {
  // 从上一页传来的参数获取预约信息
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  if (options.data) {
    // 从URL参数解析数据
    const data = JSON.parse(decodeURIComponent(options.data))
    Object.assign(appointmentData, data)
  } else {
    // 从本地存储获取最新的预约
    const lastAppointment = uni.getStorageSync('lastAppointment')
    if (lastAppointment) {
      appointmentData.orderNo = lastAppointment.orderNo || ''
      appointmentData.hospitalName = lastAppointment.hospitalName || ''
      appointmentData.departmentName = lastAppointment.departmentName || ''
      appointmentData.appointmentType = lastAppointment.doctorTitle || ''
      appointmentData.appointmentDate = lastAppointment.appointmentDate || ''
      appointmentData.appointmentTime = lastAppointment.appointmentTime || ''
      appointmentData.period = lastAppointment.appointmentTime?.split(' ')[0] || ''
      appointmentData.patientName = lastAppointment.patientName || ''
      appointmentData.queueNumber = lastAppointment.queueNumber || ''
      appointmentData.price = lastAppointment.price || 0
    }
  }
  
  // 启动倒计时
  startCountdown()
})

onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.success-container {
  min-height: 100vh;
  background: $color-slate-50;
  padding-bottom: 200rpx;
}

/* 顶部状态卡片 */
.status-card {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  padding: 48rpx 32rpx;
  color: white;
  margin-bottom: 24rpx;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.status-title {
  font-size: 40rpx;
  font-weight: $font-bold;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.countdown-label {
  font-size: 24rpx;
  opacity: 0.9;
}

.countdown-time {
  font-size: 32rpx;
  font-weight: $font-semibold;
}

.status-subtitle {
  font-size: 28rpx;
  margin-bottom: 8rpx;
  display: block;
}

.status-desc {
  font-size: 24rpx;
  opacity: 0.9;
  line-height: 1.5;
}

/* 就诊时间卡片 */
.time-card {
  background: white;
  margin: 0 24rpx 24rpx;
  border-radius: 12rpx;
  padding: 32rpx;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid $color-slate-100;
}

.time-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-date {
  font-size: 36rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.time-period {
  font-size: 28rpx;
  color: $color-slate-600;
  margin-left: 16rpx;
}

.queue-number {
  display: flex;
  align-items: baseline;
  color: $hospital-primary;
}

.queue-label {
  font-size: 56rpx;
  font-weight: $font-bold;
}

.queue-unit {
  font-size: 28rpx;
  margin-left: 4rpx;
}

/* 详细信息卡片 */
.detail-card {
  background: white;
  margin: 0 24rpx 24rpx;
  border-radius: 12rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid $color-slate-100;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $color-slate-100;
  min-height: 80rpx;
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-row:first-child {
  padding-top: 0;
}

.detail-label {
  font-size: 28rpx;
  color: $color-slate-500;
  min-width: 140rpx;
}

.detail-value {
  font-size: 28rpx;
  color: $color-slate-900;
  flex: 1;
  text-align: right;
}

.detail-value-group {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16rpx;
}

.detail-price {
  font-size: 28rpx;
  color: #f59e0b;
  font-weight: $font-semibold;
}

.detail-value.highlight {
  color: #dc2626;
  font-weight: $font-medium;
}

.detail-value.location {
  color: #dc2626;
}

.detail-tag {
  font-size: 24rpx;
  color: $color-slate-500;
}

/* 提示卡片 */
.notice-card {
  background: white;
  margin: 0 24rpx 24rpx;
  border-radius: 12rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid $color-slate-100;
}

.notice-text {
  font-size: 24rpx;
  color: #dc2626;
  line-height: 1.6;
}

/* 二维码卡片 */
.qrcode-card {
  background: white;
  margin: 0 24rpx 24rpx;
  border-radius: 12rpx;
  padding: 32rpx;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid $color-slate-100;
  text-align: center;
}

.card-number {
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  display: block;
  margin-bottom: 24rpx;
}

.qrcode-placeholder {
  width: 100%;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-slate-50;
  border-radius: 12rpx;
}

.barcode {
  display: flex;
  gap: 2rpx;
  height: 120rpx;
  align-items: center;
}

.bar {
  width: 4rpx;
  height: 100%;
  background: $color-slate-900;
}

.bar:nth-child(odd) {
  height: 80%;
}

.bar:nth-child(3n) {
  height: 60%;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 80rpx;
  left: 0;
  right: 0;
  padding: 0 24rpx;
  display: flex;
  gap: 16rpx;
  background: $color-slate-50;
  padding-top: 24rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: $font-medium;
  border: none;
  transition: all 0.2s ease;
}

.action-btn.secondary {
  background: white;
  color: $color-slate-700;
  border: 2rpx solid $color-slate-200;
}

.action-btn.secondary:active {
  background: $color-slate-50;
}

.action-btn.primary {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(0, 213, 217, 0.3);
}

.action-btn.primary:active {
  box-shadow: 0 6rpx 16rpx rgba(0, 213, 217, 0.4);
}


/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80rpx;
  background: white;
  border-top: 1rpx solid $color-slate-200;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80rpx;
}

.nav-item {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item:active {
  opacity: 0.6;
}
</style>

