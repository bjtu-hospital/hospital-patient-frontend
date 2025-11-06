<template>
  <view class="my-container">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="user-info">
        <view class="user-avatar">
          <text class="avatar-text">张</text>
        </view>
        <text class="user-greeting">张三，您好</text>
      </view>
      <view class="account-settings" @tap="goToSettings">
        <text class="settings-text">账号设置</text>
      </view>
    </view>

    <!-- 就诊人管理 -->
    <view class="patient-management" @tap="goToPatients">
      <text class="management-text">就诊人管理</text>
    </view>

    <!-- 我的预约 -->
    <view class="appointment-section">
      <text class="section-title">我的预约</text>
      <view class="appointment-item" @tap="goToAppointments">
        <text class="appointment-text">查看我的预约记录</text>
      </view>
    </view>

    <!-- 健康档案 -->
    <view class="health-section">
      <text class="section-title">健康管理</text>
      <view class="health-item" @tap="goToHealth">
        <text class="health-text">健康档案</text>
      </view>
      <view class="health-item" @tap="goToReports">
        <text class="health-text">检验报告</text>
      </view>
    </view>

    <!-- 其他功能 -->
    <view class="other-section">
      <text class="section-title">其他功能</text>
      <view class="other-item" @tap="goToFeedback">
        <text class="other-text">意见反馈</text>
      </view>
      <view class="other-item" @tap="goToDoctors">
        <text class="other-text">科室专家</text>
      </view>
      <view class="other-item" @tap="goToAI">
        <text class="other-text">AI助手</text>
      </view>
    </view>

    <!-- 底部退出 -->
    <view class="logout-section">
      <button class="logout-btn" @tap="logout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script setup>
import { reactive, onMounted } from 'vue'

// 用户信息
const userInfo = reactive({
  name: '张三',
  studentId: '23301087'
})

// 页面跳转函数
const goToPatients = () => {
  uni.navigateTo({
    url: '/pages/profile/patients'
  })
}

const goToAppointments = () => {
  uni.navigateTo({
    url: '/pages/profile/appointments'
  })
}

const goToHealth = () => {
  uni.navigateTo({
    url: '/pages/profile/health'
  })
}

const goToReports = () => {
  uni.navigateTo({
    url: '/pages/features/reports'
  })
}

const goToFeedback = () => {
  uni.navigateTo({
    url: '/pages/features/feedback'
  })
}

const goToDoctors = () => {
  uni.navigateTo({
    url: '/pages/features/doctors'
  })
}

const goToAI = () => {
  uni.navigateTo({
    url: '/pages/features/ai-assistant'
  })
}

const goToSettings = () => {
  uni.showToast({
    title: '设置功能开发中',
    icon: 'none'
  })
}

const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
          uni.reLaunch({
            url: '/pages/auth/login'
          })
      }
    }
  })
}

onMounted(() => {
  // 获取登录用户信息
  const savedUserInfo = uni.getStorageSync('userInfo')
  if (savedUserInfo) {
    Object.assign(userInfo, savedUserInfo)
  }
})
</script>

<style lang="scss" scoped>
.my-container {
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 用户信息头部 */
.user-header {
  background: linear-gradient(135deg, #00BFCC 0%, #4DD0DB 100%);
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.avatar-text {
  font-size: 40rpx;
  font-weight: 600;
  color: white;
}

.user-greeting {
  font-size: 32rpx;
  font-weight: 500;
}

.account-settings {
  background: rgba(255, 255, 255, 0.2);
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
}

.settings-text {
  font-size: 24rpx;
  color: white;
}

/* 功能区域 */
.patient-management,
.appointment-section,
.health-section,
.other-section {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
}

.patient-management {
  text-align: center;
  background: #f0fdff;
  border-color: #00BFCC;
}

.management-text {
  font-size: 28rpx;
  color: #00BFCC;
  font-weight: 600;
}

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 16rpx;
  display: block;
}

.appointment-item,
.health-item,
.other-item {
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  border: 1rpx solid #f1f5f9;
}

.appointment-text,
.health-text,
.other-text {
  font-size: 24rpx;
  color: #374151;
}

/* 退出登录 */
.logout-section {
  margin: 32rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: white;
  border: 2rpx solid #ef4444;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #ef4444;
}

.logout-btn:active {
  background: #fef2f2;
}
</style>