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
        <text class="patient-text" v-if="selectedPatient">{{ selectedPatient.name }}</text>
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

const appointmentStore = useAppointmentStore()
const selectedPatient = ref(null)

// 预约信息汇总
const appointmentInfo = reactive({
  hospital: '',
  department: '',
  appointmentType: '',
  dateTime: '',
  price: 0
})

// 模拟就诊人列表
const patients = ref([
  {
    id: 1,
    name: '周锦泽',
    idCard: '110101199001011234',
    phone: '13800138000'
  },
  {
    id: 2,
    name: '张三',
    idCard: '110101199002022345',
    phone: '13800138001'
  }
])

// 选择就诊人
const selectPatient = () => {
  const patientNames = patients.value.map(p => p.name)
  
  uni.showActionSheet({
    itemList: patientNames,
    success: (res) => {
      selectedPatient.value = patients.value[res.tapIndex]
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
    // 模拟API调用 - 按照接口文档格式
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟后端返回的数据（按照API文档格式）
    const mockResponse = {
      code: 0,
      message: '预约成功',
      data: {
        id: 'appointment_' + Date.now(),
        orderNo: '2024' + String(Date.now()).slice(-8),
        queueNumber: '15',
        needPay: true,
        payAmount: appointmentInfo.price
      }
    }
    
    uni.hideLoading()
    
    // 保存预约记录（实际项目中由后端返回）
    const appointmentRecord = {
      id: mockResponse.data.id,
      orderNo: mockResponse.data.orderNo,
      hospitalName: appointmentInfo.hospital,
      departmentName: appointmentInfo.department,
      doctorName: appointmentStore.selectedSchedule?.doctorName || '医生',
      doctorTitle: appointmentInfo.appointmentType,
      appointmentDate: appointmentStore.selectedSchedule?.date,
      appointmentTime: appointmentInfo.dateTime,
      patientName: selectedPatient.value.name,
      queueNumber: mockResponse.data.queueNumber,
      price: appointmentInfo.price,
      status: 'pending',
      canCancel: true,
      canReschedule: true,
      createdAt: new Date().toISOString()
    }
    
    // 保存到本地（模拟）
    const existingAppointments = uni.getStorageSync('myAppointments') || []
    existingAppointments.unshift(appointmentRecord)
    uni.setStorageSync('myAppointments', existingAppointments)
    
    // 清空预约流程数据
    appointmentStore.clearAppointmentData()
    
    // 跳转到预约成功页面（待支付）
    uni.navigateTo({
      url: '/pages/home/appointment/success'
    })
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '预约失败，请重试',
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
  
  // 自动选择第一个就诊人（如果有）
  if (patients.value.length > 0) {
    selectedPatient.value = patients.value[0]
  }
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
}

.patient-text {
  font-size: 26rpx;
  color: $color-slate-900;
}

.patient-placeholder {
  font-size: 26rpx;
  color: $color-slate-400;
}

.selector-arrow {
  font-size: 32rpx;
  color: $color-slate-400;
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
