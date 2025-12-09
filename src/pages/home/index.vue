<template>
  <view class="home-container">
    <!-- 顶部轮播图 -->
    <view class="banner-swiper-container">
      <swiper 
        class="banner-swiper" 
        :indicator-dots="true"
        :indicator-color="'rgba(255, 255, 255, 0.5)'"
        :indicator-active-color="'#00BFCC'"
        :autoplay="true" 
        :interval="4000" 
        :duration="500"
        :circular="true"
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="index">
          <image 
            class="banner-image" 
            :src="banner.image" 
            mode="widthFix"
            @tap="handleBannerClick(banner)"
          />
        </swiper-item>
      </swiper>
    </view>

    <!-- 用户信息区域 -->
    <view class="user-info-section" @tap="goToLogin">
      <view class="user-info">
        <view class="user-avatar">
          <text class="avatar-text">{{ userAvatar }}</text>
        </view>
        <view class="user-details">
          <text class="user-name">{{ userInfo.name || '未登录' }}</text>
          <text class="user-id">{{ userInfo.studentId || '点击登录' }}</text>
        </view>
      </view>
      <view class="switch-account" @tap.stop="switchAccount">
        <text class="switch-text">{{ isLoggedIn ? '切换' : '登录' }}</text>
      </view>
      <view class="qr-code" @tap.stop="showQRCode">
        <text class="qr-text">点击出示</text>
      </view>
    </view>

    <!-- 预约挂号主入口 -->
    <view class="main-appointment">
      <view 
        class="appointment-card" 
        hover-class="appointment-card-hover"
        :hover-stay-time="100"
        @tap="navigateTo('/pages/home/appointment/select-hospital')"
      >
        <view class="card-content">
          <text class="card-title">预约挂号</text>
          <text class="card-subtitle">选择科室医生，在线预约</text>
        </view>
        <view class="card-icon">
          <uni-icons type="calendar" size="48" color="rgba(255,255,255,0.3)"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 核心功能网格 -->
    <view class="function-grid">
      <view class="grid-row">
        <view 
          class="function-item" 
          hover-class="function-item-hover"
          :hover-stay-time="50"
          @tap="navigateTo('/pages/profile/health/index')"
        >
          <view class="function-icon blue-bg">
            <uni-icons type="heart" size="30" color="white"></uni-icons>
          </view>
          <text class="function-name">健康档案</text>
        </view>
        <view 
          class="function-item" 
          hover-class="function-item-hover"
          :hover-stay-time="50"
          @tap="navigateTo('/pages/features/doctors')"
        >
          <view class="function-icon purple-bg">
            <uni-icons type="contact" size="30" color="white"></uni-icons>
          </view>
          <text class="function-name">科室专家</text>
        </view>
        <view 
          class="function-item" 
          hover-class="function-item-hover"
          :hover-stay-time="50"
          @tap="navigateTo('/pages/features/ai-assistant')"
        >
          <view class="function-icon green-bg">
            <uni-icons type="help" size="30" color="white"></uni-icons>
          </view>
          <text class="function-name">AI助手</text>
        </view>
        <view 
          class="function-item" 
          hover-class="function-item-hover"
          :hover-stay-time="50"
          @tap="navigateTo('/pages/profile/patients')"
        >
          <view class="function-icon yellow-bg">
            <uni-icons type="person" size="30" color="white"></uni-icons>
          </view>
          <text class="function-name">就诊人管理</text>
        </view>
      </view>

      <view class="grid-row">
        <view 
          class="function-item" 
          hover-class="function-item-hover"
          :hover-stay-time="50"
          @tap="switchTab"
        >
          <view class="function-icon red-bg">
            <uni-icons type="chatboxes" size="30" color="white"></uni-icons>
          </view>
          <text class="function-name">消息中心</text>
        </view>
        <view 
          class="function-item" 
          hover-class="function-item-hover"
          :hover-stay-time="50"
          @tap="navigateTo('/pages/features/feedback')"
        >
          <view class="function-icon brown-bg">
            <uni-icons type="paperplane" size="30" color="white"></uni-icons>
          </view>
          <text class="function-name">意见反馈</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

// 使用 Pinia Store
const userStore = useUserStore()

// 轮播图数据
const bannerList = ref([
  {
    id: 1,
    image: '/static/home-picture/1.png',
    title: '检查检验结果互认',
    content: '我院已全面实施检查检验结果互认，不同机构之间的检查检验结果可以相互认可。\n\n温馨提示：医生将根据您的病情和检验检查项目进行综合研判。我院的检验报告单下方有互认标识，请注意查看。'
  },
  {
    id: 2,
    image: '/static/home-picture/2.png',
    title: '预约挂号须知',
    content: '请提前预约，合理安排就诊时间。'
  },
  {
    id: 3,
    image: '/static/home-picture/3.png',
    title: '健康服务',
    content: '为您提供全方位的健康医疗服务。'
  }
])

// 点击轮播图事件
const handleBannerClick = (banner) => {
  if (banner.content) {
    uni.showModal({
      title: banner.title,
      content: banner.content,
      showCancel: false,
      confirmText: '知道了'
    })
  }
}

// 用户信息（从 Store 获取）
const userInfo = computed(() => {
  if (!userStore.isLoggedIn) {
    return {
      name: '',
      studentId: '',
      avatar: ''
    }
  }
  
  // 从 store 中获取完整用户信息
  const ui = userStore.userInfo || {}
  return {
    name: ui.realName || ui.name || '',
    studentId: ui.studentId || ui.phonenumber || ui.identifier || '',
    avatar: ui.avatar || ''
  }
})

// 用户头像首字
const userAvatar = computed(() => {
  if (userInfo.value.name) {
    return userInfo.value.name.charAt(0)
  }
  return '用'
})

// 是否已登录（直接使用 store 的响应式属性）
const isLoggedIn = computed(() => !!userStore.isLoggedIn)

// 页面跳转
const navigateTo = (url) => {
  uni.navigateTo({
    url: url
  })
}

// 如果未登录，跳转到登录页
const goToLogin = () => {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/auth/login'
    })
  }
}

// 切换标签页
const switchTab = () => {
  uni.switchTab({
    url: '/pages/message/index'
  })
}

// 切换账号
const switchAccount = () => {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/auth/login'
    })
    return
  }
  
  uni.showModal({
    title: '切换账号',
    content: '是否要退出当前账号并切换到其他账号？',
    showCancel: true,
    confirmText: '退出登录',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}

// 显示二维码
const showQRCode = () => {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/auth/login'
    })
    return
  }
  
  uni.showModal({
    title: '电子就诊卡',
    content: '显示电子就诊卡二维码功能开发中...',
    showCancel: false,
    confirmText: '知道了'
  })
}

onMounted(() => {
  console.log('📱 首页加载，用户信息:', {
    name: userInfo.value?.name,
    phonenumber: userInfo.value?.studentId,
    avatar: userInfo.value?.avatar,
    isLoggedIn: isLoggedIn.value
  })
})

// 每次页面显示时刷新用户信息
onShow(() => {
  console.log('📱 首页显示，用户登录状态:', isLoggedIn.value)

  // 尝试恢复本地登录态并在必要时刷新用户信息
  try {
    const restored = userStore.restoreAuth()
    console.log('📱 restoreAuth ->', restored)

    // 如果本地有 token 但 store 中没有完整用户信息，尝试校验并获取完整信息
    if (restored && (!userStore.userInfo || !userStore.userInfo.realName)) {
      userStore.checkAuth().then(res => {
        console.log('📱 checkAuth 获取用户信息成功:', res)
      }).catch(err => {
        console.warn('⚠️ checkAuth 失败:', err)
      })
    }
  } catch (err) {
    console.warn('⚠️ 首页恢复登录态失败:', err)
  }
})
</script>

<style lang="scss" scoped>
.home-container {
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 页面淡入动画 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 轮播图容器 */
.banner-swiper-container {
  margin: $spacing-md;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  animation: fade-in-up 0.5s ease-out;
}

.banner-swiper {
  height: 265rpx;  // 根据图片宽高比计算: 假设容器宽度约702rpx (750-48边距), 702/2.65≈265rpx
  width: 100%;
}

.banner-image {
  width: 100%;
  height: auto;
  display: block;
}

/* 用户信息区域 - 队友风格 */
.user-info-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: white;
  margin: 0 24rpx 24rpx;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  animation: fade-in-up 0.5s ease-out 0.1s backwards;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.user-avatar {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.avatar-text {
  color: white;
  font-size: 24rpx;
  font-weight: 600;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 4rpx;
}

.user-id {
  font-size: 22rpx;
  color: #64748b;
}

.switch-account {
  background: #f1f5f9;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  margin-right: 16rpx;
  transition: all 0.2s ease;
}

.switch-account:active {
  background: #e2e8f0;
  transform: translateY(1rpx);
}

.qr-code {
  background: #f0fdff;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  border: 1rpx solid #00D5D9;
  transition: all 0.2s ease;
}

.qr-code:active {
  background: #e6fffa;
  transform: translateY(1rpx);
}

.switch-text,
.qr-text {
  font-size: 22rpx;
  color: #475569;
}

.qr-text {
  color: #00D5D9;
}

/* 预约挂号主入口 - 队友风格 */
.main-appointment {
  padding: 0 24rpx;
  margin-bottom: 24rpx;
  animation: fade-in-up 0.5s ease-out 0.2s backwards;
}

.appointment-card {
  background: linear-gradient(135deg, #00D5D9 0%, #4DD0DB 100%);
  border-radius: 12rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 12rpx rgba(0, 213, 217, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* hover-class效果 */
.appointment-card-hover {
  transform: translateY(-4rpx) scale(0.98);
  box-shadow: 0 12rpx 28rpx rgba(0, 213, 217, 0.5);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: white;
  display: block;
  margin-bottom: 6rpx;
}

.card-subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

.card-icon {
  opacity: 0.3;
}

/* 核心功能网格 - 队友风格 */
.function-grid {
  padding: 0 24rpx;
  animation: fade-in-up 0.5s ease-out 0.3s backwards;
}

.grid-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.function-item {
  width: calc(25% - 12rpx);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* hover-class效果 */
.function-item-hover {
  transform: translateY(-4rpx);
  opacity: 0.8;
}

.function-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* hover时图标也有反馈 */
.function-item-hover .function-icon {
  transform: scale(1.05);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.2);
}

/* 统一主色调系统 - 基于 #00D5D9 */
.function-icon.blue-bg {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
}

.function-icon.red-bg {
  background: linear-gradient(135deg, #00C4C8 0%, $hospital-primary 100%);
}

.function-icon.purple-bg {
  background: linear-gradient(135deg, $hospital-primary-light 0%, #6FE3E9 100%);
}

.function-icon.brown-bg {
  background: linear-gradient(135deg, $hospital-primary-dark 0%, #009AA5 100%);
}

.function-icon.yellow-bg {
  background: linear-gradient(135deg, $hospital-accent 0%, #7FE8DD 100%);
}

.function-icon.green-bg {
  background: linear-gradient(135deg, #00E0E5 0%, $hospital-accent 100%);
}

.function-name {
  font-size: 20rpx;
  color: #374151;
  font-weight: 500;
}
</style>