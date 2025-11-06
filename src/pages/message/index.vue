<template>
  <view class="messages-container">
    <!-- 顶部标题栏 -->
    <view class="header-section">
      <text class="page-title">就医通知</text>
      <view class="all-notifications" @tap="showAllNotifications">
        <text class="all-text">全部通知</text>
        <ChevronRight :size="16" color="#64748b" />
      </view>
    </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <view 
        class="message-item" 
        v-for="message in messages" 
        :key="message.id"
        @tap="viewMessage(message)"
      >
        <view class="message-content">
          <text class="message-title">{{ message.title }}</text>
          <text class="message-summary" v-if="message.summary">{{ message.summary }}</text>
        </view>
        <view class="message-meta">
          <text class="message-date">{{ message.date }}</text>
          <view class="message-badge" v-if="message.isNew">
            <text class="badge-text">新</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="messages.length === 0">
        <MessageCircle :size="48" color="#cbd5e1" />
        <text class="empty-text">暂无消息</text>
      </view>
    </view>

    <!-- 底部操作提示 -->
    <view class="bottom-tip">
      <text class="tip-text">保存以上内容为图片</text>
      <ChevronRight :size="16" color="#94a3b8" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MessageCircle, ChevronRight } from 'lucide-vue-next'

// 消息数据
const messages = ref([
  {
    id: 1,
    title: '检验检查报告通知',
    summary: '',
    date: '07月07日',
    isNew: false
  },
  {
    id: 2,
    title: '门诊患者满意度调查提醒',
    summary: '门诊患者满意度调查提醒',
    date: '07月05日',
    isNew: false
  }
])

// 查看所有通知
const showAllNotifications = () => {
  uni.showToast({
    title: '查看全部通知',
    icon: 'none'
  })
}

// 查看消息详情
const viewMessage = (message) => {
  uni.showModal({
    title: message.title,
    content: message.summary || '消息详情...',
    showCancel: false,
    confirmText: '知道了'
  })
}

onMounted(() => {
  console.log('消息页面加载')
})
</script>

<style lang="scss" scoped>
.messages-container {
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 顶部标题栏 */
.header-section {
  padding: 40rpx 32rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f1f5f9;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #0f172a;
}

.all-notifications {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background: #f8fafc;
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  transition: all 0.2s ease;
}

.all-notifications:active {
  background: #f1f5f9;
  transform: translateY(1rpx);
}

.all-text {
  font-size: 24rpx;
  color: #64748b;
  margin-right: 8rpx;
}

/* 消息列表 */
.message-list {
  padding: 0 32rpx;
}

.message-item {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item:active {
  background: #f8fafc;
  margin: 0 -32rpx;
  padding: 32rpx;
  border-radius: 12rpx;
}

.message-content {
  flex: 1;
  margin-right: 24rpx;
}

.message-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
  display: block;
  margin-bottom: 8rpx;
}

.message-summary {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.4;
}

.message-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.message-date {
  font-size: 22rpx;
  color: #94a3b8;
}

.message-badge {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 4rpx rgba(239, 68, 68, 0.2);
}

.badge-text {
  font-size: 20rpx;
  color: white;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-text {
  font-size: 28rpx;
  color: #94a3b8;
  margin-top: 24rpx;
}

/* 底部提示 */
.bottom-tip {
  position: fixed;
  bottom: 120rpx;
  right: 32rpx;
  background: #f8fafc;
  padding: 16rpx 24rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.bottom-tip:active {
  background: #f1f5f9;
  transform: translateY(1rpx);
}

.tip-text {
  font-size: 22rpx;
  color: #64748b;
  margin-right: 8rpx;
}
</style>