<template>
  <view class="confirm-waitlist-container">
    <!-- 顶部提示 -->
    <view class="top-notice">
      <view class="notice-icon">
        <uni-icons type="sound-filled" size="20" color="#f59e0b"></uni-icons>
      </view>
      <text class="notice-text">前{{ queuePosition }}人未看号，将为您自动取消，此前您也可以随时取消候补</text>
    </view>

    <!-- 就诊人选择 -->
    <view class="patient-section" @tap="selectPatient">
      <view class="section-header">
        <view class="header-icon">
          <uni-icons type="person-filled" size="24" color="#00D5D9"></uni-icons>
        </view>
        <text class="header-title">就诊人</text>
      </view>
      <view class="patient-select">
        <text class="patient-name" v-if="selectedPatient">{{ selectedPatient.name }}</text>
        <text class="patient-placeholder" v-else>请选择就诊人</text>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 候补信息 -->
    <view class="waitlist-info">
      <view class="info-item">
        <text class="info-label">就诊医院</text>
        <text class="info-value">{{ hospitalName }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">就诊科室</text>
        <text class="info-value">{{ departmentName }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">就诊医生</text>
        <text class="info-value">{{ schedule.doctorName }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">门诊类型</text>
        <text class="info-value">{{ schedule.appointmentType }} <text class="price">¥{{ schedule.price }}</text></text>
      </view>
      <view class="info-item">
        <text class="info-label">候补日期</text>
        <text class="info-value">{{ schedule.date }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">候补时间段</text>
        <text class="info-value">{{ schedule.period }}</text>
      </view>
    </view>

    <!-- 温馨提示 -->
    <view class="tips-section">
      <view class="tips-header">
        <view class="tips-icon">
          <uni-icons type="info-filled" size="20" color="#ef4444"></uni-icons>
        </view>
        <text class="tips-title">温馨提示：</text>
      </view>
      <view class="tips-content">
        <text class="tips-title-text">候补须知：</text>
        <text class="tips-item">1. 候补挂号规则：就诊人提交候补需求时，同一候补需求不能重复提交。</text>
        <text class="tips-item">2. 候补订单数量：就诊人同时最多可提交3个候补订单。</text>
        <text class="tips-item">3. 候补截止时间：候补兑现截止时间为就诊前一日18:00，超过截止时间将自动结束候补。</text>
        <text class="tips-item">4. 查询候补状态：为了及时了解候补结果，请通过"就医服务-我的-候补订单"进行查询。</text>
        <text class="tips-item">5. 候补成功后自费公费患者请在8小时内缴费，医保患者请在就诊日前1天18:00前缴费，超过自动取消，医保患者请在就诊日前1天18:00前缴费。</text>
      </view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-action">
      <button class="confirm-btn" @tap="confirmWaitlist" :disabled="!selectedPatient">
        确认候补
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { getPatients } from '@/api/user'
import { createWaitlist } from '@/api/appointment'

const appointmentStore = useAppointmentStore()

const schedule = ref({})
const hospitalName = ref('')
const departmentName = ref('')
const selectedPatient = ref(null)
const patients = ref([])
const queuePosition = ref(0) // 前面有多少人

// 选择就诊人
const selectPatient = () => {
  if (patients.value.length === 0) {
    uni.showToast({
      title: '请先添加就诊人',
      icon: 'none'
    })
    return
  }

  const patientNames = patients.value.map(p => p.name)
  uni.showActionSheet({
    itemList: patientNames,
    success: (res) => {
      selectedPatient.value = patients.value[res.tapIndex]
    }
  })
}

// 确认候补
const confirmWaitlist = async () => {
  if (!selectedPatient.value) {
    uni.showToast({
      title: '请选择就诊人',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({ title: '加入中...' })

    // 保存选中的就诊人到 Store
    appointmentStore.setSelectedPatient(selectedPatient.value)

    const result = await createWaitlist({
      scheduleId: schedule.value.id,
      patientId: selectedPatient.value.id
    })

    uni.hideLoading()

    // 清空预约流程数据
    appointmentStore.clearAppointmentData()

    // 跳转到候补成功页面
    uni.redirectTo({
      url: `/pages/home/appointment/waitlist-success?waitlistId=${result.waitlistId}&position=${result.position}`
    })

  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '加入候补失败',
      icon: 'none'
    })
  }
}

onMounted(async () => {
  // 从 Store 获取选中的排班信息
  schedule.value = appointmentStore.selectedSchedule || {}
  hospitalName.value = appointmentStore.selectedHospital?.name || ''
  departmentName.value = appointmentStore.selectedDepartment?.name || ''

  // 获取就诊人列表
  try {
    const data = await getPatients()
    patients.value = data || []
    
    // 默认选择第一个就诊人
    if (patients.value.length > 0) {
      selectedPatient.value = patients.value.find(p => p.isDefault) || patients.value[0]
    }
  } catch (error) {
    console.error('获取就诊人列表失败:', error)
  }

  // 模拟前面的候补人数
  queuePosition.value = Math.floor(Math.random() * 5)
})
</script>

<style lang="scss" scoped>
.confirm-waitlist-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 顶部提示 */
.top-notice {
  background: #fffbeb;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  border-bottom: 1rpx solid #fef3c7;
}

.notice-icon {
  margin-top: 2rpx;
}

.notice-text {
  flex: 1;
  font-size: 24rpx;
  color: #92400e;
  line-height: 1.6;
}

/* 就诊人选择 */
.patient-section {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: $border-radius-lg;
  padding: 32rpx;
  box-shadow: $box-shadow-base;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.header-icon {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.patient-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: $color-slate-50;
  border-radius: $border-radius-base;
  border: 1rpx solid $color-slate-200;
}

.patient-name {
  font-size: 26rpx;
  color: $color-slate-900;
  font-weight: $font-medium;
}

.patient-placeholder {
  font-size: 26rpx;
  color: $color-slate-400;
}

.arrow {
  font-size: 32rpx;
  color: $color-slate-400;
}

/* 候补信息 */
.waitlist-info {
  background: white;
  margin: 0 32rpx 24rpx;
  border-radius: $border-radius-lg;
  padding: 32rpx;
  box-shadow: $box-shadow-base;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $color-slate-100;
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
  margin-left: 8rpx;
}

/* 温馨提示 */
.tips-section {
  background: white;
  margin: 0 32rpx 24rpx;
  border-radius: $border-radius-lg;
  padding: 32rpx;
  box-shadow: $box-shadow-base;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.tips-icon {
  display: flex;
  align-items: center;
}

.tips-title {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: #dc2626;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tips-title-text {
  font-size: 24rpx;
  color: $color-slate-700;
  font-weight: $font-medium;
  margin-bottom: 8rpx;
}

.tips-item {
  font-size: 22rpx;
  color: $color-slate-600;
  line-height: 1.6;
}

/* 底部按钮 */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: white;
  border-top: 1rpx solid $color-slate-200;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: $font-semibold;
  box-shadow: 0 8rpx 25rpx rgba(0, 213, 217, 0.3);
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 35rpx rgba(0, 213, 217, 0.4);
  }
  
  &[disabled] {
    background: $color-slate-300;
    color: $color-slate-500;
    box-shadow: none;
  }
}
</style>
