<template>
  <view class="confirm-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">预约挂号申请</text>
    </view>

    <!-- 就诊人选择 -->
    <view class="patient-section">
      <view class="section-header">
        <view class="section-icon">
          <uni-icons type="person-filled" size="24" color="#00BFCC"></uni-icons>
        </view>
        <text class="section-title">就诊人</text>
      </view>
      
      <view class="patient-selector" @tap="selectPatient">
        <view class="patient-info" v-if="selectedPatient">
          <view class="patient-main">
            <text class="patient-name">{{ selectedPatient.name }}</text>
            <text class="patient-relation">{{ selectedPatient.relation || '本人' }}</text>
          </view>
          <text class="patient-phone">{{ selectedPatient.phone }}</text>
        </view>
        <text class="patient-placeholder" v-else>请选择就诊人</text>
        <text class="selector-arrow">›</text>
      </view>
    </view>

    <!-- 预约信息 -->
    <view class="appointment-info">
      <view class="info-row">
        <text class="info-label">就诊院区</text>
        <text class="info-value">{{ appointmentInfo.hospital }}</text>
      </view>
      
      <view class="info-row">
        <text class="info-label">就诊科室</text>
        <text class="info-value">{{ appointmentInfo.department }}</text>
      </view>
      
      <view class="info-row">
        <text class="info-label">门诊类型</text>
        <view class="info-value-group">
          <text class="info-value">{{ appointmentInfo.appointmentType }}</text>
          <text class="info-price">¥ {{ appointmentInfo.price }}元</text>
        </view>
      </view>
      
      <view class="info-row">
        <text class="info-label">专病名称</text>
        <text class="info-value">{{ appointmentInfo.department }}</text>
      </view>
      
      <view class="info-row clickable" @tap="changeTime">
        <text class="info-label">候诊时间</text>
        <view class="info-value-group">
          <text class="info-value primary">{{ appointmentInfo.dateTime }}</text>
          <text class="change-hint">可切换自己想要的时间段</text>
          <text class="selector-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 重要提示 -->
    <view class="important-tips">
      <view class="tips-header">
        <view class="tips-icon">
          <uni-icons type="info-filled" size="24" color="#dc2626"></uni-icons>
        </view>
        <text class="tips-title">重要提示：</text>
      </view>
      
      <view class="tips-content">
        <text class="tip-item">1、挂号：同一患者同一诊疗单元内，最多可以挂同一科室同一类别（普通、专业、专家、特需）各1个号；同一就诊人8天内最多可挂10个号。</text>
        
        <text class="tip-item">2、就诊：请于就诊日当天按要求时间到医院取号候诊（取号时间：西直门院区/白塔寺院区上午号11:30前、下午号16:30前；通州院区上午号11:30前、下午号16:00前）；已缴挂号费患者可直接报到就诊；诊疗单元结束后，若仍未就诊，将记录为爽约1次，30天内爽约3次，暂停服务号预约挂号权限90天。</text>
        
        <text class="tip-item">3、取消挂号：如遇特殊情况需要取消挂号，上午号最晚于就诊日当天8点之前在手机微信公众号上退号，下午号请最晚于就诊日当天13点之前在手机微信公众号上退号，其他时间须到医院挂号窗口办理。</text>
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="bottom-actions">
      <button class="submit-btn" :disabled="!selectedPatient" @tap="submitAppointment">
        提交
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { usePaymentStore } from '@/stores/payment'  // ✅ 导入支付Store
import { getPatients } from '@/api/user'  // ✨ 导入 API
import { createAppointment } from '@/api/appointment'  // ✨ 导入预约API
import { createPaymentOrder } from '@/api/payment'  // ✅ 导入支付API

const appointmentStore = useAppointmentStore()
const paymentStore = usePaymentStore()  // ✅ 使用支付Store
const selectedPatient = ref(null)
const loading = ref(false)

// 预约信息汇总
const appointmentInfo = reactive({
  hospital: '',
  department: '',
  appointmentType: '',
  dateTime: '',
  price: 0
})

// 就诊人列表（从 API 获取）
const patients = ref([])

// 加载就诊人列表
const loadPatients = async () => {
  try {
    loading.value = true
    // ✨ 调用 API，自动判断使用 Mock 还是真实接口
    const data = await getPatients()
    patients.value = data
    
    // 自动选择默认就诊人
    const defaultPatient = data.find(p => p.isDefault)
    if (defaultPatient) {
      selectedPatient.value = defaultPatient
    } else if (data.length > 0) {
      selectedPatient.value = data[0]
    }
  } catch (error) {
    console.error('获取就诊人列表失败:', error)
    uni.showToast({
      title: '获取就诊人失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 选择就诊人
const selectPatient = () => {
  if (patients.value.length === 0) {
    uni.showModal({
      title: '提示',
      content: '您还没有添加就诊人，是否前往添加？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/profile/patients'
          })
        }
      }
    })
    return
  }
  
  // 格式化就诊人列表：姓名 (关系)
  const patientItems = patients.value.map(p => {
    const relation = p.relation || '本人'
    const defaultTag = p.isDefault ? ' [默认]' : ''
    return `${p.name} (${relation})${defaultTag}`
  })
  
  uni.showActionSheet({
    itemList: patientItems,
    success: (res) => {
      selectedPatient.value = patients.value[res.tapIndex]
      console.log('选择了就诊人:', selectedPatient.value)
    }
  })
}

// 修改时间
const changeTime = () => {
  uni.showModal({
    title: '切换时间',
    content: '确定要重新选择就诊时间吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}

// 提交预约
const submitAppointment = async () => {
  if (!selectedPatient.value) {
    uni.showToast({
      title: '请选择就诊人',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '预约中...',
    mask: true
  })
  
  try {
    // ✅ 调用 API 创建预约(自动判断使用 Mock 还是真实接口)
    const schedule = appointmentStore.selectedSchedule
    
    const appointmentData = {
      scheduleId: schedule?.id,
      hospitalId: appointmentStore.selectedHospital?.id,  // ✅ 添加 hospitalId
      departmentId: appointmentStore.selectedDepartment?.id,  // ✅ 添加 departmentId
      slotId: schedule?.id + '_slot_001',  // 时段ID(实际应该从选择的时段获取)
      patientId: selectedPatient.value.id,
      symptoms: ''  // 可选的症状描述
    }
    
    const result = await createAppointment(appointmentData)
    
    // 保存预约记录到本地(用于"我的预约"页面显示)
    const appointmentRecord = {
      id: result.id,
      orderNo: result.orderNo,
      hospitalId: appointmentStore.selectedHospital?.id,
      hospitalName: appointmentInfo.hospital,
      departmentId: appointmentStore.selectedDepartment?.id,
      departmentName: appointmentInfo.department,
      doctorName: schedule?.doctorName || '医生',
      doctorTitle: schedule?.doctorTitle || '',
      scheduleId: schedule?.id,
      appointmentDate: schedule?.date,
      appointmentTime: `${schedule?.period} ${schedule?.startTime}-${schedule?.endTime}`,
      patientName: selectedPatient.value.name,
      patientId: selectedPatient.value.id,
      queueNumber: result.queueNumber,
      price: appointmentInfo.price,
      status: 'pending',
      paymentStatus: 'pending',  // 支付状态:待支付
      canCancel: true,
      canReschedule: true,
      createdAt: new Date().toISOString()
    }
    
    // 保存到本地存储
    const existingAppointments = uni.getStorageSync('myAppointments') || []
    existingAppointments.unshift(appointmentRecord)
    uni.setStorageSync('myAppointments', existingAppointments)
    
    // 保存为最后一个预约(用于 success 页面显示)
    uni.setStorageSync('lastAppointment', appointmentRecord)
    
    // ✅ 创建支付订单并保存到 Store(但不立即跳转支付页面)
    const paymentOrder = await createPaymentOrder({
      appointmentId: result.id,
      orderNo: result.orderNo,
      amount: appointmentInfo.price,
      description: `${appointmentInfo.hospital}-${appointmentInfo.department}`,
      patientName: selectedPatient.value.name
    })
    
    // ✅ 保存支付订单到 Store
    paymentStore.createOrder(paymentOrder)
    
    uni.hideLoading()
    
    // 清空预约流程数据
    appointmentStore.clearAppointmentData()
    
    // ✅ 先跳转到预约成功页面,在那里用户可以选择立即支付
    uni.navigateTo({
      url: '/pages/home/appointment/success'
    })
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '预约失败,请重试',
      icon: 'none'
    })
  }
}

onMounted(() => {
  // 从 Store 获取之前选择的信息
  const hospital = appointmentStore.selectedHospital
  const department = appointmentStore.selectedDepartment
  const schedule = appointmentStore.selectedSchedule
  
  // 如果信息不完整，直接显示（不做处理）
  // 正常流程下，Store 一定有数据
  
  // 填充预约信息
  appointmentInfo.hospital = hospital?.name || ''
  appointmentInfo.department = department?.name || ''
  appointmentInfo.appointmentType = (schedule?.appointmentType || '') + '门诊'
  appointmentInfo.dateTime = schedule ? `${schedule.date} ${schedule.period} ${schedule.period === '上午' ? '08:00~12:00' : '14:00~18:00'}` : ''
  appointmentInfo.price = schedule?.price || 0
  
  // ✨ 加载就诊人列表（自动选择默认就诊人）
  loadPatients()
})
</script>

<style lang="scss" scoped>
.confirm-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding-bottom: 160rpx;
}

/* 页面标题 */
.page-header {
  background: white;
  padding: $spacing-lg $spacing-md;
  text-align: center;
  border-bottom: 1rpx solid $color-slate-200;
}

.page-title {
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

/* 就诊人选择 */
.patient-section {
  background: white;
  margin-top: $spacing-md;
  padding: $spacing-md;
}

.section-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
}

.section-icon {
  font-size: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.patient-selector {
  background: $color-slate-50;
  border: 1rpx solid $color-slate-200;
  border-radius: $border-radius-base;
  padding: $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80rpx;
}

.patient-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.patient-main {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.patient-name {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.patient-relation {
  font-size: 22rpx;
  color: $hospital-primary;
  background: $hospital-gradient-start;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.patient-phone {
  font-size: 24rpx;
  color: $color-slate-600;
}

.patient-placeholder {
  font-size: 26rpx;
  color: $color-slate-400;
}

.selector-arrow {
  font-size: 32rpx;
  color: $color-slate-400;
  margin-left: $spacing-sm;
}

/* 预约信息 */
.appointment-info {
  background: white;
  margin-top: $spacing-md;
  padding: $spacing-md;
}

.info-row {
  padding: $spacing-md 0;
  border-bottom: 1rpx solid $color-slate-100;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.clickable {
  cursor: pointer;
}

.info-label {
  font-size: 26rpx;
  color: $color-slate-600;
  width: 160rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: $color-slate-900;
  text-align: right;
}

.info-value.primary {
  color: #dc2626;
  font-weight: $font-medium;
}

.info-value-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.info-price {
  font-size: 26rpx;
  color: #dc2626;
  font-weight: $font-semibold;
}

.change-hint {
  font-size: 20rpx;
  color: $color-slate-400;
}

/* 重要提示 */
.important-tips {
  background: white;
  margin-top: $spacing-md;
  padding: $spacing-md;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
}

.tips-icon {
  font-size: 28rpx;
  color: #dc2626;
}

.tips-title {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.tip-item {
  font-size: 24rpx;
  color: $color-slate-600;
  line-height: 1.8;
  text-align: justify;
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: $spacing-md;
  border-top: 1rpx solid $color-slate-200;
  z-index: 100;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: $gradient-primary;
  border: none;
  border-radius: $border-radius-base;
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: white;
  box-shadow: $box-shadow-button;
  transition: all 0.2s ease;
}

.submit-btn:active {
  transform: translateY(-2rpx);
  box-shadow: $box-shadow-button-hover;
}

.submit-btn[disabled] {
  background: $color-slate-300;
  color: $color-slate-500;
  box-shadow: none;
  transform: none;
}
</style>
