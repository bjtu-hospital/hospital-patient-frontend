<template>
  <view class="reschedule-container">
    <view class="original-info" v-if="context">
      <view class="original-header">
        <text class="label">当前预约</text>
        <text class="status">待就诊</text>
      </view>
      <view class="info-row">
        <uni-icons type="home" size="20" color="#00BFCC"></uni-icons>
        <text class="info-text">{{ context.hospitalName }}</text>
      </view>
      <view class="info-row">
        <uni-icons type="person" size="20" color="#0ea5e9"></uni-icons>
        <text class="info-text">{{ context.departmentName }} · {{ context.doctorName }}</text>
      </view>
      <view class="info-row">
        <uni-icons type="calendar" size="20" color="#f97316"></uni-icons>
        <text class="info-text">{{ context.appointmentDate }} {{ context.appointmentTime }}</text>
      </view>
      <view class="info-row">
        <uni-icons type="wallet" size="20" color="#facc15"></uni-icons>
        <text class="info-text">挂号费 ¥{{ context.price }}</text>
      </view>
    </view>

    <view class="tips-box">
      <uni-icons type="info" size="20" color="#2563eb"></uni-icons>
      <text class="tips-text">请选择同科室新时间段，原预约会在改约成功后自动取消。</text>
    </view>

    <scroll-view class="date-tabs" scroll-x show-scrollbar="false" v-if="dateTabs.length > 1">
      <view
        class="date-tab"
        :class="{ active: selectedDate === date.value }"
        v-for="date in dateTabs"
        :key="date.value"
        @tap="selectDate(date.value)"
      >
        <text class="date-label">{{ date.label }}</text>
        <text class="date-desc" v-if="date.extra">{{ date.extra }}</text>
      </view>
    </scroll-view>

    <view class="schedule-list">
      <view v-if="groupedSchedules.length === 0" class="empty-state">
        <uni-icons type="calendar" size="44" color="#94a3b8"></uni-icons>
        <text class="empty-text">暂无可用时间段</text>
      </view>

      <view class="date-group" v-for="group in groupedSchedules" :key="group.date">
        <view class="group-title">{{ group.label }}</view>
        <view
          class="schedule-card"
          v-for="schedule in group.items"
          :key="schedule.id"
          :class="{
            disabled: schedule.availableSlots === 0,
            current: isCurrentSchedule(schedule)
          }"
          @tap="handleSelect(schedule)"
        >
          <view class="card-header">
            <text class="period">{{ schedule.period }} · {{ schedule.appointmentType }}门诊</text>
            <text class="price">¥{{ schedule.price }}</text>
          </view>
          <view class="card-body">
            <view class="row">
              <uni-icons type="time" size="18" color="#64748b"></uni-icons>
              <text class="row-text">{{ schedule.startTime }} - {{ schedule.endTime }}</text>
            </view>
            <view class="row">
              <uni-icons type="person" size="18" color="#64748b"></uni-icons>
              <text class="row-text">{{ schedule.doctorName }} {{ schedule.doctorTitle }}</text>
            </view>
          </view>
          <view class="card-footer">
            <view class="slots" :class="{ full: schedule.availableSlots === 0 }">
              <text v-if="schedule.availableSlots > 0">剩余 {{ schedule.availableSlots }} 个号源</text>
              <text v-else>已约满</text>
            </view>
            <view v-if="isCurrentSchedule(schedule)" class="flag">当前预约</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { getDoctorSchedules } from '@/api/appointment'

const appointmentStore = useAppointmentStore()
const context = ref(null)
const loading = ref(false)
const schedules = ref([])
const selectedDate = ref('all')

const dateTabs = computed(() => {
  const dates = new Map()
  schedules.value.forEach(item => {
    if (!dates.has(item.date)) {
      const dateObj = new Date(item.date)
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      dates.set(item.date, {
        value: item.date,
        label: item.date,
        extra: weekDays[dateObj.getDay()]
      })
    }
  })
  return [
    { value: 'all', label: '全部时间', extra: '' },
    ...Array.from(dates.values())
  ]
})

const groupedSchedules = computed(() => {
  let filtered = schedules.value

  if (selectedDate.value !== 'all') {
    filtered = filtered.filter(item => item.date === selectedDate.value)
  }

  const groups = filtered.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = []
    }
    acc[item.date].push(item)
    return acc
  }, {})

  return Object.keys(groups).sort().map(date => {
    const dateObj = new Date(date)
    const label = `${date} (${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()]})`
    return {
      date,
      label,
      items: groups[date]
    }
  })
})

const selectDate = (value) => {
  selectedDate.value = value
}

const isCurrentSchedule = (schedule) => {
  if (!context.value) return false
  if (context.value.scheduleId && schedule.id === context.value.scheduleId) {
    return true
  }
  return (
    schedule.date === context.value.appointmentDate &&
    `${schedule.period} ${schedule.startTime}-${schedule.endTime}` === context.value.appointmentTime
  )
}

const handleSelect = (schedule) => {
  if (!context.value) return
  if (schedule.availableSlots === 0) {
    uni.showToast({
      title: '该时间段已约满',
      icon: 'none'
    })
    return
  }

  if (isCurrentSchedule(schedule)) {
    uni.showToast({
      title: '请选择不同的时间段',
      icon: 'none'
    })
    return
  }

  appointmentStore.setRescheduleSelectedSchedule(schedule)
  uni.navigateTo({
    url: '/pages/home/reschedule/confirm'
  })
}

const loadSchedules = async () => {
  if (!context.value?.hospitalId || !context.value?.departmentId) {
    return
  }
  try {
    loading.value = true
    uni.showLoading({
      title: '加载号源...'
    })
    const result = await getDoctorSchedules({
      hospitalId: context.value.hospitalId,
      departmentId: context.value.departmentId
    })
    schedules.value = result || []
  } catch (error) {
    console.error('加载改约号源失败', error)
    uni.showToast({
      title: '加载失败，请稍后再试',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

onMounted(() => {
  appointmentStore.restoreRescheduleData()
  context.value = appointmentStore.rescheduleContext
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
    return
  }
  loadSchedules()
})
</script>

<style lang="scss" scoped>
.reschedule-container {
  min-height: 100vh;
  background: $color-slate-50;
  padding: $spacing-md;
}

.original-info {
  background: linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%);
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $box-shadow-base;
}

.original-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.label {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-800;
}

.status {
  font-size: 22rpx;
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-text {
  font-size: 24rpx;
  color: $color-slate-600;
}

.tips-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx;
  border-radius: $border-radius-base;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 24rpx;
  margin-bottom: $spacing-md;
}

.tips-text {
  flex: 1;
  line-height: 1.6;
}

.date-tabs {
  display: flex;
  background: white;
  border-radius: $border-radius-base;
  margin-bottom: $spacing-md;
  padding: 4rpx;
  box-shadow: $box-shadow-sm;
}

.date-tab {
  min-width: 160rpx;
  padding: 20rpx 24rpx;
  text-align: center;
  border-radius: $border-radius-base;
  margin-right: 12rpx;
  background: transparent;
  transition: all 0.2s ease;
}

.date-tab:last-child {
  margin-right: 0;
}

.date-tab.active {
  background: $hospital-primary;
  color: white;
  box-shadow: $box-shadow-base;
}

.date-label {
  font-size: 24rpx;
  font-weight: $font-medium;
}

.date-desc {
  font-size: 20rpx;
  margin-top: 4rpx;
  color: inherit;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.empty-state {
  background: white;
  border-radius: $border-radius-base;
  padding: 120rpx 0;
  text-align: center;
  box-shadow: $box-shadow-base;
  color: $color-slate-500;
}

.empty-text {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
}

.date-group {
  background: white;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $box-shadow-base;
}

.group-title {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: $color-slate-800;
  padding-bottom: $spacing-sm;
  border-bottom: 1rpx solid $color-slate-100;
  margin-bottom: $spacing-sm;
}

.schedule-card {
  border: 1rpx solid $color-slate-100;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  margin-top: $spacing-sm;
  transition: all 0.2s ease;
}

.schedule-card:active {
  transform: translateY(-2rpx);
  box-shadow: $box-shadow-md;
}

.schedule-card.disabled {
  opacity: 0.6;
}

.schedule-card.current {
  border-color: $hospital-primary;
  background: rgba(0, 213, 217, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.period {
  font-size: 24rpx;
  font-weight: $font-semibold;
  color: $color-slate-800;
}

.price {
  font-size: 24rpx;
  color: #f97316;
  font-weight: $font-semibold;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: $spacing-sm;
}

.row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.row-text {
  font-size: 24rpx;
  color: $color-slate-600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slots {
  font-size: 22rpx;
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.slots.full {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.flag {
  font-size: 22rpx;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}
</style>


