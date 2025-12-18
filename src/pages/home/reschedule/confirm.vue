<template>
  <view class="confirm-container" v-if="context && newSchedule">
    <view class="section">
      <view class="section-title">
        <uni-icons type="calendar" size="22" color="#0ea5e9"></uni-icons>
        <text class="title-text">当前预约</text>
      </view>
      <view class="info-row">
        <text class="label">医院</text>
        <text class="value">{{ context.hospitalName }}</text>
      </view>
      <view class="info-row">
        <text class="label">科室</text>
        <text class="value">{{ context.departmentName }}</text>
      </view>
      <view class="info-row">
        <text class="label">医生</text>
        <text class="value">{{ context.doctorName }} {{ context.doctorTitle }}</text>
      </view>
      <view class="info-row">
        <text class="label">时间</text>
        <text class="value">{{ context.appointmentDate }} {{ context.appointmentTime }}</text>
      </view>
      <view class="info-row">
        <text class="label">就诊人</text>
        <text class="value">{{ context.patientName }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">
        <uni-icons type="refresh" size="22" color="#22c55e"></uni-icons>
        <text class="title-text">改约为</text>
      </view>
      <view class="info-row">
        <text class="label">时间</text>
        <text class="value highlight">{{ newSchedule.date }} {{ newSchedule.period }} {{ newSchedule.startTime }}-{{ newSchedule.endTime }}</text>
      </view>
      <view class="info-row">
        <text class="label">医生</text>
        <text class="value">{{ newSchedule.doctorName }} {{ newSchedule.doctorTitle }}</text>
      </view>
      <view class="info-row">
        <text class="label">挂号费</text>
        <text class="value price">¥{{ newSchedule.price }}</text>
      </view>
      <view class="badge-row">
        <text class="badge">剩余 {{ newSchedule.availableSlots }} 个号源</text>
      </view>
    </view>

    <view class="tips-card">
      <uni-icons type="info-filled" size="20" color="#f97316"></uni-icons>
      <view class="tips-content">
        <text>· 改约成功后原预约会自动取消，无需再次操作。</text>
        <text>· 如需再次调整，可在“我的预约”中重新发起改约。</text>
      </view>
    </view>

    <view class="bottom-actions">
      <button
        class="submit-btn"
        :disabled="submitting"
        @tap="submitReschedule"
      >
        {{ submitting ? '提交中...' : '确认改约' }}
      </button>
    </view>
  </view>

  <view class="empty-state" v-else>
    <uni-icons type="info" size="40" color="#94a3b8"></uni-icons>
    <text class="empty-text">改约信息已失效，请返回重新选择。</text>
    <button class="back-btn" @tap="goBack">返回</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { rescheduleAppointment } from '@/api/appointment'
import { subscribeWithAuth, getTemplateIdsByScene } from '@/utils/subscribe'

const appointmentStore = useAppointmentStore()
const context = ref(null)
const newSchedule = ref(null)
const submitting = ref(false)

const goBack = () => {
  uni.navigateBack()
}

const ensureContext = () => {
  appointmentStore.restoreRescheduleData()
  context.value = appointmentStore.rescheduleContext
  newSchedule.value = appointmentStore.rescheduleSelectedSchedule
  if (!context.value) {
    uni.showToast({
      title: '未找到改约信息',
      icon: 'none'
    })
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/profile/appointments'
      })
    }, 800)
  } else if (!newSchedule.value) {
    uni.showToast({
      title: '请选择改约时间段',
      icon: 'none'
    })
    setTimeout(() => {
      goBack()
    }, 800)
  }
}

const submitReschedule = async () => {
  if (!context.value || !newSchedule.value || submitting.value) return
  submitting.value = true

  try {
    // ⭐ 请求订阅消息授权（确保可以发送改约通知）
    console.log('🔔 请求改约订阅消息授权...')
    const subscribeResult = await subscribeWithAuth({
      templateIds: getTemplateIdsByScene('reschedule'),
      businessData: {
        appointmentId: context.value.appointmentId,
        scheduleId: newSchedule.value.scheduleId || newSchedule.value.id
      }
    })
    
    console.log('📬 订阅授权结果:', subscribeResult)
    
    // 提交改约
    uni.showLoading({
      title: '提交中...',
      mask: true
    })

    const result = await rescheduleAppointment(context.value.appointmentId, {
      scheduleId: newSchedule.value.scheduleId || newSchedule.value.id,
      wxCode: subscribeResult.code,
      subscribeAuthResult: subscribeResult.authResult,
      subscribeScene: 'reschedule'
    })
    
    console.log('✅ 改约成功:', result)

    uni.hideLoading()
    uni.showToast({
      title: '改约成功',
      icon: 'success'
    })
    appointmentStore.clearRescheduleData()

    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/profile/appointments'
      })
    }, 800)
  } catch (error) {
    console.error('改约失败', error)
    uni.hideLoading()
    uni.showToast({
      title: error?.message || '改约失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  ensureContext()
})
</script>

<style lang="scss" scoped>
.confirm-container {
  min-height: 100vh;
  background: $color-slate-50;
  padding: $spacing-md;
  padding-bottom: 200rpx;
}

.section {
  background: white;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $box-shadow-base;
  margin-bottom: $spacing-md;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: $spacing-sm;
}

.title-text {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: $color-slate-800;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $color-slate-100;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 24rpx;
  color: $color-slate-500;
  width: 160rpx;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: $color-slate-800;
  text-align: right;
}

.value.highlight {
  color: #16a34a;
  font-weight: $font-semibold;
}

.value.price {
  color: #f97316;
  font-weight: $font-semibold;
}

.badge-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 12rpx;
}

.badge {
  font-size: 22rpx;
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.tips-card {
  background: rgba(249, 115, 22, 0.08);
  border-radius: $border-radius-base;
  padding: $spacing-md;
  display: flex;
  gap: 16rpx;
  color: #c2410c;
  font-size: 24rpx;
  line-height: 1.6;
  box-shadow: $box-shadow-sm;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md;
  background: white;
  border-top: 1rpx solid $color-slate-200;
  box-shadow: 0 -10rpx 40rpx rgba(15, 23, 42, 0.08);
}

.submit-btn {
  width: 100%;
  height: 92rpx;
  border-radius: $border-radius-base;
  border: none;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  color: white;
  font-size: 30rpx;
  font-weight: $font-semibold;
  box-shadow: $box-shadow-button;
}

.submit-btn:active {
  transform: translateY(-2rpx);
  box-shadow: $box-shadow-button-hover;
}

.submit-btn[disabled] {
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.empty-state {
  min-height: 100vh;
  background: $color-slate-50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  color: $color-slate-500;
  font-size: 26rpx;
  text-align: center;
  padding: 0 $spacing-md;
}

.empty-text {
  line-height: 1.6;
}

.back-btn {
  border: 1rpx solid $color-slate-300;
  border-radius: $border-radius-base;
  padding: 16rpx 40rpx;
  font-size: 26rpx;
  color: $color-slate-600;
  background: white;
}
</style>


