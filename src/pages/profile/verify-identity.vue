<template>
  <view class="verify-container">
    <!-- 顶部说明 -->
    <view class="header-info">
      <view class="info-icon">🎓</view>
      <text class="info-title">校内身份认证</text>
      <text class="info-desc">认证后可享受学生/教职工专属医疗服务</text>
    </view>

    <!-- 认证表单 -->
    <view class="verify-form">
      <!-- 未认证时显示输入表单 -->
      <template v-if="!isVerified">
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">学号/工号</text>
            <text class="label-required">*</text>
          </view>
          <input 
            class="item-input"
            v-model="formData.identifier"
            placeholder="请输入学号或工号"
          />
        </view>

        <view class="form-item">
          <view class="item-label">
            <text class="label-text">校园系统密码</text>
            <text class="label-required">*</text>
          </view>
          <input 
            class="item-input"
            v-model="formData.password"
            type="password"
            placeholder="请输入校园系统密码"
          />
        </view>

        <!-- 提示信息 -->
        <view class="tips-box">
          <text class="tips-icon">ℹ️</text>
          <view class="tips-content">
            <text class="tips-text">• 请使用您的教务系统/统一身份认证账号密码</text>
            <text class="tips-text">• 密码仅用于身份验证，不会被存储</text>
            <text class="tips-text">• 认证成功后可享受校内优惠政策</text>
          </view>
        </view>
      </template>

      <!-- 已认证时显示认证信息 -->
      <template v-else>
        <view class="verified-info-card">
          <view class="verified-header">
            <view class="verified-icon">✅</view>
            <text class="verified-title">认证成功</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">学号/工号</text>
            <text class="info-value">{{ verifiedInfo.identifier }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">角色类型</text>
            <text class="info-value">{{ verifiedInfo.roleType }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">姓名</text>
            <text class="info-value">{{ verifiedInfo.userName }}</text>
          </view>
          
          <view class="verified-tips">
            <text class="tips-text">🎉 您已享受校内优惠政策</text>
          </view>
        </view>
      </template>

      <!-- 提交按钮 -->
      <button 
        class="submit-btn"
        :class="{ 'disabled': isVerified || loading }"
        @tap="handleSubmit"
        :disabled="isVerified || loading"
      >
        <text v-if="loading">认证中...</text>
        <text v-else-if="isVerified">已完成认证</text>
        <text v-else>立即认证</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { verifyIdentity, getUserInfo } from '@/api/user'

// 表单数据
const formData = ref({
  identifier: '',
  password: ''
})

// 是否已认证
const isVerified = ref(false)

// 加载状态
const loading = ref(false)

// 已认证用户信息
const verifiedInfo = ref({
  identifier: '',
  roleType: '',
  userName: '',
  userId: ''
})

// 加载用户信息，检查是否已认证
const loadUserInfo = async () => {
  try {
    const userInfo = await getUserInfo()
    
    console.log('🔍 认证页面-用户信息:', userInfo)
    
    // 如果用户已有 identifier 且已验证，则显示已认证状态
    if (userInfo.identifier && userInfo.verified) {
      formData.value.identifier = userInfo.identifier
      isVerified.value = true
      
      // 映射角色类型
      const roleTypeMap = {
        '学生': '学生',
        'student': '学生',
        '教师': '教师',
        'teacher': '教师',
        '职工': '职工',
        'staff': '职工'
      }
      
      // 填充已认证用户信息
      verifiedInfo.value = {
        identifier: userInfo.identifier,
        roleType: roleTypeMap[userInfo.patientType] || userInfo.patientType || '未知',
        userName: userInfo.realName || '未填写',
        userId: userInfo.id || '-'
      }
      
      console.log('✅ 用户已认证', verifiedInfo.value)
    } else {
      console.log('❌ 用户未认证', {
        identifier: userInfo.identifier,
        verified: userInfo.verified
      })
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 提交认证
const handleSubmit = async () => {
  // 验证表单
  if (!formData.value.identifier) {
    uni.showToast({
      title: '请输入学号/工号',
      icon: 'none'
    })
    return
  }

  if (!formData.value.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  // 确认提示
  uni.showModal({
    title: '确认认证',
    content: '请确认输入的学号/工号和密码正确无误',
    success: async (res) => {
      if (res.confirm) {
        await submitVerify()
      }
    }
  })
}

// 执行认证
const submitVerify = async () => {
  try {
    loading.value = true
    
    await verifyIdentity({
      identifier: formData.value.identifier,
      password: formData.value.password
    })
    
    // 认证成功，重新加载用户信息
    console.log('认证成功，重新加载用户信息')
    await loadUserInfo()
    
    isVerified.value = true
    formData.value.password = '' // 清空密码
    
    uni.showToast({
      title: '认证成功',
      icon: 'success',
      duration: 2000
    })
    
    // 延迟返回
    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
    
  } catch (error) {
    console.error('认证失败:', error)
    
    // 解析错误信息
    let errorMessage = '认证失败，请检查学号和密码'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.verify-container {
  min-height: 100vh;
  background: linear-gradient(180deg, $hospital-gradient-start 0%, $hospital-gradient-end 100%);
  padding: 40rpx 32rpx;
}

/* 头部信息 */
.header-info {
  background: white;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 32rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 213, 217, 0.1);
}

.info-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.info-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.info-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 表单 */
.verify-form {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 213, 217, 0.1);
}

.form-item {
  margin-bottom: 32rpx;
}

.item-label {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.label-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.label-required {
  color: #ff3b30;
  margin-left: 4rpx;
  font-size: 28rpx;
}

.item-input {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  height: 88rpx;
  background: #F8F8F8;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
}

.item-input[disabled] {
  color: #999;
  background: #F0F0F0;
}

/* 提示框 */
.tips-box {
  display: flex;
  background: #FFF9E6;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.tips-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.tips-content {
  flex: 1;
}

.tips-text {
  display: block;
  font-size: 24rpx;
  color: #856404;
  line-height: 1.8;
  margin-bottom: 8rpx;
}

.tips-text:last-child {
  margin-bottom: 0;
}

/* 已认证信息卡片 */
.verified-info-card {
  background: linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
}

.verified-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(76, 175, 80, 0.2);
}

.verified-icon {
  font-size: 48rpx;
  margin-right: 12rpx;
}

.verified-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2E7D32;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 16rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.info-item:last-of-type {
  margin-bottom: 24rpx;
}

.info-label {
  font-size: 26rpx;
  color: #555;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.verified-tips {
  text-align: center;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12rpx;
}

.verified-tips .tips-text {
  font-size: 24rpx;
  color: #4CAF50;
  font-weight: 500;
}

/* 认证状态 */
.status-box {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.status-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.status-content {
  flex: 1;
}

.status-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2E7D32;
  margin-bottom: 8rpx;
}

.status-desc {
  display: block;
  font-size: 24rpx;
  color: #558B2F;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-accent 100%);
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(0, 213, 217, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 213, 217, 0.2);
}

.submit-btn.disabled {
  background: #E0E0E0;
  color: #999;
  box-shadow: none;
}
</style>
