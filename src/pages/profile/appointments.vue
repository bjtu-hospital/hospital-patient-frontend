<template>
  <view class="appointments-container">
    <!-- 视图切换 -->
    <view class="view-switch">
      <view 
        class="switch-item"
        :class="{ 'active': viewMode === 'my' }"
        @tap="switchView('my')"
      >
        <text>我的就诊</text>
      </view>
      <view 
        class="switch-item"
        :class="{ 'active': viewMode === 'initiated' }"
        @tap="switchView('initiated')"
      >
        <text>我创建的</text>
      </view>
    </view>

    <!-- 状态筛选 -->
    <view class="status-tabs">
      <view 
        class="tab-item" 
        :class="{ 'active': selectedStatus === status.key }"
        v-for="status in statusTabs" 
        :key="status.key"
        @tap="switchStatus(status.key)"
      >
        <text class="tab-text">{{ status.name }}</text>
        <text class="tab-count" v-if="status.count > 0">({{ status.count }})</text>
      </view>
    </view>

    <!-- 预约列表 -->
    <view class="appointment-list">
      <!-- 使用新的 AppointmentCard 组件 - 代码更简洁！ -->
      <AppointmentCard
        v-for="appointment in filteredAppointments"
        :key="appointment.id"
        :appointment="appointment"
        @click="viewDetails"
        @pay="goToPayment"
        @cancel="cancelAppointment"
        @reschedule="rescheduleAppointment"
        @evaluate="evaluateAppointment"
      />

      <!-- 使用新的 EmptyState 组件 -->
      <EmptyState 
        v-if="filteredAppointments.length === 0"
        icon="list"
        :text="getEmptyText()"
      >
        <template #action>
          <button class="go-appointment-btn" @tap="goToAppointment">
            立即预约
          </button>
        </template>
      </EmptyState>
    </view>

    <!-- 返回首页浮动按钮 -->
    <view class="home-float-btn" @tap="goToHome">
      <text class="home-icon">🏠</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyAppointments, getMyInitiatedAppointments, cancelAppointment as cancelAppointmentApi } from '@/api/appointment'
import { useAppointmentStore } from '@/stores/appointment'
import { requestSubscribeMessage, getWxCode, SUBSCRIBE_TEMPLATE_IDS } from '@/utils/subscribe'
// ✅ 订阅消息授权已统一在首页完成，业务页面不再弹窗

const viewMode = ref('my') // 'my' | 'initiated'
const selectedStatus = ref('all')
const loading = ref(false)
const appointmentStore = useAppointmentStore()

// 状态标签
const statusTabs = ref([
  { key: 'all', name: '全部', count: 0 },
  { key: 'pending', name: '待就诊', count: 0 },
  { key: 'completed', name: '已完成', count: 0 },
  { key: 'cancelled', name: '已取消', count: 0 }
])

// 预约数据
const appointments = ref([])

// 过滤后的预约列表
const filteredAppointments = computed(() => {
  if (selectedStatus.value === 'all') {
    return appointments.value
  }
  return appointments.value.filter(appointment => appointment.status === selectedStatus.value)
})

// 切换视图
const switchView = (mode) => {
  if (viewMode.value === mode) return
  viewMode.value = mode
  selectedStatus.value = 'all' // 切换视图时重置状态为全部
  loadAppointments()
}

// 切换状态
const switchStatus = (statusKey) => {
  selectedStatus.value = statusKey
  // 从缓存中快速过滤（无需重新请求），保持和"全部/待就诊/已完成"切换一样快
  if (allAppointmentsCache.value.length > 0) {
    if (selectedStatus.value === 'all') {
      appointments.value = allAppointmentsCache.value
    } else {
      appointments.value = allAppointmentsCache.value.filter(a => a.status === selectedStatus.value)
    }
    appointmentStore.setAppointments(appointments.value)
  } else {
    // 首次加载或缓存为空时才请求
    loadAppointments()
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    all: '全部',
    pending: '待就诊',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取空状态提示文本
const getEmptyText = () => {
  const viewText = viewMode.value === 'my' ? '我的就诊' : '我创建的'
  const statusText = getStatusText(selectedStatus.value)
  return `暂无${viewText}${statusText === '全部' ? '' : statusText}预约`
}

// 查看详情
const viewDetails = (appointment) => {
  uni.showModal({
    title: '预约详情',
    content: `${appointment.hospitalName}\n${appointment.departmentName} - ${appointment.doctorName}\n${appointment.appointmentDate} ${appointment.appointmentTime}`,
    showCancel: false,
    confirmText: '知道了'
  })
}

// 取消预约
// 订阅消息：按需补齐，避免用户在首页跳过授权时无法推送
const cancelAppointment = async (appointment) => {
  uni.showModal({
    title: '取消预约',
    content: '确定要取消这个预约吗？取消后可能需要重新预约。',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '取消中...' })
          
          // 按需请求订阅授权（取消预约模板）
          let wxCode = null
          let subscribeAuthResult = null
          try {
            subscribeAuthResult = await requestSubscribeMessage([
              SUBSCRIBE_TEMPLATE_IDS.CANCEL_APPOINTMENT
            ])
            wxCode = await getWxCode()
          } catch (authErr) {
            console.warn('订阅授权失败，继续取消流程', authErr)
          }

          await cancelAppointmentApi(appointment.id, {
            ...(wxCode && { wxCode }),
            ...(subscribeAuthResult && { subscribeAuthResult }),
            subscribeScene: 'cancel'
          })
          
          console.log('✅ 取消预约成功')
          
          uni.hideLoading()
          uni.showToast({
            title: '预约已取消',
            icon: 'success'
          })
          
          loadAppointments()
          
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

// 改约
const rescheduleAppointment = async (appointment) => {
  if (!appointment || appointment.canReschedule === false) {
    uni.showToast({
      title: '当前预约不可改约',
      icon: 'none'
    })
    return
  }

  if (!appointment.hospitalId || !appointment.departmentId) {
    uni.showToast({
      title: '缺少改约所需信息，请重新创建预约',
      icon: 'none'
    })
    return
  }

  appointmentStore.setRescheduleContext({
    appointmentId: appointment.id,
    hospitalId: appointment.hospitalId,
    hospitalName: appointment.hospitalName,
    departmentId: appointment.departmentId,
    departmentName: appointment.departmentName,
    doctorName: appointment.doctorName,
    doctorTitle: appointment.doctorTitle,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    price: appointment.price,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    scheduleId: appointment.scheduleId || null
  })
  appointmentStore.setRescheduleSelectedSchedule(null)

  uni.navigateTo({
    url: '/pages/home/reschedule/select-schedule'
  })
}

// 评价
const evaluateAppointment = async (appointment) => {
  uni.showModal({
    title: '评价医生',
    content: '评价功能开发中，请稍后再试。',
    showCancel: false
  })
}

// 去预约
const goToAppointment = () => {
  uni.navigateTo({
    url: '/pages/home/appointment/select-hospital'
  })
}

// 去支付（候补转预约成功后）
const goToPayment = (appointment) => {
  // 保存预约信息到 storage，供支付页面使用
  uni.setStorageSync('lastAppointment', {
    id: appointment.id,
    orderNo: appointment.orderNo,
    hospitalName: appointment.hospitalName,
    departmentName: appointment.departmentName,
    doctorName: appointment.doctorName,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    patientName: appointment.patientName,
    price: appointment.price,
    needPay: true,
    paymentStatus: appointment.paymentStatus || 'pending'
  })
  
  // 跳转到支付页面
  uni.navigateTo({
    url: '/pages/home/appointment/payment'
  })
}

// 返回首页
const goToHome = () => {
  // 使用 reLaunch 代替 switchTab，避免从非 tabBar 页面跳转时先闪现到 profile/index
  uni.reLaunch({
    url: '/pages/home/index'
  })
}

// 全量预约数据缓存（用于快速切换和计数）
const allAppointmentsCache = ref([])

// 加载预约数据
const loadAppointments = async () => {
  try {
    loading.value = true

    // ✨ 根据视图模式调用不同的 API
    const apiCall = viewMode.value === 'my' ? getMyAppointments : getMyInitiatedAppointments

    // 一次性拉取全部数据并缓存（避免重复请求）
    const allResult = await apiCall({ page: 1, pageSize: 1000 })
    allAppointmentsCache.value = allResult.list || []

    // 更新状态标签计数（从缓存计算，保证准确且快速）
    statusTabs.value.forEach(tab => {
      if (tab.key === 'all') {
        tab.count = allAppointmentsCache.value.length
      } else {
        tab.count = allAppointmentsCache.value.filter(a => a.status === tab.key).length
      }
    })

    // 从缓存中过滤出当前选中状态的数据（内存过滤，无需额外请求）
    if (selectedStatus.value === 'all') {
      appointments.value = allAppointmentsCache.value
    } else {
      appointments.value = allAppointmentsCache.value.filter(a => a.status === selectedStatus.value)
    }

    appointmentStore.setAppointments(appointments.value)

  } catch (error) {
    console.error('获取预约列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('我的预约页面加载')
  loadAppointments()
})

// 🔧 FIXED: 添加 onShow 钩子，每次页面显示时都刷新数据（支付成功返回时会执行）
onShow(() => {
  console.log('我的预约页面显示，重新加载数据')
  loadAppointments()
})
</script>

<style lang="scss" scoped>
.appointments-container {
  background: $hospital-gradient-start;
  min-height: 100vh;
  padding: 32rpx;
  padding-bottom: 120rpx;
}

/* 视图切换 */
.view-switch {
  display: flex;
  background: white;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.switch-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s ease;
}

.switch-item.active {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-accent 100%);
  color: white;
  font-weight: 600;
}

/* 状态筛选 */
.status-tabs {
  display: flex;
  background: white;
  border-radius: 16rpx;
  padding: 16rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.tab-item.active {
  background: $hospital-primary;
  color: white;
}

.tab-text {
  font-size: 26rpx;
  color: #666;
}

.tab-count {
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
}

.tab-item.active .tab-text,
.tab-item.active .tab-count {
  color: white;
}

/* 预约列表 */
.appointment-list {
  margin-bottom: 32rpx;
}

.appointment-item {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.appointment-item:active {
  transform: translateY(-1rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.12);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.hospital-info {
  flex: 1;
}

.hospital-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.department-name {
  font-size: 24rpx;
  color: #666;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.status-badge.pending {
  background: #E8F4FD;
  color: #007AFF;
}

.status-badge.completed {
  background: #E8F5E8;
  color: #4cd964;
}

.status-badge.cancelled {
  background: #FFF2F0;
  color: #ff3b30;
}

.appointment-content {
  border-top: 1rpx solid #F5F5F5;
  padding-top: 20rpx;
}

.doctor-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.doctor-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-right: 16rpx;
}

.doctor-title {
  font-size: 22rpx;
  color: $hospital-primary;
}

.time-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.appointment-date {
  font-size: 24rpx;
  color: #333;
  margin-right: 16rpx;
}

.appointment-time {
  font-size: 22rpx;
  color: #666;
}

.patient-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.patient-label {
  font-size: 24rpx;
  color: #666;
  margin-right: 8rpx;
}

.patient-name {
  font-size: 24rpx;
  color: #333;
}

.appointment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid #F5F5F5;
  padding-top: 20rpx;
}

.price {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b35;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  border: none;
  transition: all 0.3s ease;
}

.action-btn.cancel {
  background: #FFF2F0;
  color: #ff3b30;
}

.action-btn.reschedule {
  background: #E8F4FD;
  color: #007AFF;
}

.action-btn.evaluate {
  background: #FFF3E0;
  color: #ff9500;
}

.action-btn:active {
  transform: translateY(-1rpx);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 32rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
}

.go-appointment-btn {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  color: white;
  border: none;
  border-radius: 24rpx;
  padding: 24rpx 48rpx;
  font-size: 26rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 25rpx rgba(0, 191, 204, 0.3);
}

.go-appointment-btn:active {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 35rpx rgba(0, 191, 204, 0.4);
}

/* 返回首页浮动按钮 */
.home-float-btn {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  box-shadow: 0 8rpx 25rpx rgba(0, 191, 204, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.3s ease;
}

.home-float-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 15rpx rgba(0, 191, 204, 0.5);
}

.home-icon {
  font-size: 40rpx;
}
</style>
