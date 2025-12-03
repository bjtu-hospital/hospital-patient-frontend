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
          <text class="card-subtitle">{{ stepSubtitle }}</text>
        </view>

        <!-- 步骤指示器 -->
        <view class="step-indicator">
          <view class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <view class="step-dot">1</view>
            <text class="step-text">验证手机</text>
          </view>
          <view class="step-line" :class="{ active: currentStep > 1 }"></view>
          <view class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <view class="step-dot">2</view>
            <text class="step-text">填写信息</text>
          </view>
          <view class="step-line" :class="{ active: currentStep > 2 }"></view>
          <view class="step" :class="{ active: currentStep >= 3 }">
            <view class="step-dot">3</view>
            <text class="step-text">完成注册</text>
          </view>
        </view>

        <!-- 表单区域 -->
        <view class="form-section">
          <!-- 步骤1：手机验证 -->
          <view v-if="currentStep === 1" class="step-content">
            <!-- 手机号输入 -->
            <view class="input-group">
              <view class="input-label">手机号</view>
              <view class="input-wrapper">
                <uni-icons type="phone" size="18" color="#00D5D9" class="input-icon"></uni-icons>
                <input 
                  class="input-field" 
                  type="number" 
                  placeholder="请输入手机号"
                  v-model="formData.phonenumber"
                  placeholder-class="input-placeholder"
                  maxlength="11"
                  :disabled="isCodeSent"
                />
              </view>
            </view>

            <!-- 验证码输入 -->
            <view class="input-group" v-if="isCodeSent">
              <view class="input-label">验证码</view>
              <view class="input-wrapper code-wrapper">
                <uni-icons type="auth" size="18" color="#00D5D9" class="input-icon"></uni-icons>
                <input 
                  class="input-field" 
                  type="number" 
                  placeholder="请输入6位验证码"
                  v-model="formData.verifyCode"
                  placeholder-class="input-placeholder"
                  maxlength="6"
                />
                <view class="code-btn" :class="{ disabled: countdown > 0 }" @tap="sendCode">
                  <text>{{ countdown > 0 ? `${countdown}s后重发` : '重新发送' }}</text>
                </view>
              </view>
            </view>

            <!-- 发送验证码按钮 -->
            <button 
              v-if="!isCodeSent"
              class="primary-button" 
              :class="{ 'loading': isSendingCode }"
              @tap="sendCode"
              :disabled="isSendingCode"
            >
              {{ isSendingCode ? '发送中...' : '获取验证码' }}
            </button>

            <!-- 验证按钮 -->
            <button 
              v-else
              class="primary-button" 
              :class="{ 'loading': isVerifying }"
              @tap="verifyCode"
              :disabled="isVerifying || formData.verifyCode.length !== 6"
            >
              {{ isVerifying ? '验证中...' : '验证并继续' }}
            </button>
          </view>

          <!-- 步骤2：填写信息 -->
          <view v-if="currentStep === 2" class="step-content">
            <!-- 已验证手机号显示 -->
            <view class="verified-phone">
              <uni-icons type="checkbox-filled" size="16" color="#10B981"></uni-icons>
              <text class="phone-text">{{ maskedPhone }}</text>
              <text class="verified-tag">已验证</text>
            </view>

            <!-- 姓名输入 -->
            <view class="input-group">
              <view class="input-label">姓名 *</view>
              <view class="input-wrapper">
                <uni-icons type="person" size="18" color="#00D5D9" class="input-icon"></uni-icons>
                <input 
                  class="input-field" 
                  type="text" 
                  placeholder="请输入您的真实姓名"
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
                <view class="password-toggle" @tap="togglePassword">
                  <uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="18" color="#999"></uni-icons>
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
                <view class="password-toggle" @tap="toggleConfirmPassword">
                  <uni-icons :type="showConfirmPassword ? 'eye-slash' : 'eye'" size="18" color="#999"></uni-icons>
                </view>
              </view>
            </view>

            <!-- 学号/工号（可选） -->
            <view class="input-group">
              <view class="input-label">学号/工号 <text class="optional-tag">选填</text></view>
              <view class="input-wrapper">
                <uni-icons type="wallet" size="18" color="#00D5D9" class="input-icon"></uni-icons>
                <input 
                  class="input-field" 
                  type="text" 
                  placeholder="请输入学号或工号"
                  v-model="formData.identifier"
                  placeholder-class="input-placeholder"
                />
              </view>
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
              class="primary-button" 
              :class="{ 'loading': isLoading }"
              @tap="handleRegister"
              :disabled="isLoading || !agreedToTerms"
            >
              {{ isLoading ? '注册中...' : '立即注册' }}
            </button>

            <!-- 返回上一步 -->
            <view class="back-step" @tap="currentStep = 1">
              <uni-icons type="left" size="14" color="#666"></uni-icons>
              <text>返回修改手机号</text>
            </view>
          </view>

          <!-- 错误提示 -->
          <view v-if="errorMessage" class="error-message">
            <text class="error-text">{{ errorMessage }}</text>
          </view>
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
import { ref, reactive, computed } from 'vue'
import { register, sendSmsCode, verifySmsCode } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 步骤控制
const currentStep = ref(1)

// 响应式数据
const isLoading = ref(false)
const isSendingCode = ref(false)
const isVerifying = ref(false)
const isCodeSent = ref(false)
const countdown = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreedToTerms = ref(false)
const errorMessage = ref('')

const formData = reactive({
  phonenumber: '',
  verifyCode: '',
  name: '',
  password: '',
  confirmPassword: '',
  identifier: ''
})

// 计算属性
const stepSubtitle = computed(() => {
  const subtitles = {
    1: '第一步：验证您的手机号',
    2: '第二步：填写您的基本信息'
  }
  return subtitles[currentStep.value] || ''
})

const maskedPhone = computed(() => {
  const phone = formData.phonenumber
  if (phone.length === 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7)
  }
  return phone
})

// 发送验证码
const sendCode = async () => {
  // 验证手机号
  if (!formData.phonenumber.trim()) {
    errorMessage.value = '请输入手机号'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(formData.phonenumber)) {
    errorMessage.value = '请输入正确的手机号'
    return
  }
  
  if (countdown.value > 0) return
  
  errorMessage.value = ''
  isSendingCode.value = true
  
  try {
    await sendSmsCode(formData.phonenumber)
    
    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    })
    
    isCodeSent.value = true
    startCountdown()
    
  } catch (error) {
    console.error('发送验证码失败:', error)
    
    // 解析错误信息
    let errorMsg = '发送失败，请稍后重试'
    if (error.message) {
      try {
        if (typeof error.message === 'string' && error.message.startsWith('{')) {
          const parsedError = JSON.parse(error.message)
          errorMsg = parsedError.msg || parsedError.error || error.message
        } else if (typeof error.message === 'object' && error.message.msg) {
          errorMsg = error.message.msg
        } else {
          errorMsg = error.message
        }
      } catch (parseError) {
        errorMsg = error.message
      }
    }
    
    errorMessage.value = errorMsg
  } finally {
    isSendingCode.value = false
  }
}

// 倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 验证验证码
const verifyCode = async () => {
  if (formData.verifyCode.length !== 6) {
    errorMessage.value = '请输入6位验证码'
    return
  }
  
  errorMessage.value = ''
  isVerifying.value = true
  
  try {
    await verifySmsCode(formData.phonenumber, formData.verifyCode)
    
    uni.showToast({
      title: '验证成功',
      icon: 'success'
    })
    
    // 进入下一步
    setTimeout(() => {
      currentStep.value = 2
    }, 500)
    
  } catch (error) {
    console.error('验证码校验失败:', error)
    
    // 解析错误信息
    let errorMsg = '验证码错误'
    if (error.message) {
      try {
        if (typeof error.message === 'string' && error.message.startsWith('{')) {
          const parsedError = JSON.parse(error.message)
          errorMsg = parsedError.msg || parsedError.error || error.message
        } else if (typeof error.message === 'object' && error.message.msg) {
          errorMsg = error.message.msg
        } else {
          errorMsg = error.message
        }
      } catch (parseError) {
        errorMsg = error.message
      }
    }
    
    errorMessage.value = errorMsg
  } finally {
    isVerifying.value = false
  }
}

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
  errorMessage.value = ''
  
  if (!formData.name.trim()) {
    errorMessage.value = '请输入姓名'
    return false
  }
  
  if (!formData.password.trim()) {
    errorMessage.value = '请设置密码'
    return false
  }
  
  if (formData.password.length < 6) {
    errorMessage.value = '密码至少6位'
    return false
  }
  
  if (!formData.confirmPassword.trim()) {
    errorMessage.value = '请确认密码'
    return false
  }
  
  if (formData.password !== formData.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return false
  }
  
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
    // 构建注册数据
    const registerData = {
      phonenumber: formData.phonenumber,
      password: formData.password,
      name: formData.name
    }
    
    // 可选字段
    if (formData.identifier.trim()) {
      registerData.identifier = formData.identifier.trim()
    }
    
    console.log('注册数据:', registerData)
    
    // 调用注册接口
    const token = await register(registerData)
    
    // 保存token
    uni.setStorageSync('token', token)
    
    // 立即获取用户角色信息
    try {
      await userStore.checkAuth()
    } catch (error) {
      console.warn('获取用户信息失败，但不影响注册:', error)
    }
    
    // 进入步骤3（成功）
    currentStep.value = 3
    
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
    console.error('注册失败:', error)
    
    // 解析错误信息
    let errorMsg = '注册失败，请稍后重试'
    
    if (error.message) {
      try {
        // 如果 message 是 JSON 字符串，尝试解析
        if (typeof error.message === 'string' && error.message.startsWith('{')) {
          const parsedError = JSON.parse(error.message)
          errorMsg = parsedError.msg || parsedError.error || error.message
        } else if (typeof error.message === 'object' && error.message.msg) {
          // 如果 message 已经是对象
          errorMsg = error.message.msg
        } else {
          // 直接使用 message
          errorMsg = error.message
        }
      } catch (parseError) {
        // 解析失败，使用原始 message
        errorMsg = error.message
      }
    }
    
    errorMessage.value = errorMsg
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
  margin-bottom: 40rpx;
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
  margin-bottom: 32rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.card-subtitle {
  font-size: 24rpx;
  color: #666;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step.completed .step-dot {
  background: #10B981;
  border-color: #10B981;
}

.step-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #E5E7EB;
  border: 3rpx solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #9CA3AF;
  margin-bottom: 8rpx;
  transition: all 0.3s ease;
}

.step.active .step-dot {
  background: $hospital-primary;
  border-color: $hospital-primary;
  color: white;
}

.step-text {
  font-size: 22rpx;
  color: #9CA3AF;
}

.step.active .step-text {
  color: $hospital-primary;
  font-weight: 500;
}

.step-line {
  width: 60rpx;
  height: 3rpx;
  background: #E5E7EB;
  margin: 0 12rpx 24rpx;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #10B981;
}

/* 表单区域 */
.form-section {
  margin-bottom: 32rpx;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-group {
  margin-bottom: 28rpx;
}

.input-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 12rpx;
}

.optional-tag {
  font-size: 22rpx;
  color: #9CA3AF;
  font-weight: 400;
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
  padding: 10rpx;
}

/* 验证码相关 */
.code-wrapper {
  padding-right: 16rpx;
}

.code-btn {
  padding: 12rpx 20rpx;
  background: $hospital-primary;
  border-radius: 8rpx;
  margin-left: 16rpx;
  white-space: nowrap;
}

.code-btn text {
  font-size: 24rpx;
  color: white;
}

.code-btn.disabled {
  background: #E5E7EB;
}

.code-btn.disabled text {
  color: #9CA3AF;
}

/* 已验证手机号 */
.verified-phone {
  display: flex;
  align-items: center;
  background: #ECFDF5;
  border: 1rpx solid #A7F3D0;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 28rpx;
}

.phone-text {
  font-size: 28rpx;
  color: #065F46;
  margin-left: 12rpx;
  flex: 1;
}

.verified-tag {
  font-size: 22rpx;
  color: #10B981;
  background: #D1FAE5;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

/* 按钮样式 */
.primary-button {
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
  margin-top: 16rpx;
}

.primary-button:active {
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 35rpx rgba(0, 213, 217, 0.4);
}

.primary-button.loading {
  animation: pulse 1.5s ease-in-out infinite;
  transform: none;
}

.primary-button[disabled] {
  opacity: 0.5;
  transform: none;
  background: #CCC;
  box-shadow: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 返回上一步 */
.back-step {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
  padding: 16rpx;
}

.back-step text {
  font-size: 26rpx;
  color: #666;
  margin-left: 8rpx;
}

/* 错误提示 */
.error-message {
  background: #FFF5F5;
  border: 1rpx solid #FEB2B2;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-top: 24rpx;
}

.error-text {
  font-size: 24rpx;
  color: #E53E3E;
}

/* 用户协议 */
.agreement-section {
  margin-bottom: 24rpx;
  margin-top: 8rpx;
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
    margin-bottom: 30rpx;
  }
  
  .register-card {
    padding: 32rpx 24rpx;
  }
}
</style>
