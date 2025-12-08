<template>
  <view class="settings-container">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper">
        <view class="avatar">
          <text class="avatar-text">{{ nameFirstChar }}</text>
        </view>
      </view>
      <text class="user-name">{{ userInfo.realName || '未设置姓名' }}</text>
    </view>

    <!-- 基本信息 -->
    <view class="section">
      <view class="section-title">基本信息</view>
      
      <view class="info-item">
        <text class="item-label">姓名</text>
        <text class="item-value">{{ userInfo.realName || '未设置' }}</text>
      </view>
      
      <view class="info-item">
        <text class="item-label">手机号</text>
        <text class="item-value">{{ maskedPhone }}</text>
      </view>
      
      <view class="info-item">
        <text class="item-label">身份证</text>
        <text class="item-value">{{ maskedIdCard }}</text>
      </view>
      
      <view class="info-item">
        <text class="item-label">性别</text>
        <text class="item-value">{{ userInfo.gender || '未设置' }}</text>
      </view>
      
      <view class="info-item">
        <text class="item-label">出生日期</text>
        <text class="item-value">{{ userInfo.birthDate || '未设置' }}</text>
      </view>
    </view>

    <!-- 校园身份 -->
    <view class="section">
      <view class="section-title">校园身份</view>
      
      <view class="info-item">
        <text class="item-label">身份类型</text>
        <view class="item-value-wrapper">
          <text class="item-value">{{ patientTypeText }}</text>
          <view class="verify-tag" :class="{ verified: userInfo.verified }">
            {{ userInfo.verified ? '已认证' : '未认证' }}
          </view>
        </view>
      </view>
      
      <view class="info-item">
        <text class="item-label">学号/工号</text>
        <text class="item-value">{{ userInfo.identifier || '未绑定' }}</text>
      </view>
    </view>

    <!-- 邮箱绑定 -->
    <view class="section">
      <view class="section-title">
        <text>邮箱绑定</text>
        <text class="section-tip">绑定邮箱后可接收预约提醒</text>
      </view>
      
      <view class="info-item" v-if="userInfo.email && !showEmailBind">
        <text class="item-label">当前邮箱</text>
        <view class="item-value-wrapper">
          <text class="item-value">{{ maskedEmail }}</text>
          <text class="change-btn" @tap="startChangeEmail">更换</text>
        </view>
      </view>
      
      <view class="info-item" v-if="!userInfo.email && !showEmailBind" @tap="startBindEmail">
        <text class="item-label">绑定邮箱</text>
        <view class="item-value-wrapper">
          <text class="item-value placeholder">点击绑定邮箱接收预约提醒</text>
          <text class="item-arrow">›</text>
        </view>
      </view>

      <!-- 邮箱绑定表单 -->
      <view class="email-bind-form" v-if="showEmailBind">
        <view class="form-item">
          <text class="form-label">邮箱地址</text>
          <input 
            class="form-input" 
            type="text"
            v-model="emailForm.email" 
            placeholder="请输入邮箱地址"
            :disabled="emailForm.codeSent"
          />
        </view>
        
        <view class="form-item" v-if="emailForm.codeSent">
          <text class="form-label">验证码</text>
          <view class="code-input-wrapper">
            <input 
              class="form-input code-input" 
              type="number"
              v-model="emailForm.code" 
              placeholder="请输入6位验证码"
              maxlength="6"
            />
          </view>
        </view>
        
        <view class="form-actions">
          <button 
            class="btn-cancel" 
            @tap="cancelEmailBind"
          >取消</button>
          
          <button 
            v-if="!emailForm.codeSent"
            class="btn-send" 
            :disabled="!isEmailValid || sendingCode"
            @tap="sendVerifyCode"
          >
            {{ sendingCode ? '发送中...' : '发送验证码' }}
          </button>
          
          <button 
            v-else
            class="btn-verify" 
            :disabled="!isCodeValid || verifying"
            @tap="verifyAndBindEmail"
          >
            {{ verifying ? '验证中...' : '确认绑定' }}
          </button>
        </view>
        
        <!-- 重新发送 -->
        <view class="resend-tip" v-if="emailForm.codeSent">
          <text v-if="countdown > 0">{{ countdown }}秒后可重新发送</text>
          <text v-else class="resend-btn" @tap="sendVerifyCode">重新发送验证码</text>
        </view>
      </view>
    </view>

    <!-- 账号安全 -->
    <view class="section">
      <view class="section-title">账号安全</view>
      
      <view class="info-item clickable" @tap="goToChangePassword">
        <text class="item-label">修改密码</text>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @tap="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserInfo } from '@/api/user'
import { sendEmailVerifyCode, verifyEmailCode } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 用户信息
const userInfo = ref({
  realName: '',
  phonenumber: '',
  idCard: '',
  gender: '',
  birthDate: '',
  email: '',
  identifier: '',
  verified: false,
  patientType: ''
})

// 加载状态
const loading = ref(false)

// 邮箱绑定相关
const showEmailBind = ref(false)
const emailForm = ref({
  email: '',
  code: '',
  codeSent: false
})
const sendingCode = ref(false)
const verifying = ref(false)
const countdown = ref(0)
let countdownTimer = null

// 计算属性
const nameFirstChar = computed(() => {
  const name = userInfo.value.realName || '用'
  return name.charAt(0)
})

const maskedPhone = computed(() => {
  const phone = userInfo.value.phonenumber || ''
  if (phone.length >= 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7)
  }
  return phone || '未绑定'
})

const maskedIdCard = computed(() => {
  const idCard = userInfo.value.idCard || ''
  if (idCard.length >= 18) {
    return idCard.substring(0, 6) + '********' + idCard.substring(14)
  }
  return idCard || '未绑定'
})

const maskedEmail = computed(() => {
  const email = userInfo.value.email || ''
  if (email.includes('@')) {
    const [localPart, domain] = email.split('@')
    if (localPart.length > 3) {
      return localPart.substring(0, 3) + '***@' + domain
    }
    return localPart.charAt(0) + '***@' + domain
  }
  return email
})

const patientTypeText = computed(() => {
  const typeMap = {
    'student': '学生',
    '学生': '学生',
    'teacher': '教师',
    '教师': '教师',
    'staff': '职工',
    '职工': '职工'
  }
  return typeMap[userInfo.value.patientType] || '未认证'
})

const isEmailValid = computed(() => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(emailForm.value.email)
})

const isCodeValid = computed(() => {
  return emailForm.value.code && emailForm.value.code.length === 6
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    loading.value = true
    const result = await getUserInfo()
    console.log('📱 获取用户信息成功:', result)
    userInfo.value = result
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    uni.showToast({
      title: error.message || '获取用户信息失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 开始绑定邮箱
const startBindEmail = () => {
  showEmailBind.value = true
  emailForm.value = {
    email: '',
    code: '',
    codeSent: false
  }
}

// 开始更换邮箱
const startChangeEmail = () => {
  showEmailBind.value = true
  emailForm.value = {
    email: '',
    code: '',
    codeSent: false
  }
}

// 取消邮箱绑定
const cancelEmailBind = () => {
  showEmailBind.value = false
  emailForm.value = {
    email: '',
    code: '',
    codeSent: false
  }
  stopCountdown()
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!isEmailValid.value) {
    uni.showToast({
      title: '请输入正确的邮箱地址',
      icon: 'none'
    })
    return
  }
  
  try {
    sendingCode.value = true
    const result = await sendEmailVerifyCode(emailForm.value.email)
    console.log('📧 发送验证码成功:', result)
    
    emailForm.value.codeSent = true
    
    uni.showToast({
      title: result.detail || '验证码已发送',
      icon: 'success'
    })
    
    // 开始倒计时
    startCountdown()
  } catch (error) {
    console.error('❌ 发送验证码失败:', error)
    uni.showToast({
      title: error.message || '发送验证码失败',
      icon: 'none'
    })
  } finally {
    sendingCode.value = false
  }
}

// 验证并绑定邮箱
const verifyAndBindEmail = async () => {
  if (!isCodeValid.value) {
    uni.showToast({
      title: '请输入6位验证码',
      icon: 'none'
    })
    return
  }
  
  try {
    verifying.value = true
    const result = await verifyEmailCode(emailForm.value.email, emailForm.value.code)
    console.log('✅ 邮箱绑定成功:', result)
    
    // 更新本地用户信息
    userInfo.value.email = result.email || emailForm.value.email
    
    // 隐藏绑定表单
    showEmailBind.value = false
    emailForm.value = {
      email: '',
      code: '',
      codeSent: false
    }
    stopCountdown()
    
    uni.showToast({
      title: '邮箱绑定成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('❌ 邮箱绑定失败:', error)
    uni.showToast({
      title: error.message || '验证码错误或已过期',
      icon: 'none'
    })
  } finally {
    verifying.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = 0
}

// 修改密码（待实现）
const goToChangePassword = () => {
  uni.showToast({
    title: '修改密码功能开发中',
    icon: 'none'
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

onMounted(() => {
  loadUserInfo()
})

onShow(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.settings-container {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 头像区域 */
.avatar-section {
  background: linear-gradient(135deg, #00BFCC 0%, #4DD0DB 100%);
  padding: 60rpx 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  margin-bottom: 20rpx;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.avatar-text {
  font-size: 56rpx;
  font-weight: 600;
  color: white;
}

.user-name {
  font-size: 36rpx;
  font-weight: 500;
  color: white;
}

/* 信息区块 */
.section {
  background: white;
  margin: 24rpx 32rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-tip {
  font-size: 22rpx;
  font-weight: 400;
  color: #94a3b8;
}

/* 信息项 */
.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8fafc;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item.clickable {
  cursor: pointer;
}

.info-item.clickable:active {
  background: #f8fafc;
  margin: 0 -24rpx;
  padding: 20rpx 24rpx;
}

.item-label {
  font-size: 26rpx;
  color: #64748b;
  flex-shrink: 0;
}

.item-value-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.item-value {
  font-size: 26rpx;
  color: #0f172a;
  text-align: right;
}

.item-value.placeholder {
  color: #94a3b8;
}

.item-arrow {
  font-size: 28rpx;
  color: #cbd5e1;
  margin-left: 8rpx;
}

/* 认证标签 */
.verify-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
  background: #fef3c7;
  color: #d97706;
}

.verify-tag.verified {
  background: #dcfce7;
  color: #16a34a;
}

/* 更换按钮 */
.change-btn {
  font-size: 24rpx;
  color: #00BFCC;
  margin-left: 16rpx;
  padding: 6rpx 16rpx;
  background: #f0fdff;
  border-radius: 8rpx;
}

/* 邮箱绑定表单 */
.email-bind-form {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f1f5f9;
}

.form-item {
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 24rpx;
  color: #64748b;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #0f172a;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #00BFCC;
  background: white;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
}

.code-input {
  flex: 1;
  letter-spacing: 8rpx;
}

.form-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.btn-cancel,
.btn-send,
.btn-verify {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-send,
.btn-verify {
  background: linear-gradient(135deg, #00BFCC 0%, #00D5D9 100%);
  color: white;
}

.btn-send[disabled],
.btn-verify[disabled] {
  background: #e2e8f0;
  color: #94a3b8;
}

.resend-tip {
  text-align: center;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.resend-btn {
  color: #00BFCC;
}

/* 退出登录 */
.logout-section {
  margin: 48rpx 32rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: white;
  border: 2rpx solid #ef4444;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #ef4444;
}

.logout-btn:active {
  background: #fef2f2;
}
</style>
