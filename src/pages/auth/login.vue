<template>
  <view class="login-container">
    <!-- 背景渐变 -->
    <view class="bg-gradient"></view>
    
    <!-- 主要内容 -->
    <view class="login-content">
      <!-- 医院标识区域 -->
      <view class="hospital-header">
        <view class="hospital-icon">
          <uni-icons type="home-filled" size="32" color="white"></uni-icons>
        </view>
        <view class="hospital-name">北京交通大学校医院</view>
        <view class="hospital-subtitle">预约挂号系统</view>
      </view>

      <!-- 登录卡片 -->
      <view class="login-card">
        <view class="card-header">
          <text class="card-title">患者登录</text>
          <text class="card-subtitle">请登录您的账户</text>
        </view>

        <!-- 表单区域 -->
        <view class="form-section">
          <!-- 用户名输入 -->
          <view class="input-group">
            <view class="input-label">学号/手机号</view>
            <view class="input-wrapper">
              <uni-icons type="person" size="20" color="#00D5D9" class="input-icon"></uni-icons>
              <input 
                class="input-field" 
                type="text" 
                placeholder="请输入学号或手机号"
                v-model="formData.identifier"
                placeholder-class="input-placeholder"
              />
            </view>
          </view>

          <!-- 密码输入 -->
          <view class="input-group">
            <view class="input-label">密码</view>
            <view class="input-wrapper">
              <uni-icons type="locked" size="20" color="#00D5D9" class="input-icon"></uni-icons>
              <input 
                class="input-field" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                v-model="formData.password"
                placeholder-class="input-placeholder"
              />
              <view 
                class="password-toggle" 
                @tap="togglePassword"
              >
                <uni-icons v-if="showPassword" type="eye-slash" size="20" color="#999"></uni-icons>
                <uni-icons v-else type="eye" size="20" color="#999"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 错误提示 -->
          <view v-if="errorMessage" class="error-message">
            <text class="error-text">{{ errorMessage }}</text>
          </view>

          <!-- 登录按钮 -->
          <button 
            class="login-button" 
            :class="{ 'loading': isLoading }"
            @tap="handleLogin"
            :disabled="isLoading"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </button>

          <!-- 忘记密码 -->
          <view class="forgot-password">
            <text class="forgot-link" @tap="handleForgotPassword">忘记密码？</text>
          </view>
        </view>

        <!-- 注册入口 -->
        <view class="register-section">
          <view class="divider">
            <view class="divider-line"></view>
            <text class="divider-text">还没有账号？</text>
            <view class="divider-line"></view>
          </view>
          <button class="register-button" @tap="goToRegister">
            立即注册
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 响应式数据
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const formData = reactive({
  identifier: '',
  password: ''
})

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 登录处理
const handleLogin = async () => {
  // 清除之前的错误信息
  errorMessage.value = ''
  
  // 表单验证
  if (!formData.identifier.trim()) {
    errorMessage.value = '请输入学号或手机号'
    return
  }
  
  if (!formData.password.trim()) {
    errorMessage.value = '请输入密码'
    return
  }

  if (formData.password.length < 6) {
    errorMessage.value = '密码至少6位'
    return
  }

  isLoading.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 演示账号验证（实际项目中应该调用API）
    const testAccounts = [
      { identifier: 'admin', password: '123456', name: '管理员' },
      { identifier: '23301087', password: '123456', name: '张三' },
      { identifier: '13800138000', password: '123456', name: '李四' }
    ]
    
    const validAccount = testAccounts.find(account => 
      account.identifier === formData.identifier && 
      account.password === formData.password
    )
    
    if (validAccount) {
      // 保存用户信息到本地存储
      uni.setStorageSync('userInfo', {
        name: validAccount.name,
        identifier: formData.identifier
      })
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 登录成功后跳转到首页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/home/index'
        })
      }, 1500)
    } else {
      errorMessage.value = '学号/手机号或密码错误'
    }
    
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 忘记密码
const handleForgotPassword = () => {
  uni.showModal({
    title: '找回密码',
    content: '请联系校医院前台或拨打咨询电话进行密码重置',
    showCancel: false,
    confirmText: '知道了'
  })
}

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/auth/register'
  })
}
</script>

<style lang="scss" scoped>
.login-container {
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
.login-content {
  position: relative;
  z-index: 2;
  padding-top: 60rpx;
}

/* 医院标识区域 */
.hospital-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.hospital-icon {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 30rpx;
  background: $hospital-primary;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 25rpx rgba(0, 213, 217, 0.3);
}

.icon-hospital {
  font-size: 64rpx;
  color: white;
}

.hospital-name {
  font-size: 44rpx;
  font-weight: 600;
  color: $hospital-primary-dark;
  margin-bottom: 16rpx;
}

.hospital-subtitle {
  font-size: 28rpx;
  color: #666;
}

/* 登录卡片 */
.login-card {
  background: $hospital-card-bg;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid #E5F4F5;
}

.card-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.card-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.card-subtitle {
  font-size: 28rpx;
  color: #666;
}

/* 表单区域 */
.form-section {
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #F8FDFD;
  border: 2rpx solid #E5F4F5;
  border-radius: 16rpx;
  padding: 0 40rpx;
  height: 96rpx;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: $hospital-primary;
  background: white;
  box-shadow: 0 0 0 6rpx rgba(0, 213, 217, 0.1);
}

.input-icon {
  margin-right: 20rpx;
}

.input-field {
  flex: 1;
  font-size: 32rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

.input-placeholder {
  color: #999;
}

.password-toggle {
  margin-left: 20rpx;
  display: flex;
  align-items: center;
}

/* 错误提示 */
.error-message {
  background: #FFF5F5;
  border: 1rpx solid #FEB2B2;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.error-text {
  font-size: 26rpx;
  color: #E53E3E;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  box-shadow: 0 8rpx 25rpx rgba(0, 213, 217, 0.3);
  margin-bottom: 32rpx;
  transition: all 0.3s ease;
}

.login-button:active {
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

.login-button.loading {
  animation: pulse 1.5s ease-in-out infinite;
  transform: none;
}

.login-button[disabled] {
  opacity: 0.7;
  transform: none;
}

/* 忘记密码 */
.forgot-password {
  text-align: center;
}

.forgot-link {
  font-size: 26rpx;
  color: $hospital-primary;
  text-decoration: underline;
}

/* 注册区域 */
.register-section {
  border-top: 1rpx solid #E5F4F5;
  padding-top: 40rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #E5F4F5;
}

.divider-text {
  font-size: 26rpx;
  color: #999;
  margin: 0 32rpx;
}

.register-button {
  width: 100%;
  height: 88rpx;
  background: white;
  border: 2rpx solid $hospital-primary;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: $hospital-primary;
  transition: all 0.3s ease;
}

.register-button:active {
  background: #F0FDFF;
  transform: translateY(-1rpx);
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
  .login-container {
    padding: 20rpx;
  }
  
  .login-content {
    padding-top: 40rpx;
  }
  
  .hospital-header {
    margin-bottom: 60rpx;
  }
  
  .login-card {
    padding: 40rpx 32rpx;
  }
}
</style>