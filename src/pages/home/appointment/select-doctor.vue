<template>
  <view class="select-doctor-container">
    <!-- 顶部日期选择 -->
    <scroll-view class="date-tabs" scroll-x show-scrollbar="false">
      <view 
        class="date-tab"
        :class="{ active: selectedDate === date.value }"
        v-for="date in availableDates" 
        :key="date.value"
        @tap="selectDate(date.value)"
      >
        <text class="date-label">{{ date.label }}</text>
        <text class="date-day">{{ date.day }}</text>
      </view>
    </scroll-view>

    <!-- 左右布局：门诊类型 + 医生列表 -->
    <view class="content-wrapper">
      <!-- 左侧：门诊类型 -->
      <view class="type-sidebar">
        <view 
          class="type-item"
          :class="{ active: selectedType === type.key }"
          v-for="type in appointmentTypes" 
          :key="type.key"
          @tap="selectType(type.key)"
        >
          <text class="type-text">{{ type.name }}</text>
          <view class="type-indicator" v-if="selectedType === type.key"></view>
        </view>
      </view>

      <!-- 右侧：医生列表 -->
      <scroll-view class="doctor-content" scroll-y>
        <!-- 科室信息头部 -->
        <view class="dept-header">
          <view class="dept-icon">
            <uni-icons type="person-filled" size="32" color="#64748b"></uni-icons>
          </view>
          <view class="dept-info">
            <text class="dept-title">{{ currentDepartment?.name }}...</text>
            <view class="dept-action" @tap="showDeptDetail">
              <text class="action-link">主页</text>
              <text class="action-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- 院区信息 -->
        <view class="location-card">
          <view class="location-icon">
            <uni-icons type="location-filled" size="24" color="#00BFCC"></uni-icons>
          </view>
          <view class="location-info">
            <text class="location-name">{{ currentHospital?.name?.split('（')[0] }}</text>
            <text class="location-address">{{ currentHospital?.address }}</text>
          </view>
        </view>

        <!-- 按日期分组的医生列表 -->
        <view class="doctor-groups" v-if="groupedDoctors.length > 0">
          <view class="date-group" v-for="group in groupedDoctors" :key="group.date">
            <view class="group-date">{{ group.dateLabel }}</view>
            
            <view 
              class="doctor-card" 
              v-for="schedule in group.schedules" 
              :key="schedule.id"
              @tap="selectSchedule(schedule)"
            >
              <text class="doctor-name">{{ schedule.doctorName }}</text>
              
              <view class="schedule-info">
                <text class="schedule-time">{{ schedule.period }} {{ schedule.appointmentType }}</text>
                <text class="schedule-price">¥{{ schedule.price }}</text>
              </view>
              
              <text class="schedule-dept">{{ currentDepartment?.name }}</text>
              
              <view class="schedule-status" v-if="schedule.availableSlots > 0">
                <text class="status-text">余：{{ schedule.availableSlots }}</text>
              </view>
              <view class="schedule-status full" v-else>
                <text class="status-text">已约满</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-else>
          <text class="empty-text">暂无号源</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部返回按钮（浮动） -->
    <view class="float-back" @tap="goBack">
      <view class="back-icon">
        <uni-icons type="back" size="28" color="white"></uni-icons>
      </view>
      <text class="back-text">返回</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'

const appointmentStore = useAppointmentStore()
const currentHospital = ref(null)
const currentDepartment = ref(null)
const selectedDate = ref('all')
const selectedType = ref('normal')

// 生成可选日期（未来7天）
const generateAvailableDates = () => {
  const dates = [{ value: 'all', label: '全部', day: '' }]
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    let label = ''
    
    if (i === 0) {
      label = '今天'
    } else if (i === 1) {
      label = '明天'
    } else {
      label = weekDays[date.getDay()]
    }
    
    dates.push({
      value: `${date.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      label: label,
      day: `${month}.${String(day).padStart(2, '0')}`
    })
  }
  
  return dates
}

const availableDates = ref(generateAvailableDates())

// 门诊类型
const appointmentTypes = ref([
  { key: 'normal', name: '普通门诊' },
  { key: 'expert', name: '专家/特需/国际部门诊' },
  { key: 'special', name: '专病门诊' }
])

// 模拟医生排班数据
const schedules = ref([
  // 2025-11-01
  { id: 1, doctorName: '刘靖', date: '2025-11-01', period: '上午', appointmentType: '普通', type: 'normal', price: 50, availableSlots: 0 },
  { id: 2, doctorName: '王鲁雁', date: '2025-11-01', period: '下午', appointmentType: '普通', type: 'normal', price: 50, availableSlots: 0 },
  { id: 3, doctorName: '喜杨', date: '2025-11-01', period: '下午', appointmentType: '普通', type: 'normal', price: 50, availableSlots: 0 },
  
  // 2025-11-02
  { id: 4, doctorName: '孙宁玲', date: '2025-11-02', period: '上午', appointmentType: '普通', type: 'normal', price: 50, availableSlots: 0 },
  { id: 5, doctorName: '王鸿懿', date: '2025-11-02', period: '上午', appointmentType: '普通', type: 'normal', price: 50, availableSlots: 0 },
  { id: 6, doctorName: '陈源源', date: '2025-11-02', period: '下午', appointmentType: '普通', type: 'normal', price: 50, availableSlots: 0 },
  
  // 2025-11-03
  { id: 7, doctorName: '张医生', date: '2025-11-03', period: '上午', appointmentType: '普通', type: 'normal', price: 50, availableSlots: 25 },
  { id: 8, doctorName: '李主任', date: '2025-11-03', period: '上午', appointmentType: '专家', type: 'expert', price: 100, availableSlots: 10 },
  { id: 9, doctorName: '王教授', date: '2025-11-03', period: '下午', appointmentType: '特需', type: 'expert', price: 200, availableSlots: 5 },
  
  // 专病门诊
  { id: 10, doctorName: '高血压出院随访门诊', date: '2025-11-03', period: '上午', appointmentType: '专病', type: 'special', price: 50, availableSlots: 15 },
  { id: 11, doctorName: '妊娠相关高血压专业门诊', date: '2025-11-03', period: '下午', appointmentType: '专病', type: 'special', price: 60, availableSlots: 8 }
])

// 按日期和类型过滤并分组
const groupedDoctors = computed(() => {
  // 先按类型过滤
  let filtered = schedules.value.filter(s => s.type === selectedType.value)
  
  // 再按日期过滤
  if (selectedDate.value !== 'all') {
    filtered = filtered.filter(s => s.date === selectedDate.value)
  }
  
  // 按日期分组
  const groups = {}
  filtered.forEach(schedule => {
    if (!groups[schedule.date]) {
      groups[schedule.date] = []
    }
    groups[schedule.date].push(schedule)
  })
  
  // 转换为数组并格式化日期标签
  return Object.keys(groups).map(date => {
    const [year, month, day] = date.split('-')
    const dateObj = new Date(date)
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    
    return {
      date: date,
      dateLabel: `${year}-${month}-${day} (${weekDays[dateObj.getDay()]})`,
      schedules: groups[date]
    }
  }).sort((a, b) => a.date.localeCompare(b.date))
})

// 选择日期
const selectDate = (dateValue) => {
  selectedDate.value = dateValue
}

// 选择门诊类型
const selectType = (typeKey) => {
  selectedType.value = typeKey
}

// 查看科室详情
const showDeptDetail = () => {
  uni.showModal({
    title: currentDepartment.value?.name,
    content: currentDepartment.value?.description || '暂无详细介绍',
    showCancel: false
  })
}

// 选择某个排班
const selectSchedule = (schedule) => {
  if (schedule.availableSlots === 0) {
    uni.showToast({
      title: '号源已满',
      icon: 'none'
    })
    return
  }
  
  // 保存选择的排班到 Store
  appointmentStore.setSelectedSchedule(schedule)
  
  // 跳转到确认预约页面
  uni.navigateTo({
    url: '/pages/home/appointment/confirm'
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  // 从 Store 获取选中的医院和科室
  currentHospital.value = appointmentStore.selectedHospital
  currentDepartment.value = appointmentStore.selectedDepartment
  
  // 生成可选日期
  generateAvailableDates()
})
</script>

<style lang="scss" scoped>
.select-doctor-container {
  background: $color-slate-50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部日期选择 */
.date-tabs {
  background: white;
  white-space: nowrap;
  border-bottom: 1rpx solid $color-slate-200;
}

.date-tab {
  display: inline-block;
  padding: $spacing-md $spacing-md;
  text-align: center;
  min-width: 120rpx;
  transition: all 0.2s ease;
}

.date-tab.active {
  background: $hospital-primary;
  color: white;
}

.date-label {
  font-size: 24rpx;
  color: $color-slate-700;
  display: block;
  margin-bottom: 4rpx;
}

.date-tab.active .date-label {
  color: white;
  font-weight: $font-semibold;
}

.date-day {
  font-size: 20rpx;
  color: $color-slate-500;
}

.date-tab.active .date-day {
  color: white;
}

/* 左右布局 */
.content-wrapper {
  flex: 1;
  display: flex;
}

/* 左侧门诊类型 */
.type-sidebar {
  width: 240rpx;
  background: $color-slate-50;
  border-right: 1rpx solid $color-slate-200;
}

.type-item {
  padding: 32rpx $spacing-md;
  text-align: center;
  position: relative;
  transition: all 0.2s ease;
  border-bottom: 1rpx solid $color-slate-100;
}

.type-item.active {
  background: white;
}

.type-text {
  font-size: 24rpx;
  color: $color-slate-700;
  line-height: 1.5;
  word-break: break-all;
}

.type-item.active .type-text {
  color: $hospital-primary;
  font-weight: $font-semibold;
}

.type-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 60rpx;
  background: $hospital-primary;
  border-radius: 0 6rpx 6rpx 0;
}

/* 右侧医生列表 */
.doctor-content {
  flex: 1;
  background: white;
}

/* 科室信息头部 */
.dept-header {
  padding: $spacing-md;
  background: #FEF3C7;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.dept-icon {
  font-size: 48rpx;
}

.dept-info {
  flex: 1;
}

.dept-title {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  display: block;
  margin-bottom: 4rpx;
}

.dept-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.action-link {
  font-size: 22rpx;
  color: $hospital-primary;
}

.action-arrow {
  font-size: 20rpx;
  color: $hospital-primary;
}

/* 院区信息 */
.location-card {
  padding: $spacing-md;
  background: white;
  border-bottom: 1rpx solid $color-slate-200;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
}

.location-icon {
  font-size: 32rpx;
}

.location-info {
  flex: 1;
}

.location-name {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  display: block;
  margin-bottom: 4rpx;
}

.location-address {
  font-size: 22rpx;
  color: $color-slate-600;
}

/* 医生分组 */
.doctor-groups {
  padding: $spacing-md;
}

.date-group {
  margin-bottom: $spacing-lg;
}

.group-date {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-sm;
  border-bottom: 2rpx solid $hospital-primary;
}

.doctor-card {
  background: white;
  border: 1rpx solid $color-slate-200;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  position: relative;
  transition: all 0.2s ease;
}

.doctor-card:active {
  transform: translateY(-2rpx);
  box-shadow: $box-shadow-md;
}

.doctor-name {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
  display: block;
  margin-bottom: $spacing-sm;
}

.schedule-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.schedule-time {
  font-size: 24rpx;
  color: $color-slate-700;
}

.schedule-price {
  font-size: 26rpx;
  font-weight: $font-semibold;
  color: #dc2626;
}

.schedule-dept {
  font-size: 22rpx;
  color: $color-slate-500;
  display: block;
}

.schedule-status {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  padding: 8rpx 16rpx;
  background: $hospital-primary;
  color: white;
  border-radius: 24rpx;
  font-size: 20rpx;
  font-weight: $font-medium;
}

.schedule-status.full {
  background: $color-slate-300;
  color: $color-slate-600;
}

.status-text {
  font-size: 20rpx;
}

/* 空状态 */
.empty-state {
  padding: 120rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: $color-slate-400;
}

/* 浮动返回按钮 */
.float-back {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: $hospital-primary;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 191, 204, 0.4);
  z-index: 100;
}

.back-icon {
  font-size: 32rpx;
  color: white;
  margin-bottom: 4rpx;
}

.back-text {
  font-size: 20rpx;
  color: white;
}
</style>
