<template>
  <view class="ai-container">
    <!-- AI功能介绍 -->
    <view class="ai-intro">
      <view class="intro-header">
        <view class="ai-avatar">
          <Bot :size="32" color="white" />
        </view>
        <view class="intro-text">
          <text class="intro-title">AI智能就医助手</text>
          <text class="intro-desc">描述症状，智能推荐科室和医生</text>
        </view>
      </view>
    </view>

    <!-- 快速症状选择 -->
    <view class="symptoms-section">
      <view class="section-title">
        <text class="title-text">常见症状</text>
        <text class="title-desc">点击选择您的症状</text>
      </view>
      
      <view class="symptoms-grid">
        <view 
          class="symptom-item" 
          :class="{ active: selectedSymptoms.includes(symptom.key) }"
          v-for="symptom in commonSymptoms" 
          :key="symptom.key"
          @tap="toggleSymptom(symptom.key)"
        >
          <text class="symptom-text">{{ symptom.name }}</text>
        </view>
      </view>
    </view>

    <!-- AI对话区域 -->
    <view class="chat-section">
      <view class="section-title">
        <text class="title-text">症状描述</text>
        <text class="title-desc">详细描述您的不适症状</text>
      </view>
      
      <view class="chat-messages">
        <view 
          class="message-item" 
          :class="message.type"
          v-for="message in chatMessages" 
          :key="message.id"
        >
          <view class="message-content">
            <text class="message-text">{{ message.content }}</text>
            <text class="message-time">{{ message.time }}</text>
          </view>
        </view>
      </view>
      
      <!-- 输入框 -->
      <view class="input-section">
        <view class="input-wrapper">
          <input 
            class="message-input" 
            type="text" 
            placeholder="请详细描述您的症状..."
            v-model="inputMessage"
            @confirm="sendMessage"
          />
          <view class="send-btn" @tap="sendMessage">
            <Send :size="18" color="#00BFCC" />
          </view>
        </view>
      </view>
    </view>

    <!-- AI推荐结果 -->
    <view class="recommendation-section" v-if="recommendations.length > 0">
      <view class="section-title">
        <text class="title-text">AI推荐</text>
        <text class="title-desc">基于您的症状描述</text>
      </view>
      
      <view class="recommendation-list">
        <view 
          class="recommendation-item" 
          v-for="rec in recommendations" 
          :key="rec.id"
          @tap="selectRecommendation(rec)"
        >
          <view class="rec-icon">
              <uni-icons :type="rec.iconType" size="28" :color="rec.color"></uni-icons>
          </view>
          <view class="rec-info">
            <text class="rec-title">{{ rec.department }}</text>
            <text class="rec-desc">{{ rec.reason }}</text>
            <text class="rec-confidence">推荐度：{{ rec.confidence }}%</text>
          </view>
          <view class="rec-action">
            <text class="action-text">立即预约</text>
            <ChevronRight :size="14" color="#00BFCC" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bot, Send, ChevronRight, Heart, Eye, Activity, Users, Zap } from 'lucide-vue-next'

const inputMessage = ref('')
const selectedSymptoms = ref([])

// 常见症状
const commonSymptoms = ref([
  { key: 'fever', name: '发热' },
  { key: 'cough', name: '咳嗽' },
  { key: 'headache', name: '头痛' },
  { key: 'stomachache', name: '腹痛' },
  { key: 'dizzy', name: '头晕' },
  { key: 'fatigue', name: '疲劳' },
  { key: 'nausea', name: '恶心' },
  { key: 'diarrhea', name: '腹泻' }
])

// 聊天消息
const chatMessages = ref([
  {
    id: 1,
    type: 'ai',
    content: '您好！我是AI智能就医助手，请描述您的症状，我将为您推荐合适的科室和医生。',
    time: '刚刚'
  }
])

// AI推荐结果
const recommendations = ref([])

// 切换症状选择
const toggleSymptom = (symptomKey) => {
  const index = selectedSymptoms.value.indexOf(symptomKey)
  if (index > -1) {
    selectedSymptoms.value.splice(index, 1)
  } else {
    selectedSymptoms.value.push(symptomKey)
  }
  
  // 基于选择的症状生成简单推荐
  if (selectedSymptoms.value.length > 0) {
    generateRecommendations()
  }
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  // 添加用户消息
  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value,
    time: new Date().toLocaleTimeString().slice(0, 5)
  }
  
  chatMessages.value.push(userMessage)
  
  // 模拟AI回复
  setTimeout(() => {
    const aiReply = {
      id: Date.now() + 1,
      type: 'ai',
      content: '根据您描述的症状，我推荐您前往以下科室就诊。建议您选择合适的科室进行预约。',
      time: new Date().toLocaleTimeString().slice(0, 5)
    }
    chatMessages.value.push(aiReply)
    generateRecommendations()
  }, 1000)
  
  inputMessage.value = ''
}

// 生成推荐
const generateRecommendations = () => {
  // 基于症状的简单推荐逻辑
  const recs = []
  
  if (selectedSymptoms.value.includes('fever') || selectedSymptoms.value.includes('cough')) {
    recs.push({
      id: 1,
      department: '呼吸内科',
      reason: '发热、咳嗽等呼吸道症状',
      confidence: 85,
      icon: Activity,
      iconType: 'heart-filled',
      color: '#16a34a'
    })
  }
  
  if (selectedSymptoms.value.includes('headache') || selectedSymptoms.value.includes('dizzy')) {
    recs.push({
      id: 2,
      department: '神经内科',
      reason: '头痛、头晕等神经系统症状',
      confidence: 78,
      icon: Heart,
      iconType: 'heart-filled',
      color: '#3b82f6'
    })
  }
  
  if (selectedSymptoms.value.includes('stomachache') || selectedSymptoms.value.includes('nausea')) {
    recs.push({
      id: 3,
      department: '消化内科',
      reason: '腹痛、恶心等消化系统症状',
      confidence: 82,
      icon: Heart,
      iconType: 'heart-filled',
      color: '#dc2626'
    })
  }
  
  recommendations.value = recs
}

// 选择推荐科室
const selectRecommendation = (rec) => {
  uni.showModal({
    title: '预约' + rec.department,
    content: `推荐原因：${rec.reason}\n推荐度：${rec.confidence}%\n\n是否前往预约该科室？`,
    success: (res) => {
      if (res.confirm) {
        // 保存推荐的科室信息
        const deptInfo = {
          id: rec.id,
          name: rec.department,
          description: rec.reason
        }
        uni.setStorageSync('selectedDepartment', deptInfo)
        uni.setStorageSync('appointmentType', '普通门诊')
        
        // 跳转到预约流程
        uni.navigateTo({
          url: '/pages/appointment/select-doctor'
        })
      }
    }
  })
}

onMounted(() => {
  console.log('AI助手页面加载')
})
</script>

<style lang="scss" scoped>
.ai-container {
  background: #f8fafc;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* AI介绍 - 队友风格 */
.ai-intro {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.intro-header {
  display: flex;
  align-items: center;
}

.ai-avatar {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.intro-title {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.intro-desc {
  font-size: 22rpx;
  opacity: 0.9;
  line-height: 1.4;
}

/* 症状选择 - 队友风格 */
.symptoms-section {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 8rpx;
}

.title-desc {
  font-size: 22rpx;
  color: #64748b;
}

.symptoms-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.symptom-item {
  padding: 16rpx 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 20rpx;
  transition: all 0.2s ease;
}

.symptom-item.active {
  background: #00BFCC;
  border-color: #00BFCC;
  color: white;
}

.symptom-text {
  font-size: 24rpx;
  color: #64748b;
}

.symptom-item.active .symptom-text {
  color: white;
}

/* 对话区域 - 队友风格 */
.chat-section {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.chat-messages {
  max-height: 400rpx;
  overflow-y: auto;
  margin-bottom: 24rpx;
}

.message-item {
  margin-bottom: 20rpx;
  display: flex;
}

.message-item.ai {
  justify-content: flex-start;
}

.message-item.user {
  justify-content: flex-end;
}

.message-content {
  max-width: 80%;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  position: relative;
}

.message-item.ai .message-content {
  background: #f0fdff;
  color: #0f172a;
}

.message-item.user .message-content {
  background: #00BFCC;
  color: white;
}

.message-text {
  font-size: 24rpx;
  line-height: 1.4;
  display: block;
  margin-bottom: 8rpx;
}

.message-time {
  font-size: 20rpx;
  opacity: 0.7;
}

.input-section {
  border-top: 1rpx solid #f1f5f9;
  padding-top: 20rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 24rpx;
  padding: 0 24rpx;
  height: 80rpx;
}

.message-input {
  flex: 1;
  font-size: 26rpx;
  color: #0f172a;
  background: transparent;
  border: none;
}

.send-btn {
  margin-left: 16rpx;
  padding: 8rpx;
}

/* 推荐结果 - 队友风格 */
.recommendation-section {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.recommendation-list {
  margin-top: 20rpx;
}

.recommendation-item {
  background: #f8fafc;
  border: 1rpx solid #f1f5f9;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.recommendation-item:last-child {
  margin-bottom: 0;
}

.recommendation-item:active {
  background: #f0fdff;
  border-color: #00BFCC;
  transform: translateY(-1rpx);
}

.rec-icon {
  width: 56rpx;
  height: 56rpx;
  background: #f0fdff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  border: 1rpx solid #00BFCC;
}

.rec-info {
  flex: 1;
}

.rec-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 6rpx;
}

.rec-desc {
  font-size: 22rpx;
  color: #64748b;
  display: block;
  margin-bottom: 6rpx;
}

.rec-confidence {
  font-size: 20rpx;
  color: #16a34a;
  font-weight: 500;
}

.rec-action {
  display: flex;
  align-items: center;
  background: #f0fdff;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  border: 1rpx solid #00BFCC;
}

.action-text {
  font-size: 22rpx;
  color: #00BFCC;
  font-weight: 500;
  margin-right: 8rpx;
}
</style>