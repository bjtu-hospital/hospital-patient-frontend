<template>
  <view class="waitlist-success-container">
    <!-- 顶部状态栏 -->
    <view class="status-header">
      <text class="status-title">{{ statusTitle }}</text>
      <text class="status-desc">{{ statusDesc }}</text>
    </view>

    <!-- 候补信息卡片 -->
    <view class="info-card">
      <view class="date-badge">
        <text class="date-text">{{ appointmentDate }} {{ period }}</text>
        <view class="waitlist-tag">
          <text class="tag-text">候补</text>
        </view>
      </view>

      <view class="info-list">
        <view class="info-row">
          <text class="info-label">就诊医院</text>
          <text class="info-value">{{ hospitalName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">就诊科室</text>
          <text class="info-value">{{ departmentName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">就诊医生</text>
          <text class="info-value">{{ doctorName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">门诊类型</text>
          <text class="info-value">{{ appointmentType }} <text class="price">¥{{ price }}</text></text>
        </view>
        <view class="info-row">
          <text class="info-label">就诊地点</text>
          <text class="info-value"></text>
        </view>
        <view class="info-row">
          <text class="info-label">就 诊 人</text>
          <text class="info-value">{{ patientName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">就诊卡号</text>
          <text class="info-value">{{ patientCard }} (自费/公费)</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-action">
      <button 
        class="cancel-btn" 
        @tap="cancelWaitlist"
        v-if="status === 'waiting'"
      >
        取消候补
      </button>
      <view class="status-text" v-else>
        {{ getStatusDisplayText }}
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="float-back" @tap="goBack">
      <view class="back-icon">
        <uni-icons type="home-filled" size="28" color="white"></uni-icons>
      </view>
      <text class="back-text">首页</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { cancelWaitlist as cancelWaitlistAPI, getMyWaitlist } from '@/api/appointment'

const appointmentStore = useAppointmentStore()

const waitlistId = ref('')
const position = ref(0)
const status = ref('waiting')  // 新增：状态
const hospitalName = ref('')
const departmentName = ref('')
const doctorName = ref('')
const appointmentType = ref('')
const price = ref(0)
const appointmentDate = ref('')
const period = ref('')
const patientName = ref('')
const patientCard = ref('')
const expiryTime = ref('')

// 根据状态计算标题
const statusTitle = computed(() => {
  const statusMap = {
    waiting: '候补中',
    waitlist: '候补中',
    converted: '已转预约',
    success: '候补成功',
    expired: '已过期',
    cancelled: '已取消'
  }
  return statusMap[status.value] || '候补中'
})

// 根据状态计算描述
const statusDesc = computed(() => {
  if (status.value === 'waiting' || status.value === 'waitlist') {
    return `请耐心等待，候补截止时间${expiryTime.value}。到截止时间的未看号，系统将为您自动取消，此前您也可以随时取消候补`
  } else if (status.value === 'converted' || status.value === 'success') {
    return '恭喜！您的候补已成功转为预约，请按时就诊。'
  } else if (status.value === 'expired') {
    return '抱歉，您的候补已过期。您可以返回继续新的候补或预约。'
  } else if (status.value === 'cancelled') {
    return '您已取消该候补。如需就诊，请重新预约或候补。'
  }
  return ''
})

// 非候补中状态的提示文本
const getStatusDisplayText = computed(() => {
  const textMap = {
    converted: '已成功转为预约',
    success: '已成功转为预约',
    expired: '候补已过期',
    cancelled: '已取消'
  }
  return textMap[status.value] || '候补中'
})

// 取消候补
const cancelWaitlist = () => {
  uni.showModal({
    title: '取消候补',
    content: '确定要取消候补吗？取消后需重新加入候补队列。',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '取消中...' })
          
          await cancelWaitlistAPI(waitlistId.value)
          
          uni.hideLoading()
          uni.showToast({
            title: '已取消候补',
            icon: 'success'
          })
          
          // 返回到我的候补页面
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
          
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

// 返回首页
const goBack = () => {
  // 直接返回到首页，而不是逐级返回
  uni.reLaunch({
    url: '/pages/home/index'
  })
}

/**
 * 从后端加载候补详情
 */
const loadWaitlistDetail = async (id) => {
  try {
    console.log('🔍 加载候补详情，waitlistId:', id)
    
    // 调用后端接口获取候补列表
    const result = await getMyWaitlist()
    const list = result.list || result || []
    
    console.log('📋 候补列表:', list)
    
    // 找到当前候补记录
    const waitlist = list.find(item => item.id == id)
    
    if (waitlist) {
      console.log('✅ 找到候补记录:', waitlist)
      
      // ✅ 使用后端返回的真实数据
      hospitalName.value = waitlist.hospitalName || '未知医院'
      departmentName.value = waitlist.departmentName || '未知科室'
      doctorName.value = waitlist.doctorName || '未知医生'
      appointmentType.value = waitlist.appointmentType || '普通门诊'
      price.value = waitlist.price || 0
      appointmentDate.value = waitlist.appointmentDate || ''
      period.value = waitlist.appointmentTime || '上午'
      patientName.value = waitlist.patientName || '未知'
      position.value = waitlist.queueNumber || 0
      status.value = waitlist.status || 'waitlist'
      
      // 计算截止时间（就诊前一日 18:00）
      if (appointmentDate.value) {
        const appointmentDay = new Date(appointmentDate.value)
        appointmentDay.setDate(appointmentDay.getDate() - 1)
        const year = appointmentDay.getFullYear()
        const month = String(appointmentDay.getMonth() + 1).padStart(2, '0')
        const day = String(appointmentDay.getDate()).padStart(2, '0')
        expiryTime.value = `${year}-${month}-${day} 18:00:00`
      }
    } else {
      console.warn('⚠️ 未找到候补记录，使用 Store 数据')
      // 如果没找到，使用 Store 中的数据（刚创建时）
      loadFromStore()
    }
  } catch (error) {
    console.error('❌ 加载候补详情失败:', error)
    // 加载失败时使用 Store 数据
    loadFromStore()
  }
}

/**
 * 从 Store 加载数据（备用方案）
 */
const loadFromStore = () => {
  const schedule = appointmentStore.selectedSchedule || {}
  const patient = appointmentStore.selectedPatient || {}
  const hospital = appointmentStore.selectedHospital || {}
  const department = appointmentStore.selectedDepartment || {}
  
  hospitalName.value = hospital.name || '未知医院'
  departmentName.value = department.name || '未知科室'
  doctorName.value = schedule.doctorName || '未知医生'
  appointmentType.value = schedule.appointmentType || '普通门诊'
  price.value = schedule.price || 0
  appointmentDate.value = schedule.date || new Date().toISOString().split('T')[0]
  period.value = schedule.period || '上午'
  patientName.value = patient.name || '未知'
  patientCard.value = patient.idCard?.slice(-8) || patient.patientId || '未绑定'
  
  // 计算截止时间
  if (appointmentDate.value) {
    const appointmentDay = new Date(appointmentDate.value)
    appointmentDay.setDate(appointmentDay.getDate() - 1)
    const year = appointmentDay.getFullYear()
    const month = String(appointmentDay.getMonth() + 1).padStart(2, '0')
    const day = String(appointmentDay.getDate()).padStart(2, '0')
    expiryTime.value = `${year}-${month}-${day} 18:00:00`
  }
}

onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  
  waitlistId.value = options.waitlistId || ''
  position.value = parseInt(options.position) || 0
  status.value = options.status || 'waitlist'

  console.log('📄 候补成功页面参数:', {
    waitlistId: waitlistId.value,
    position: position.value,
    status: status.value
  })

  // ✅ 优先从后端加载候补详情
  if (waitlistId.value) {
    await loadWaitlistDetail(waitlistId.value)
  } else {
    // 没有 waitlistId 时使用 Store 数据
    loadFromStore()
  }
})
</script>

<style lang="scss" scoped>
.waitlist-success-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 顶部状态栏 */
.status-header {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  padding: 48rpx 32rpx;
  color: white;
}

.status-title {
  font-size: 36rpx;
  font-weight: $font-bold;
  display: block;
  margin-bottom: 16rpx;
}

.status-desc {
  font-size: 24rpx;
  line-height: 1.6;
  opacity: 0.95;
}

/* 信息卡片 */
.info-card {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $box-shadow-base;
}

.date-badge {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-text {
  font-size: 32rpx;
  font-weight: $font-bold;
  color: white;
}

.waitlist-tag {
  background: rgba(255, 255, 255, 0.3);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.tag-text {
  font-size: 22rpx;
  color: white;
  font-weight: $font-medium;
}

.info-list {
  padding: 32rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $color-slate-100;
  position: relative;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: $color-slate-600;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
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

.arrow {
  font-size: 28rpx;
  color: $color-slate-400;
  margin-left: 8rpx;
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

.cancel-btn {
  width: 100%;
  height: 88rpx;
  background: white;
  color: #dc2626;
  border: 2rpx solid #dc2626;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: $font-semibold;
  
  &::after {
    border: none;
  }
  
  &:active {
    background: #fef2f2;
  }
}

.status-text {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-slate-100;
  color: $color-slate-500;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: $font-semibold;
}

/* 浮动返回按钮 */
.float-back {
  position: fixed;
  bottom: 140rpx;
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
