<template>
  <view class="register-container">
    <!-- 背景渐变 -->
    <view class="bg-gradient"></view>
    
    <!-- 主要内容 -->
    <view class="register-content">
      <!-- 医院标识区域 -->
      <view class="hospital-header">
        <view class="hospital-icon">
          <uni-icons type="home-filled" size="28" color="white"></uni-icons>
        </view>
        <view class="hospital-name">北京交通大学校医院</view>
        <view class="hospital-subtitle">新用户注册</view>
      </view>

      <!-- 注册卡片 -->
      <view class="register-card">
        <view class="card-header">
          <text class="card-title">创建账户</text>
          <text class="card-subtitle">请填写您的基本信息</text>
        </view>

        <!-- 表单区域 -->
        <view class="form-section">
          <!-- 手机号输入 -->
          <view class="input-group">
            <view class="input-label">手机号 *</view>
            <view class="input-wrapper">
              <uni-icons type="phone" size="18" color="#00D5D9" class="input-icon"></uni-icons>
              <input 
                class="input-field" 
                type="number" 
                placeholder="请输入手机号"
                v-model="formData.phonenumber"
                placeholder-class="input-placeholder"
                maxlength="11"
              />
            </view>
          </view>

          <!-- 姓名输入 -->
          <view class="input-group">
            <view class="input-label">姓名 *</view>
            <view class="input-wrapper">
              <uni-icons type="person" size="18" color="#00D5D9" class="input-icon"></uni-icons>
              <input 
                class="input-field" 
                type="text" 
                placeholder="请输入您的姓名"
                v-model="formData.name"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <!-- 密码输入 -->
          <view class="input-group">
            <view class="input-label">设置密码 *</view>
            <view class="input-wrapper">
              <uni-icons type="locked" size="18" color="#00D5D9" class="input-icon"></uni-icons>
              <input 
                class="input-field" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="至少6位密码"
                v-model="formData.password"
                placeholder-class="input-placeholder"
              />
              <view 
                class="password-toggle" 
                @tap="togglePassword"
              >
                <uni-icons v-if="showPassword" type="eye-slash" size="18" color="#999"></uni-icons>
                <uni-icons v-else type="eye" size="18" color="#999"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 确认密码输入 -->
          <view class="input-group">
            <view class="input-label">确认密码 *</view>
            <view class="input-wrapper">
              <uni-icons type="locked" size="18" color="#00D5D9" class="input-icon"></uni-icons>
              <input 
                class="input-field" 
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                v-model="formData.confirmPassword"
                placeholder-class="input-placeholder"
              />
              <view 
                class="password-toggle" 
                @tap="toggleConfirmPassword"
              >
                <uni-icons v-if="showConfirmPassword" type="eye-slash" size="18" color="#999"></uni-icons>
                <uni-icons v-else type="eye" size="18" color="#999"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 错误提示 -->
          <view v-if="errorMessage" class="error-message">
            <text class="error-text">{{ errorMessage }}</text>
          </view>

          <!-- 用户协议 -->
          <view class="agreement-section">
            <view class="checkbox-wrapper" @tap="toggleAgreement">
              <text class="checkbox" :class="{ 'checked': agreedToTerms }">
                {{ agreedToTerms ? '✅' : '☐' }}
              </text>
              <text class="agreement-text">
                我已阅读并同意
                <text class="agreement-link" @tap.stop="showAgreement">《用户协议》</text>
                和
                <text class="agreement-link" @tap.stop="showPrivacy">《隐私政策》</text>
              </text>
            </view>
          </view>

          <!-- 注册按钮 -->
          <button 
            class="register-button" 
            :class="{ 'loading': isLoading }"
            @tap="handleRegister"
            :disabled="isLoading || !agreedToTerms"
          >
            {{ isLoading ? '注册中...' : '立即注册' }}
          </button>
        </view>

        <!-- 登录入口 -->
        <view class="login-section">
          <view class="divider">
            <view class="divider-line"></view>
            <text class="divider-text">已有账号？</text>
            <view class="divider-line"></view>
          </view>
          <button class="login-button" @tap="goToLogin">
            立即登录
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { register } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 响应式数据
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreedToTerms = ref(false)
const errorMessage = ref('')

const formData = reactive({
  phonenumber: '',
  name: '',
  password: '',
  confirmPassword: ''
})

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 切换协议同意状态
const toggleAgreement = () => {
  agreedToTerms.value = !agreedToTerms.value
}

// 表单验证
const validateForm = () => {
  // 清除之前的错误信息
  errorMessage.value = ''
  
  // 手机号验证（宽松模式）
  if (!formData.phonenumber.trim()) {
    errorMessage.value = '请输入手机号'
    return false
  }
  
  // 姓名验证
  if (!formData.name.trim()) {
    errorMessage.value = '请输入姓名'
    return false
  }
  
  // 密码验证（宽松模式）
  if (!formData.password.trim()) {
    errorMessage.value = '请设置密码'
    return false
  }
  
  // 确认密码验证
  if (!formData.confirmPassword.trim()) {
    errorMessage.value = '请确认密码'
    return false
  }
  
  if (formData.password !== formData.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return false
  }
  
  // 协议验证
  if (!agreedToTerms.value) {
    errorMessage.value = '请先同意用户协议和隐私政策'
    return false
  }
  
  return true
}

// 注册处理
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 调用注册接口
    const token = await register({
      phonenumber: formData.phonenumber,
      password: formData.password,
      name: formData.name
    })
    
    // 保存token
    uni.setStorageSync('token', token)
    
    // 立即获取用户角色信息
    try {
      const userInfo = await userStore.checkAuth()
      console.log('用户角色:', userInfo.role)
    } catch (error) {
      console.warn('获取用户信息失败，但不影响注册:', error)
    }
    
    uni.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 1500
    })
    
    // 跳转到首页
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/home/index'
      })
    }, 1500)
    
  } catch (error) {
    // 错误处理（400错误如手机号重复已在拦截器处理，这里处理其他情况）
    if (error.code === 400) {
      errorMessage.value = error.message || '注册失败，请检查输入信息'
    } else {
      errorMessage.value = error.message || '注册失败，请稍后重试'
    }
  } finally {
    isLoading.value = false
  }
}

// 显示用户协议
const showAgreement = () => {
  uni.showModal({
    title: '用户协议',
    content: '这里是用户协议的内容...',
    showCancel: false,
    confirmText: '知道了'
  })
}

// 显示隐私政策
const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '这里是隐私政策的内容...',
    showCancel: false,
    confirmText: '知道了'
  })
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  position: relative;
  padding: 40rpx;
}

/* 背景渐变 */
.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, $hospital-gradient-start 0%, $hospital-gradient-end 100%);
  z-index: 1;
}

/* 主要内容 */
.register-content {
  position: relative;
  z-index: 2;
  padding-top: 40rpx;
}

/* 医院标识区域 */
.hospital-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.hospital-icon {
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 24rpx;
  background: $hospital-primary;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 25rpx rgba(0, 213, 217, 0.3);
}

.icon-hospital {
  font-size: 50rpx;
  color: white;
}

.hospital-name {
  font-size: 36rpx;
  font-weight: 600;
  color: $hospital-primary-dark;
  margin-bottom: 12rpx;
}

.hospital-subtitle {
  font-size: 26rpx;
  color: #666;
}

/* 注册卡片 */
.register-card {
  background: $hospital-card-bg;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid #E5F4F5;
  margin-bottom: 40rpx;
}

.card-header {
  text-align: center;
  margin-bottom: 48rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.card-subtitle {
  font-size: 26rpx;
  color: #666;
}

/* 表单区域 */
.form-section {
  margin-bottom: 32rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #F8FDFD;
  border: 2rpx solid #E5F4F5;
  border-radius: 12rpx;
  padding: 0 32rpx;
  height: 88rpx;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: $hospital-primary;
  background: white;
  box-shadow: 0 0 0 6rpx rgba(0, 213, 217, 0.1);
}

.input-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: $hospital-primary;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

.input-placeholder {
  color: #999;
}

.password-toggle {
  font-size: 28rpx;
  color: #999;
  margin-left: 16rpx;
}

/* 错误提示 */
.error-message {
  background: #FFF5F5;
  border: 1rpx solid #FEB2B2;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.error-text {
  font-size: 24rpx;
  color: #E53E3E;
}

/* 用户协议 */
.agreement-section {
  margin-bottom: 32rpx;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
}

.checkbox {
  font-size: 32rpx;
  margin-right: 16rpx;
  color: $hospital-primary;
  line-height: 1.2;
}

.checkbox.checked {
  color: $hospital-primary;
}

.agreement-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
  flex: 1;
}

.agreement-link {
  color: $hospital-primary;
  text-decoration: underline;
}

/* 注册按钮 */
.register-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  border: none;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: white;
  box-shadow: 0 8rpx 25rpx rgba(0, 213, 217, 0.3);
  transition: all 0.3s ease;
}

.register-button:active {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 35rpx rgba(0, 213, 217, 0.4);
}

/* Loading动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.register-button.loading {
  animation: pulse 1.5s ease-in-out infinite;
  transform: none;
}

.register-button[disabled] {
  opacity: 0.5;
  transform: none;
  background: #CCC;
  box-shadow: none;
}

/* 登录区域 */
.login-section {
  border-top: 1rpx solid #E5F4F5;
  padding-top: 32rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #E5F4F5;
}

.divider-text {
  font-size: 24rpx;
  color: #999;
  margin: 0 24rpx;
}

.login-button {
  width: 100%;
  height: 80rpx;
  background: white;
  border: 2rpx solid $hospital-primary;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: $hospital-primary;
  transition: all 0.3s ease;
}

.login-button:active {
  background: #F0FDFF;
  transform: translateY(-1rpx);
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .register-container {
    padding: 20rpx;
  }
  
  .register-content {
    padding-top: 20rpx;
  }
  
  .hospital-header {
    margin-bottom: 40rpx;
  }
  
  .register-card {
    padding: 32rpx 24rpx;
  }
}
</style>