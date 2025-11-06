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
            <text class="history-title">{{ item.type }}</text>
            <text class="history-desc">{{ item.content }}</text>
            <text class="history-date">{{ item.submitDate }}</text>
          </view>
          <view class="history-status" :class="item.status">
            <text class="status-text">{{ getStatusText(item.status) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessageCircle, Phone, Mail, Bug, Lightbulb, AlertCircle, Star } from 'lucide-vue-next'

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
const feedbackHistory = ref([
  {
    id: 1,
    type: '功能建议',
    content: '希望能增加预约提醒功能',
    submitDate: '2024-10-25',
    status: 'replied'
  },
  {
    id: 2,
    type: '功能异常',
    content: '登录时偶尔出现卡顿',
    submitDate: '2024-10-20',
    status: 'processing'
  }
])

// 是否可提交
const canSubmit = computed(() => {
  return selectedType.value && feedbackContent.value.trim().length >= 10
})

// 选择反馈类型
const selectType = (type) => {
  selectedType.value = type
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

// 提交反馈
const submitFeedback = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请选择类型并填写详细描述',
      icon: 'none'
    })
    return
  }

  isSubmitting.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 添加到历史记录
    const newFeedback = {
      id: Date.now(),
      type: feedbackTypes.value.find(t => t.value === selectedType.value)?.label,
      content: feedbackContent.value,
      submitDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    
    feedbackHistory.value.unshift(newFeedback)
    
    // 重置表单
    selectedType.value = ''
    feedbackContent.value = ''
    contactPhone.value = ''
    contactEmail.value = ''
    
    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })
    
  } catch (error) {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 查看反馈详情
const viewFeedback = (item) => {
  uni.showModal({
    title: '反馈详情',
    content: `类型：${item.type}\n内容：${item.content}\n状态：${getStatusText(item.status)}`,
    showCancel: false,
    confirmText: '知道了'
  })
}

onMounted(() => {
  console.log('意见反馈页面加载')
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
</style>