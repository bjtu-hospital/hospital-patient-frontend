<template>
  <view class="ai-bot-wrapper" v-if="isLoggedIn">
    <!-- 悬浮球 -->
    <view 
      v-if="!isExpanded && isVisible" 
      class="floating-ball" 
      @click="toggleExpand"
      @longpress="showCloseOption"
    >
      <view class="ball-inner">
        <uni-icons type="headphones" size="26" color="#fff"></uni-icons>
      </view>
      <view class="ball-ripple"></view>
    </view>

    <!-- 聊天窗口 -->
    <view v-if="isExpanded" class="chat-window">
      <!-- 头部 -->
      <view class="chat-header">
        <view class="header-left">
          <view class="ai-avatar">
            <uni-icons type="headphones" size="20" color="#fff"></uni-icons>
          </view>
          <view class="header-info">
            <text class="header-title">AI 智能助手</text>
            <text class="header-subtitle">在线为您服务</text>
          </view>
        </view>
        <view class="header-actions">
          <view class="action-btn" hover-class="action-btn-hover" @click="clearHistory">
            <uni-icons type="trash" size="18" color="#64748b"></uni-icons>
          </view>
          <view class="action-btn close-btn" hover-class="action-btn-hover" @click="toggleExpand">
            <uni-icons type="closeempty" size="18" color="#64748b"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 消息区域 -->
      <scroll-view 
        class="chat-body" 
        scroll-y="true"
        :scroll-top="scrollTop"
        :scroll-with-animation="true"
        @scrolltoupper="onScrollToUpper"
      >
        <view class="messages-container">
          <!-- 欢迎消息 -->
          <view v-if="displayMessages.length === 0" class="welcome-section">
            <view class="welcome-icon">
              <uni-icons type="heart" size="40" color="#00D5D9"></uni-icons>
            </view>
            <text class="welcome-title">您好！我是AI智能助手</text>
            <text class="welcome-desc">可以帮您查询科室、医生信息，以及管理预约</text>
            <view class="quick-actions">
              <view class="quick-btn" hover-class="quick-btn-hover" @click="quickAsk('帮我查询有哪些科室')">
                <text>🏥 查询科室</text>
              </view>
              <view class="quick-btn" hover-class="quick-btn-hover" @click="quickAsk('帮我查询我的预约')">
                <text>📅 我的预约</text>
              </view>
              <view class="quick-btn" hover-class="quick-btn-hover" @click="quickAsk('帮我找一位内科医生')">
                <text>👨‍⚕️ 找医生</text>
              </view>
            </view>
          </view>

          <!-- 消息列表 -->
          <view 
            v-for="(msg, index) in displayMessages" 
            :key="index" 
            :class="['message-item', msg.role === 'user' ? 'user-message' : 'ai-message']"
          >
            <view v-if="msg.role === 'assistant'" class="message-avatar">
              <uni-icons type="headphones" size="16" color="#fff"></uni-icons>
            </view>
            <view class="message-bubble">
              <text class="message-text" selectable>{{ msg.content }}</text>
              <!-- 操作按钮 -->
              <view v-if="msg.action" class="action-link" hover-class="action-link-hover" @click="handleAction(msg.action)">
                <uni-icons type="right" size="14" color="#00D5D9"></uni-icons>
                <text class="link-text">点击前往预约</text>
              </view>
            </view>
          </view>

          <!-- 加载中 -->
          <view v-if="isLoading" class="message-item ai-message">
            <view class="message-avatar">
              <uni-icons type="headphones" size="16" color="#fff"></uni-icons>
            </view>
            <view class="message-bubble loading-bubble">
              <view class="typing-indicator">
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
                <view class="typing-dot"></view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 输入区域 -->
      <view class="chat-footer">
        <view class="input-wrapper">
          <input 
            class="message-input" 
            v-model="inputText" 
            placeholder="请输入您的问题..." 
            placeholder-class="input-placeholder"
            :adjust-position="true"
            confirm-type="send"
            @confirm="sendMessage"
          />
        </view>
        <view 
          class="send-btn" 
          :class="{ 'send-btn-active': inputText.trim() }"
          hover-class="send-btn-hover"
          @click="sendMessage"
        >
          <uni-icons type="paperplane" size="20" :color="inputText.trim() ? '#fff' : '#94a3b8'"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 关闭确认弹窗 -->
    <view v-if="showCloseConfirm" class="modal-overlay" @click="showCloseConfirm = false">
      <view class="modal-dialog" @click.stop>
        <view class="modal-header">
          <uni-icons type="info" size="24" color="#f59e0b"></uni-icons>
        </view>
        <text class="modal-title">关闭 AI 助手？</text>
        <text class="modal-desc">长按悬浮球可再次打开</text>
        <view class="modal-buttons">
          <view class="modal-btn cancel-btn" hover-class="modal-btn-hover" @click="showCloseConfirm = false">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm-btn" hover-class="modal-btn-hover" @click="closeBot">
            <text>确定关闭</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import contextManager from './context-manager.js';
import { useUserStore } from '@/stores/user';
import { computed, ref } from 'vue';

export default {
  data() {
    return {
      isExpanded: false,
      isVisible: true,
      inputText: '',
      isLoading: false,
      scrollTop: 0,
      showCloseConfirm: false,
      checkLoginInterval: null,
      tokenExists: false
    };
  },
  created() {
    // 初始检查登录状态
    this.checkLoginStatus();
  },
  mounted() {
    // 定期检查登录状态（处理登录/登出后的状态变化）
    this.checkLoginInterval = setInterval(() => {
      this.checkLoginStatus();
    }, 1000);
  },
  beforeUnmount() {
    if (this.checkLoginInterval) {
      clearInterval(this.checkLoginInterval);
    }
  },
  computed: {
    isLoggedIn() {
      // 使用 data 中的 tokenExists 来保持响应式
      return this.tokenExists;
    },
    displayMessages() {
      return contextManager.messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => {
        const navMatch = m.content && m.content.match(/\[NAVIGATE:(.*?)\]/);
        let content = m.content;
        let action = null;
        
        if (navMatch) {
          content = content.replace(navMatch[0], '').trim();
          action = navMatch[1];
        }
        
        return {
          role: m.role,
          content: content,
          action: action
        };
      });
    }
  },
  watch: {
    'displayMessages.length'() {
      if (this.isExpanded) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    showCloseOption() {
      this.showCloseConfirm = true;
    },
    closeBot() {
      this.isVisible = false;
      this.showCloseConfirm = false;
    },
    async sendMessage() {
      if (!this.inputText.trim() || this.isLoading) return;

      const text = this.inputText;
      this.inputText = '';
      this.isLoading = true;
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        await contextManager.sendMessage(text);
      } catch (e) {
        console.error(e);
      } finally {
        this.isLoading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    quickAsk(question) {
      this.inputText = question;
      this.sendMessage();
    },
    clearHistory() {
      contextManager.clearContext();
    },
    handleAction(url) {
      uni.navigateTo({
        url: url,
        fail: () => {
          uni.switchTab({ url: url });
        }
      });
    },
    scrollToBottom() {
      this.scrollTop = this.scrollTop === 99998 ? 99999 : 99998;
    },
    onScrollToUpper() {
      // 可以在这里加载更多历史消息
    },
    checkLoginStatus() {
      // 检查本地存储中的 token
      const token = uni.getStorageSync('token');
      this.tokenExists = !!token;
    }
  }
};
</script>

<style lang="scss" scoped>
// 医院主题色
$primary-color: #00D5D9;
$primary-light: #E8F8F9;
$primary-gradient: linear-gradient(135deg, #00D5D9 0%, #00B3BA 100%);

.ai-bot-wrapper {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.floating-ball, .chat-window, .modal-overlay {
  pointer-events: auto;
}

// 悬浮球
.floating-ball {
  position: fixed;
  bottom: 120rpx;
  right: 30rpx;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .ball-inner {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: $primary-gradient;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 32rpx rgba(0, 213, 217, 0.4);
    z-index: 2;
  }
  
  .ball-ripple {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: rgba(0, 213, 217, 0.3);
    animation: ripple 2s infinite;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
}

// 聊天窗口
.chat-window {
  position: fixed;
  bottom: 30rpx;
  right: 30rpx;
  width: 680rpx;
  height: 900rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 头部
.chat-header {
  padding: 24rpx 28rpx;
  background: $primary-gradient;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .ai-avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .header-info {
      display: flex;
      flex-direction: column;
      
      .header-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #fff;
      }
      
      .header-subtitle {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 4rpx;
      }
    }
  }
  
  .header-actions {
    display: flex;
    gap: 16rpx;
    
    .action-btn {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    .action-btn-hover {
      background: rgba(255, 255, 255, 0.7);
    }
  }
}

// 消息区域
.chat-body {
  flex: 1;
  background: linear-gradient(180deg, #f8fafa 0%, #f0f5f5 100%);
  height: 0; // 关键：让 flex: 1 生效并启用滚动
}

.messages-container {
  padding: 24rpx;
  min-height: 100%;
}

// 欢迎区域
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 20rpx;
  
  .welcome-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: $primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
  }
  
  .welcome-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12rpx;
  }
  
  .welcome-desc {
    font-size: 26rpx;
    color: #64748b;
    text-align: center;
    margin-bottom: 40rpx;
  }
  
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    justify-content: center;
    
    .quick-btn {
      padding: 16rpx 28rpx;
      background: #fff;
      border-radius: 32rpx;
      border: 2rpx solid #e2e8f0;
      
      text {
        font-size: 26rpx;
        color: #334155;
      }
    }
    
    .quick-btn-hover {
      background: $primary-light;
      border-color: $primary-color;
    }
  }
}

// 消息样式
.message-item {
  display: flex;
  margin-bottom: 24rpx;
  
  .message-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: $primary-gradient;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 16rpx;
  }
  
  .message-bubble {
    max-width: 480rpx;
    padding: 20rpx 28rpx;
    border-radius: 20rpx;
    
    .message-text {
      font-size: 28rpx;
      line-height: 1.6;
      word-break: break-word;
    }
  }
  
  &.user-message {
    justify-content: flex-end;
    
    .message-bubble {
      background: $primary-gradient;
      border-bottom-right-radius: 6rpx;
      
      .message-text {
        color: #fff;
      }
    }
  }
  
  &.ai-message {
    justify-content: flex-start;
    
    .message-bubble {
      background: #fff;
      border-bottom-left-radius: 6rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      
      .message-text {
        color: #1e293b;
      }
    }
  }
  
  .action-link {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 16rpx;
    padding: 12rpx 20rpx;
    background: $primary-light;
    border-radius: 12rpx;
    
    .link-text {
      font-size: 24rpx;
      color: $primary-color;
      font-weight: 500;
    }
  }
  
  .action-link-hover {
    background: darken($primary-light, 5%);
  }
}

// 加载动画
.loading-bubble {
  padding: 24rpx 32rpx !important;
}

.typing-indicator {
  display: flex;
  gap: 8rpx;
  
  .typing-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: $primary-color;
    animation: typing 1.4s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
  
  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-8rpx);
      opacity: 1;
    }
  }
}

// 输入区域
.chat-footer {
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 2rpx solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 16rpx;
  
  .input-wrapper {
    flex: 1;
    background: #f1f5f9;
    border-radius: 40rpx;
    padding: 0 28rpx;
    
    .message-input {
      width: 100%;
      height: 72rpx;
      font-size: 28rpx;
      color: #1e293b;
    }
    
    .input-placeholder {
      color: #94a3b8;
    }
  }
  
  .send-btn {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &.send-btn-active {
      background: $primary-gradient;
    }
  }
  
  .send-btn-hover {
    transform: scale(0.95);
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-dialog {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .modal-header {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #fef3c7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
  }
  
  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12rpx;
  }
  
  .modal-desc {
    font-size: 26rpx;
    color: #64748b;
    margin-bottom: 40rpx;
  }
  
  .modal-buttons {
    display: flex;
    gap: 24rpx;
    width: 100%;
    
    .modal-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        font-size: 28rpx;
        font-weight: 500;
      }
    }
    
    .cancel-btn {
      background: #f1f5f9;
      
      text {
        color: #64748b;
      }
    }
    
    .confirm-btn {
      background: $primary-gradient;
      
      text {
        color: #fff;
      }
    }
    
    .modal-btn-hover {
      opacity: 0.8;
    }
  }
}
</style>
