<template>
  <view class="appointment-card" @tap="handleClick">
    <!-- 卡片头部：医院和状态 -->
    <view class="card-header">
      <view class="hospital-info">
        <text class="hospital-name">{{ appointment.hospitalName }}</text>
        <text class="department-name">{{ appointment.departmentName }}</text>
      </view>
      <view class="status-badge" :class="`status-${appointment.status}`">
        <text class="status-text">{{ statusText }}</text>
      </view>
    </view>

    <!-- 卡片内容：医生和时间信息 -->
    <view class="card-content">
      <view class="doctor-info">
        <text class="doctor-name">{{ appointment.doctorName }}</text>
        <text class="doctor-title">{{ appointment.doctorTitle }}</text>
      </view>
      
      <view class="time-info">
        <uni-icons type="calendar" size="18" :color="$hospital-primary"></uni-icons>
        <text class="time-text">{{ appointment.appointmentDate }} {{ appointment.appointmentTime }}</text>
      </view>
      
      <view class="patient-info">
        <uni-icons type="person" size="18" color="#64748b"></uni-icons>
        <text class="patient-text">就诊人：{{ appointment.patientName }}</text>
      </view>
    </view>

    <!-- 卡片底部：价格和操作 -->
    <view class="card-footer">
      <text class="price">¥{{ formatPrice(appointment.price) }}</text>
      <view class="actions">
        <button 
          class="action-btn cancel" 
          v-if="showCancel"
          @tap.stop="handleCancel"
        >
          取消预约
        </button>
        <button 
          class="action-btn reschedule" 
          v-if="showReschedule"
          @tap.stop="handleReschedule"
        >
          改约
        </button>
        <button 
          class="action-btn evaluate" 
          v-if="showEvaluate"
          @tap.stop="handleEvaluate"
        >
          评价
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatPrice } from '@/utils/format'

/**
 * 预约卡片组件
 * @prop {Object} appointment - 预约数据
 * @event {Function} click - 点击卡片
 * @event {Function} cancel - 取消预约
 * @event {Function} reschedule - 改约
 * @event {Function} evaluate - 评价
 */
const props = defineProps({
  appointment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'cancel', 'reschedule', 'evaluate'])

// 状态文本映射
const statusMap = {
  pending: '待就诊',
  completed: '已完成',
  cancelled: '已取消'
}

const statusText = computed(() => statusMap[props.appointment.status] || props.appointment.status)

// 显示操作按钮
const showCancel = computed(() => props.appointment.status === 'pending')
const showReschedule = computed(() => props.appointment.status === 'pending')
const showEvaluate = computed(() => props.appointment.status === 'completed')

// 事件处理
const handleClick = () => {
  emit('click', props.appointment)
}

const handleCancel = () => {
  emit('cancel', props.appointment)
}

const handleReschedule = () => {
  emit('reschedule', props.appointment)
}

const handleEvaluate = () => {
  emit('evaluate', props.appointment)
}
</script>

<style lang="scss" scoped>
.appointment-card {
  background: white;
  border-radius: 16rpx;
  padding: $spacing-md;
  margin-bottom: $spacing-base;
  box-shadow: $box-shadow-base;
  transition: all 0.3s ease;
}

.appointment-card:active {
  transform: translateY(-2rpx);
  box-shadow: $box-shadow-md;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-base;
}

.hospital-info {
  flex: 1;
}

.hospital-name {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  display: block;
  margin-bottom: 4rpx;
}

.department-name {
  font-size: 24rpx;
  color: $color-slate-600;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

.status-pending {
  background: #E0F2FE;
  color: #0284c7;
}

.status-completed {
  background: #DCFCE7;
  color: #16a34a;
}

.status-cancelled {
  background: #FEE2E2;
  color: #dc2626;
}

/* 卡片内容 */
.card-content {
  border-top: 1rpx solid $color-slate-100;
  padding-top: $spacing-base;
}

.doctor-info {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.doctor-name {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  margin-right: $spacing-sm;
}

.doctor-title {
  font-size: 22rpx;
  color: $hospital-primary;
  padding: 2rpx 12rpx;
  background: $hospital-gradient-start;
  border-radius: 8rpx;
}

.time-info,
.patient-info {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.time-text,
.patient-text {
  font-size: 24rpx;
  color: $color-slate-600;
  margin-left: 8rpx;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid $color-slate-100;
  padding-top: $spacing-base;
  margin-top: $spacing-base;
}

.price {
  font-size: 32rpx;
  font-weight: $font-bold;
  color: #f59e0b;
}

.actions {
  display: flex;
  gap: $spacing-xs;
}

.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  font-weight: $font-medium;
  border: none;
  transition: all 0.2s ease;
}

.action-btn.cancel {
  background: #FEE2E2;
  color: #dc2626;
}

.action-btn.reschedule {
  background: #E0F2FE;
  color: #0284c7;
}

.action-btn.evaluate {
  background: #FEF3C7;
  color: #f59e0b;
}

.action-btn:active {
  opacity: 0.8;
  transform: scale(0.95);
}
</style>

