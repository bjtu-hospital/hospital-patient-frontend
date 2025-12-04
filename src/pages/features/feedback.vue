<template>
  <view class="feedback-container">
    <!-- 反馈类型选择 -->
    <view class="feedback-types">
      <view class="section-title">
        <text class="title-text">反馈类型</text>
      </view>
      <view class="type-options">
        <view 
          class="type-option" 
          :class="{ active: selectedType === type.value }"
          v-for="type in feedbackTypes" 
          :key="type.value"
          @tap="selectType(type.value)"
        >
          <view class="type-icon">
              <uni-icons :type="type.iconType" size="28" :color="selectedType === type.value ? 'white' : '#64748b'"></uni-icons>
          </view>
          <text class="type-text">{{ type.label }}</text>
        </view>
      </view>
    </view>

    <!-- 反馈内容 -->
    <view class="feedback-content">
      <view class="section-title">
        <text class="title-text">详细描述</text>
        <text class="title-desc">请详细描述您遇到的问题或建议</text>
      </view>
      <view class="textarea-wrapper">
        <textarea 
          class="feedback-textarea"
          placeholder="请详细描述您的问题或建议，我们会认真对待每一条反馈..."
          v-model="feedbackContent"
          maxlength="500"
          show-confirm-bar="false"
        />
        <text class="char-count">{{ feedbackContent.length }}/500</text>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section">
      <view class="section-title">
        <text class="title-text">联系方式</text>
        <text class="title-desc">便于我们与您联系（选填）</text>
      </view>
      <view class="contact-inputs">
        <view class="input-group">
          <view class="input-wrapper">
            <Phone :size="18" color="#00BFCC" class="input-icon" />
            <input 
              class="input-field" 
              type="text" 
              placeholder="手机号"
              v-model="contactPhone"
            />
          </view>
        </view>
        <view class="input-group">
          <view class="input-wrapper">
            <Mail :size="18" color="#00BFCC" class="input-icon" />
            <input 
              class="input-field" 
              type="text" 
              placeholder="邮箱"
              v-model="contactEmail"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button 
        class="submit-btn" 
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit"
        @tap="submitFeedback"
      >
        {{ isSubmitting ? '提交中...' : '提交反馈' }}
      </button>
    </view>

    <!-- 历史反馈 -->
    <view class="history-section" v-if="feedbackHistory.length > 0">
      <view class="section-title">
        <text class="title-text">我的反馈记录</text>
      </view>
      <view class="history-list">
        <view 
          class="history-item" 
          v-for="item in feedbackHistory" 
          :key="item.id"
          @tap="viewFeedback(item)"
        >
          <view class="history-content">
            <text class="history-title">{{ getTypeLabel(item.type) }}</text>
            <text class="history-desc">{{ item.content }}</text>
            <text class="history-date">{{ formatDate(item.submitDate || item.createdAt || item.created_at) }}</text>
          </view>
          <view class="history-status" :class="item.status || 'pending'">
            <text class="status-text">{{ getStatusText(item.status || 'pending') }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态提示 -->
    <view class="empty-state" v-else-if="!isLoadingHistory">
      <text class="empty-text">暂无反馈记录</text>
      <text class="empty-desc">提交反馈后将在这里显示</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessageCircle, Phone, Mail, Bug, Lightbulb, AlertCircle, Star } from 'lucide-vue-next'
import { getFeedbackList, submitFeedback as submitFeedbackApi, getFeedbackDetail } from '@/api/feedback'

// 反馈类型
const feedbackTypes = ref([
  { value: 'bug', label: '功能异常', icon: Bug, iconType: 'info-filled' },
  { value: 'suggestion', label: '功能建议', icon: Lightbulb, iconType: 'help-filled' },
  { value: 'complaint', label: '服务投诉', icon: AlertCircle, iconType: 'closeempty' },
  { value: 'praise', label: '表扬建议', icon: Star, iconType: 'star-filled' }
])

// 表单数据
const selectedType = ref('')
const feedbackContent = ref('')
const contactPhone = ref('')
const contactEmail = ref('')
const isSubmitting = ref(false)

// 历史反馈记录
const feedbackHistory = ref([])
const isLoadingHistory = ref(false)

// 是否可提交
const canSubmit = computed(() => {
  return selectedType.value && feedbackContent.value.trim().length >= 10 && !isSubmitting.value
})

// 选择反馈类型
const selectType = (type) => {
  selectedType.value = type
}

// 获取类型标签文本
const getTypeLabel = (typeValue) => {
  const type = feedbackTypes.value.find(t => t.value === typeValue)
  return type ? type.label : typeValue
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    replied: '已回复',
    closed: '已关闭'
  }
  return statusMap[status] || status
}

/**
 * 加载历史反馈
 */
const loadFeedbackHistory = async () => {
  try {
    isLoadingHistory.value = true
    const response = await getFeedbackList()
    console.log('📋 获取反馈列表成功:', response)
    
    // 后端返回的数据结构可能是 { code: 0, message: [] } 或者直接是数组
    if (Array.isArray(response)) {
      feedbackHistory.value = response
    } else if (response.message && Array.isArray(response.message)) {
      feedbackHistory.value = response.message
    } else {
      feedbackHistory.value = []
    }
  } catch (error) {
    console.error('❌ 获取反馈列表失败:', error)
    // 不显示错误提示，静默失败
    feedbackHistory.value = []
  } finally {
    isLoadingHistory.value = false
  }
}

// 提交反馈
const submitFeedback = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请选择类型并填写详细描述（至少10字）',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 邮箱格式验证（如果填写了邮箱）
  if (contactEmail.value && !isValidEmail(contactEmail.value)) {
    uni.showToast({
      title: '邮箱格式不正确',
      icon: 'none'
    })
    return
  }

  // 手机号格式验证（如果填写了手机号）
  if (contactPhone.value && !isValidPhone(contactPhone.value)) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none'
    })
    return
  }

  isSubmitting.value = true

  try {
    const feedbackData = {
      type: selectedType.value,
      content: feedbackContent.value.trim()
    }
    
    // 添加可选的联系方式
    if (contactPhone.value) {
      feedbackData.contactPhone = contactPhone.value
    }
    if (contactEmail.value) {
      feedbackData.contactEmail = contactEmail.value
    }
    
    console.log('📤 提交反馈数据:', feedbackData)
    
    const response = await submitFeedbackApi(feedbackData)
    console.log('✅ 提交反馈成功:', response)
    
    uni.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000
    })
    
    // 重置表单
    selectedType.value = ''
    feedbackContent.value = ''
    contactPhone.value = ''
    contactEmail.value = ''
    
    // 重新加载历史记录
    setTimeout(() => {
      loadFeedbackHistory()
    }, 500)
    
  } catch (error) {
    console.error('❌ 提交反馈失败:', error)
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    isSubmitting.value = false
  }
}

// 查看反馈详情
const viewFeedback = (item) => {
  // 直接使用列表数据展示详情，简洁明了
  let content = `类型：${getTypeLabel(item.type)}\n\n`
  content += `内容：${item.content}\n\n`
  content += `提交时间：${formatDate(item.submitDate || item.createdAt || item.created_at)}\n\n`
  content += `状态：${getStatusText(item.status || 'pending')}`
  
  uni.showModal({
    title: '反馈详情',
    content: content,
    showCancel: false,
    confirmText: '知道了',
    confirmColor: '#00BFCC'
  })
}

// 邮箱格式验证
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 手机号格式验证（简单验证11位数字）
const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '未知'
  
  try {
    // 如果是时间戳
    if (typeof date === 'number') {
      return new Date(date).toLocaleDateString('zh-CN')
    }
    
    // 如果是日期字符串
    if (typeof date === 'string') {
      // 如果已经是 YYYY-MM-DD 格式
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date
      }
      // 尝试解析其他格式
      return new Date(date).toLocaleDateString('zh-CN')
    }
    
    return '未知'
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '未知'
  }
}

onMounted(() => {
  console.log('📱 意见反馈页面加载')
  // 加载历史反馈记录
  loadFeedbackHistory()
})
</script>

<style lang="scss" scoped>
.feedback-container {
  background: #f8fafc;
  min-height: 100vh;
  padding: 24rpx;
}

.section-title {
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 8rpx;
}

.title-desc {
  font-size: 22rpx;
  color: #64748b;
}

/* 反馈类型 */
.feedback-types {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.type-option {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 24rpx;
  transition: all 0.2s ease;
}

.type-option.active {
  background: #00BFCC;
  border-color: #00BFCC;
  color: white;
}

.type-icon {
  margin-right: 12rpx;
}

.type-text {
  font-size: 24rpx;
  color: #64748b;
}

.type-option.active .type-text {
  color: white;
}

/* 反馈内容 */
.feedback-content {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.textarea-wrapper {
  position: relative;
}

.feedback-textarea {
  width: 100%;
  min-height: 200rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #0f172a;
  line-height: 1.5;
  resize: none;
}

.feedback-textarea:focus {
  border-color: #00BFCC;
  background: white;
  box-shadow: 0 0 0 3rpx rgba(0, 191, 204, 0.1);
}

.char-count {
  position: absolute;
  bottom: 16rpx;
  right: 20rpx;
  font-size: 20rpx;
  color: #94a3b8;
}

/* 联系方式 */
.contact-section {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.contact-inputs {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.input-group {
  margin-bottom: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  height: 80rpx;
}

.input-wrapper:focus-within {
  border-color: #00BFCC;
  background: white;
  box-shadow: 0 0 0 3rpx rgba(0, 191, 204, 0.1);
}

.input-icon {
  margin-right: 16rpx;
}

.input-field {
  flex: 1;
  font-size: 26rpx;
  color: #0f172a;
  background: transparent;
  border: none;
}

/* 提交按钮 */
.submit-section {
  margin-bottom: 32rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #00BFCC 0%, #4DD0DB 100%);
  border: none;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.3);
  transition: all 0.2s ease;
}

.submit-btn:active {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(0, 191, 204, 0.4);
}

.submit-btn.disabled {
  background: #cbd5e1;
  color: #94a3b8;
  box-shadow: none;
  transform: none;
}

/* 历史反馈 */
.history-section {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.history-list {
  margin-top: 20rpx;
}

.history-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.history-item:last-child {
  border-bottom: none;
}

.history-content {
  flex: 1;
  margin-right: 20rpx;
}

.history-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #0f172a;
  display: block;
  margin-bottom: 8rpx;
}

.history-desc {
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.4;
  display: block;
  margin-bottom: 12rpx;
}

.history-date {
  font-size: 20rpx;
  color: #94a3b8;
}

.history-status {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.history-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.history-status.processing {
  background: #dbeafe;
  color: #1d4ed8;
}

.history-status.replied {
  background: #dcfce7;
  color: #16a34a;
}

.history-status.closed {
  background: #f3f4f6;
  color: #6b7280;
}

/* 空状态 */
.empty-state {
  background: white;
  border-radius: 12rpx;
  padding: 80rpx 24rpx;
  text-align: center;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.empty-text {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 12rpx;
}

.empty-desc {
  display: block;
  font-size: 22rpx;
  color: #94a3b8;
}
</style>