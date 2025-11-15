<template>
  <view class="payment-container">
    <!-- 顶部导航 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <uni-icons type="back" size="32" color="#475569"></uni-icons>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">支付</text>
      </view>
      <view class="navbar-right"></view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-card">
      <view class="order-header">
        <text class="order-title">订单信息</text>
        <text class="order-id">订单号: {{ paymentStore.currentOrder?.orderId }}</text>
      </view>
      
      <view class="order-detail">
        <view class="detail-row">
          <text class="detail-label">就诊医院</text>
          <text class="detail-value">{{ appointmentInfo.hospitalName }}</text>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">就诊科室</text>
          <text class="detail-value">{{ appointmentInfo.departmentName }}</text>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">就诊医生</text>
          <text class="detail-value">{{ appointmentInfo.doctorName }}</text>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">就诊时间</text>
          <text class="detail-value">{{ appointmentInfo.appointmentDate }} {{ appointmentInfo.appointmentTime }}</text>
        </view>
      </view>
    </view>

    <!-- 金额信息 -->
    <view class="amount-card">
      <view class="amount-row">
        <text class="amount-label">挂号费</text>
        <text class="amount-value">¥ {{ paymentStore.currentOrder?.amount }}</text>
      </view>
      
      <view class="amount-row total">
        <text class="amount-label">应付金额</text>
        <text class="amount-value total">¥ {{ paymentStore.currentOrder?.amount }}</text>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-method-card">
      <view class="section-title">
        <uni-icons type="wallet-filled" size="24" color="#00BFCC"></uni-icons>
        <text>选择支付方式</text>
      </view>
      
      <view class="method-list">
        <view 
          class="method-item"
          :class="{ active: paymentStore.paymentMethod === method.id }"
          v-for="method in paymentMethods"
          :key="method.id"
          @tap="selectPaymentMethod(method.id)"
        >
          <view class="method-icon">
            <image :src="method.icon" mode="aspectFit"></image>
          </view>
          <view class="method-info">
            <text class="method-name">{{ method.name }}</text>
            <text class="method-desc">{{ method.description }}</text>
          </view>
          <view class="method-radio">
            <view class="radio" :class="{ checked: paymentStore.paymentMethod === method.id }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 倒计时提示 -->
    <view class="countdown-card" v-if="paymentStore.isPaymentPending">
      <view class="countdown-header">
        <uni-icons type="info-filled" size="20" color="#f59e0b"></uni-icons>
        <text class="countdown-title">支付超时提示</text>
      </view>
      <text class="countdown-text">请在 {{ countdownText }} 内完成支付，否则订单将自动取消</text>
    </view>

    <!-- 错误提示 -->
    <view class="error-card" v-if="paymentStore.paymentError">
      <view class="error-header">
        <uni-icons type="closeempty" size="20" color="#dc2626"></uni-icons>
        <text class="error-title">支付失败</text>
      </view>
      <text class="error-text">{{ paymentStore.paymentError }}</text>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button 
        class="pay-btn" 
        :disabled="paymentStore.isProcessing || !paymentStore.isPaymentPending"
        @tap="handlePayment"
      >
        <text v-if="!paymentStore.isProcessing">确认支付 ¥{{ paymentStore.currentOrder?.amount }}</text>
        <text v-else>处理中...</text>
      </button>
      
      <button class="cancel-btn" @tap="handleCancel">
        取消支付
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { useAppointmentStore } from '@/stores/appointment'
import { getPaymentMethods, mockPayment, queryPaymentStatus } from '@/api/payment'

const paymentStore = usePaymentStore()
const appointmentStore = useAppointmentStore()

// 支付方式列表
const paymentMethods = ref([])

// 预约信息
const appointmentInfo = reactive({
  hospitalName: '',
  departmentName: '',
  doctorName: '',
  appointmentDate: '',
  appointmentTime: ''
})

// 倒计时
const countdown = ref(30 * 60) // 30分钟
const countdownText = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}分${seconds}秒`
})
let countdownTimer = null

// 启动倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer)
      // 倒计时结束，自动取消订单
      handleOrderExpired()
    }
  }, 1000)
}

// 订单过期处理
const handleOrderExpired = () => {
  uni.showModal({
    title: '订单已过期',
    content: '支付超时，订单已自动取消',
    showCancel: false,
    success: () => {
      paymentStore.clearCurrentOrder()
      uni.navigateBack()
    }
  })
}

// 选择支付方式
const selectPaymentMethod = (methodId) => {
  paymentStore.setPaymentMethod(methodId)
}

// 处理支付
const handlePayment = async () => {
  if (!paymentStore.currentOrder) {
    uni.showToast({
      title: '订单信息丢失',
      icon: 'none'
    })
    return
  }

  paymentStore.setProcessing(true)
  paymentStore.clearPaymentError()

  try {
    // 调用支付接口
    const result = await mockPayment(paymentStore.currentOrder.orderId)
    
    // 支付成功
    paymentStore.updateOrderStatus('paid', {
      transactionId: result.transactionId,
      paidAt: new Date().toISOString()
    })
    
    clearInterval(countdownTimer)
    
    // 显示成功提示
    uni.showModal({
      title: '支付成功',
      content: '您的预约已完成，请按时就诊',
      showCancel: false,
      confirmText: '查看预约',
      success: () => {
        // 清空预约流程数据
        appointmentStore.clearAppointmentData()
        paymentStore.clearCurrentOrder()
        
        // 跳转到我的预约
        uni.navigateTo({
          url: '/pages/profile/appointments'
        })
      }
    })
  } catch (error) {
    paymentStore.setPaymentError(error.message || '支付失败，请重试')
    uni.showToast({
      title: '支付失败',
      icon: 'none'
    })
  } finally {
    paymentStore.setProcessing(false)
  }
}

// 取消支付
const handleCancel = () => {
  uni.showModal({
    title: '取消支付',
    content: '确定要取消支付吗？',
    success: (res) => {
      if (res.confirm) {
        clearInterval(countdownTimer)
        paymentStore.clearCurrentOrder()
        uni.navigateBack()
      }
    }
  })
}

// 返回
const goBack = () => {
  clearInterval(countdownTimer)
  uni.navigateBack()
}

// 加载支付方式
const loadPaymentMethods = async () => {
  try {
    const methods = await getPaymentMethods()
    paymentMethods.value = methods
  } catch (error) {
    console.error('加载支付方式失败:', error)
  }
}

onMounted(() => {
  // 恢复支付订单
  paymentStore.restoreOrder()
  
  if (!paymentStore.currentOrder) {
    uni.showToast({
      title: '订单信息丢失',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  
  // 获取预约信息
  if (appointmentStore.selectedHospital) {
    appointmentInfo.hospitalName = appointmentStore.selectedHospital.name
  }
  if (appointmentStore.selectedDepartment) {
    appointmentInfo.departmentName = appointmentStore.selectedDepartment.name
  }
  if (appointmentStore.selectedDoctor) {
    appointmentInfo.doctorName = appointmentStore.selectedDoctor.name
  }
  if (appointmentStore.selectedSchedule) {
    appointmentInfo.appointmentDate = appointmentStore.selectedSchedule.date
    appointmentInfo.appointmentTime = appointmentStore.selectedSchedule.timeSlot
  }
  
  // 加载支付方式
  loadPaymentMethods()
  
  // 启动倒计时
  startCountdown()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.payment-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding-bottom: 120rpx;
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

.navbar-left,
.navbar-right {
  width: 80rpx;
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

/* 订单信息卡片 */
.order-info-card {
  background: white;
  margin: $spacing-md;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  box-shadow: $box-shadow-base;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1rpx solid $color-slate-200;
}

.order-title {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.order-id {
  font-size: 22rpx;
  color: $color-slate-600;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
}

.detail-label {
  font-size: 24rpx;
  color: $color-slate-600;
  flex: 0 0 100rpx;
}

.detail-value {
  font-size: 24rpx;
  color: $color-slate-900;
  flex: 1;
  text-align: right;
}

/* 金额卡片 */
.amount-card {
  background: white;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  box-shadow: $box-shadow-base;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $color-slate-200;
}

.amount-row.total {
  border-bottom: none;
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 2rpx solid $color-slate-200;
}

.amount-label {
  font-size: 24rpx;
  color: $color-slate-600;
}

.amount-value {
  font-size: 24rpx;
  color: $color-slate-900;
  font-weight: $font-semibold;
}

.amount-value.total {
  font-size: 32rpx;
  color: $hospital-primary;
}

/* 支付方式卡片 */
.payment-method-card {
  background: white;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  box-shadow: $box-shadow-base;
}

.section-title {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  margin-bottom: $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 20rpx $spacing-md;
  border: 2rpx solid $color-slate-200;
  border-radius: $border-radius-base;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
}

.method-item:active {
  transform: scale(0.98);
}

.method-item.active {
  border-color: $hospital-primary;
  background: rgba(0, 191, 204, 0.05);
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.15);
}

.method-icon {
  width: 70rpx;
  height: 70rpx;
  margin-right: $spacing-md;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-slate-50;
  border-radius: $border-radius-base;
  padding: 8rpx;
}

.method-icon image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.method-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.method-name {
  font-size: 26rpx;
  font-weight: $font-medium;
  color: $color-slate-900;
}

.method-desc {
  font-size: 20rpx;
  color: $color-slate-600;
}

.method-radio {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio {
  width: 24rpx;
  height: 24rpx;
  border: 2rpx solid $color-slate-400;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.radio.checked {
  background: $hospital-primary;
  border-color: $hospital-primary;
  box-shadow: inset 0 0 0 4rpx white;
}

/* 倒计时卡片 */
.countdown-card {
  background: #fffbeb;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  border-left: 4rpx solid #f59e0b;
}

.countdown-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.countdown-title {
  font-size: 24rpx;
  font-weight: $font-medium;
  color: #92400e;
}

.countdown-text {
  font-size: 22rpx;
  color: #b45309;
  line-height: 1.5;
}

/* 错误卡片 */
.error-card {
  background: #fee2e2;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  border-left: 4rpx solid #dc2626;
}

.error-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.error-title {
  font-size: 24rpx;
  font-weight: $font-medium;
  color: #7f1d1d;
}

.error-text {
  font-size: 22rpx;
  color: #b91c1c;
  line-height: 1.5;
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, white 85%, rgba(255, 255, 255, 0.95));
  padding: $spacing-md;
  border-top: 1rpx solid $color-slate-200;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.pay-btn,
.cancel-btn {
  height: 56rpx;
  border-radius: $border-radius-base;
  font-size: 28rpx;
  font-weight: $font-semibold;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-btn {
  background: linear-gradient(135deg, $hospital-primary 0%, #00a8b8 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.3);
}

.pay-btn:active:not(:disabled) {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 191, 204, 0.2);
}

.pay-btn:disabled {
  background: $color-slate-300;
  color: $color-slate-600;
  box-shadow: none;
  opacity: 0.6;
}

.cancel-btn {
  background: white;
  color: $color-slate-600;
  border: 2rpx solid $color-slate-200;
}

.cancel-btn:active {
  background: $color-slate-50;
  transform: translateY(2rpx);
}
</style>
