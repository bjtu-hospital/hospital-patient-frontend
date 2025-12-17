<template>
  <view class="ai-bot-wrapper" v-if="isLoggedIn">
    <!-- 悬浮球 -->
    <view 
      v-if="!isExpanded && isVisible" 
      class="floating-ball" 
      :style="ballStyle"
      @click="onBallClick"
      @longpress="showCloseOption"
      @touchstart.stop="onBallDragStart"
      @touchmove.stop.prevent="onBallDragMove"
      @touchend.stop="onBallDragEnd"
      @mousedown.stop="onBallDragStart"
    >
      <view class="ball-inner" :class="{ 'ball-dragging': isBallDragging }">
        <uni-icons type="headphones" size="26" color="#fff"></uni-icons>
      </view>
      <view class="ball-ripple" v-if="!isBallDragging"></view>
      <view class="ball-hint" v-if="showBallHint">
        <text>拖动调整位置</text>
      </view>
    </view>

    <!-- 聊天窗口 -->
    <view v-if="isExpanded" class="chat-window" :style="windowStyle" :class="{ 'window-dragging': isWindowDragging }">
      <!-- 头部 - 可拖动 -->
      <view 
        class="chat-header"
        @touchstart.stop="onWindowDragStart"
        @touchmove.stop.prevent="onWindowDragMove"
        @touchend.stop="onWindowDragEnd"
        @mousedown.stop="onWindowDragStart"
      >
        <view class="header-left">
          <view class="ai-avatar">
            <uni-icons type="headphones" size="20" color="#fff"></uni-icons>
          </view>
          <view class="header-info">
            <text class="header-title">智能导诊助手</text>
            <text class="header-subtitle">小北在线为您服务</text>
          </view>
        </view>
        <view class="header-actions">
          <view class="action-btn" hover-class="action-btn-hover" @click.stop="clearHistory">
            <uni-icons type="trash" size="18" color="#64748b"></uni-icons>
          </view>
          <view class="action-btn close-btn" hover-class="action-btn-hover" @click.stop="toggleExpand">
            <uni-icons type="closeempty" size="18" color="#64748b"></uni-icons>
          </view>
        </view>
        <view class="drag-indicator">
          <view class="drag-line"></view>
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
            <text class="welcome-title">您好！我是小北</text>
            <text class="welcome-desc">北医三院智能导诊助手，可以帮您症状分诊、预约挂号、查询健康档案</text>
            <view class="quick-actions">
              <view class="quick-btn" hover-class="quick-btn-hover" @click="quickAsk('我头疼应该挂什么科')">
                <text>🩺 症状问诊</text>
              </view>
              <view class="quick-btn" hover-class="quick-btn-hover" @click="quickAsk('帮我预约北医三院的内科')">
                <text>📅 快速预约</text>
              </view>
              <view class="quick-btn" hover-class="quick-btn-hover" @click="quickAsk('查看我的预约')">
                <text>📋 我的预约</text>
              </view>
              <view class="quick-btn" hover-class="quick-btn-hover" @click="quickAsk('查看我的健康档案')">
                <text>💊 健康档案</text>
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
      tokenExists: false,
      
      // 悬浮球拖动相关
      ballPosition: { x: 0, y: 0 },
      ballStartPos: { x: 0, y: 0 },
      ballTouchStart: { x: 0, y: 0 },
      isBallDragging: false,
      ballMoved: false,
      showBallHint: false,
      
      // 窗口拖动相关
      windowPosition: { x: 0, y: 0 },
      windowStartPos: { x: 0, y: 0 },
      windowTouchStart: { x: 0, y: 0 },
      isWindowDragging: false,
      
      // 屏幕尺寸
      screenWidth: 375,
      screenHeight: 667,
      
      // 组件尺寸
      ballSize: 50, // rpx转px后约50
      windowWidth: 340, // rpx转px后约340
      windowHeight: 450
    };
  },
  created() {
    this.checkLoginStatus();
    this.getScreenSize();
  },
  mounted() {
    this.checkLoginInterval = setInterval(() => {
      this.checkLoginStatus();
    }, 1000);
    
    // 初始化悬浮球位置（右下角）
    this.$nextTick(() => {
      this.ballPosition = {
        x: this.screenWidth - this.ballSize - 15,
        y: this.screenHeight - this.ballSize - 120
      };
      // 初始化窗口位置（居中偏下）
      this.windowPosition = {
        x: (this.screenWidth - this.windowWidth) / 2,
        y: (this.screenHeight - this.windowHeight) / 2
      };
    });
    
    // 首次显示拖动提示
    setTimeout(() => {
      if (!uni.getStorageSync('ai_ball_hint_shown')) {
        this.showBallHint = true;
        setTimeout(() => {
          this.showBallHint = false;
          uni.setStorageSync('ai_ball_hint_shown', true);
        }, 3000);
      }
    }, 2000);
  },
  beforeUnmount() {
    if (this.checkLoginInterval) {
      clearInterval(this.checkLoginInterval);
    }
    // 清理可能残留的鼠标事件监听
    document.removeEventListener('mousemove', this.onBallDragMove);
    document.removeEventListener('mouseup', this.onBallDragEnd);
    document.removeEventListener('mousemove', this.onWindowDragMove);
    document.removeEventListener('mouseup', this.onWindowDragEnd);
  },
  computed: {
    isLoggedIn() {
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
    },
    ballStyle() {
      return {
        left: `${this.ballPosition.x}px`,
        top: `${this.ballPosition.y}px`,
        transition: this.isBallDragging ? 'none' : 'left 0.3s ease, top 0.3s ease'
      };
    },
    windowStyle() {
      return {
        left: `${this.windowPosition.x}px`,
        top: `${this.windowPosition.y}px`,
        transition: this.isWindowDragging ? 'none' : 'left 0.2s ease, top 0.2s ease'
      };
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
    getScreenSize() {
      const info = uni.getSystemInfoSync();
      this.screenWidth = info.windowWidth;
      this.screenHeight = info.windowHeight;
      // 根据屏幕宽度计算组件实际尺寸
      const ratio = info.windowWidth / 375;
      this.ballSize = 50 * ratio;
      this.windowWidth = 340 * ratio;
      this.windowHeight = 450 * ratio;
    },
    
    // ========== 获取事件坐标（兼容触屏和鼠标）==========
    getEventPosition(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.clientX !== undefined) {
        return { x: e.clientX, y: e.clientY };
      }
      return { x: 0, y: 0 };
    },
    
    // ========== 悬浮球拖动 ==========
    onBallDragStart(e) {
      const pos = this.getEventPosition(e);
      this.ballTouchStart = { x: pos.x, y: pos.y };
      this.ballStartPos = { ...this.ballPosition };
      this.ballMoved = false;
      
      // 鼠标事件需要绑定到document
      if (e.type === 'mousedown') {
        document.addEventListener('mousemove', this.onBallDragMove);
        document.addEventListener('mouseup', this.onBallDragEnd);
      }
    },
    onBallDragMove(e) {
      const pos = this.getEventPosition(e);
      const deltaX = pos.x - this.ballTouchStart.x;
      const deltaY = pos.y - this.ballTouchStart.y;
      
      // 判断是否真正移动了（超过5px才算拖动）
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        this.isBallDragging = true;
        this.ballMoved = true;
      }
      
      if (this.isBallDragging) {
        let newX = this.ballStartPos.x + deltaX;
        let newY = this.ballStartPos.y + deltaY;
        
        // 边界检测
        newX = Math.max(0, Math.min(newX, this.screenWidth - this.ballSize));
        newY = Math.max(0, Math.min(newY, this.screenHeight - this.ballSize - 50));
        
        this.ballPosition = { x: newX, y: newY };
      }
    },
    onBallDragEnd() {
      if (this.isBallDragging) {
        // 自动吸附到左右两侧
        const centerX = this.ballPosition.x + this.ballSize / 2;
        if (centerX < this.screenWidth / 2) {
          this.ballPosition.x = 10;
        } else {
          this.ballPosition.x = this.screenWidth - this.ballSize - 10;
        }
      }
      this.isBallDragging = false;
      
      // 移除鼠标事件监听
      document.removeEventListener('mousemove', this.onBallDragMove);
      document.removeEventListener('mouseup', this.onBallDragEnd);
    },
    onBallClick() {
      // 只有没有拖动时才触发点击
      if (!this.ballMoved) {
        this.toggleExpand();
      }
    },
    
    // ========== 窗口拖动 ==========
    onWindowDragStart(e) {
      const pos = this.getEventPosition(e);
      this.windowTouchStart = { x: pos.x, y: pos.y };
      this.windowStartPos = { ...this.windowPosition };
      
      // 鼠标事件需要绑定到document
      if (e.type === 'mousedown') {
        document.addEventListener('mousemove', this.onWindowDragMove);
        document.addEventListener('mouseup', this.onWindowDragEnd);
      }
    },
    onWindowDragMove(e) {
      const pos = this.getEventPosition(e);
      const deltaX = pos.x - this.windowTouchStart.x;
      const deltaY = pos.y - this.windowTouchStart.y;
      
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.isWindowDragging = true;
      }
      
      if (this.isWindowDragging) {
        let newX = this.windowStartPos.x + deltaX;
        let newY = this.windowStartPos.y + deltaY;
        
        // 边界检测（允许部分超出屏幕）
        newX = Math.max(-this.windowWidth * 0.3, Math.min(newX, this.screenWidth - this.windowWidth * 0.7));
        newY = Math.max(0, Math.min(newY, this.screenHeight - 100));
        
        this.windowPosition = { x: newX, y: newY };
      }
    },
    onWindowDragEnd() {
      this.isWindowDragging = false;
      
      // 移除鼠标事件监听
      document.removeEventListener('mousemove', this.onWindowDragMove);
      document.removeEventListener('mouseup', this.onWindowDragEnd);
    },
    
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        // 展开时，将窗口定位到悬浮球附近或居中
        this.windowPosition = {
          x: Math.max(10, Math.min(this.ballPosition.x - this.windowWidth + this.ballSize, this.screenWidth - this.windowWidth - 10)),
          y: Math.max(10, this.ballPosition.y - this.windowHeight - 10)
        };
        // 如果窗口超出顶部，放到球的下方
        if (this.windowPosition.y < 10) {
          this.windowPosition.y = Math.min(this.ballPosition.y + this.ballSize + 10, this.screenHeight - this.windowHeight - 50);
        }
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
      uni.showModal({
        title: '清空对话',
        content: '确定要清空当前对话记录吗？',
        success: (res) => {
          if (res.confirm) {
            contextManager.clearContext();
            uni.showToast({ title: '已清空', icon: 'success' });
          }
        }
      });
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
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  
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
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &.ball-dragging {
      transform: scale(1.1);
      box-shadow: 0 12rpx 40rpx rgba(0, 213, 217, 0.6);
    }
  }
  
  .ball-ripple {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: rgba(0, 213, 217, 0.3);
    animation: ripple 2s infinite;
  }
  
  .ball-hint {
    position: absolute;
    top: -60rpx;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.75);
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
    white-space: nowrap;
    animation: fadeInOut 3s ease;
    
    text {
      font-size: 22rpx;
      color: #fff;
    }
  }
  
  @keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
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
  width: 680rpx;
  height: 900rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  &.window-dragging {
    box-shadow: 0 30rpx 80rpx rgba(0, 0, 0, 0.25);
    opacity: 0.95;
  }
}

// 头部
.chat-header {
  padding: 24rpx 28rpx;
  padding-bottom: 32rpx;
  background: $primary-gradient;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  
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
  
  .drag-indicator {
    position: absolute;
    bottom: 8rpx;
    left: 50%;
    transform: translateX(-50%);
    
    .drag-line {
      width: 60rpx;
      height: 6rpx;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 3rpx;
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
  padding: 40rpx 20rpx;
  
  .welcome-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: $primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
  }
  
  .welcome-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12rpx;
  }
  
  .welcome-desc {
    font-size: 24rpx;
    color: #64748b;
    text-align: center;
    margin-bottom: 32rpx;
    line-height: 1.5;
    padding: 0 20rpx;
  }
  
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    justify-content: center;
    
    .quick-btn {
      padding: 16rpx 24rpx;
      background: #fff;
      border-radius: 32rpx;
      border: 2rpx solid #e2e8f0;
      transition: all 0.2s ease;
      
      text {
        font-size: 24rpx;
        color: #334155;
      }
    }
    
    .quick-btn-hover {
      background: $primary-light;
      border-color: $primary-color;
      transform: scale(0.98);
    }
  }
}

// 消息样式
.message-item {
  display: flex;
  margin-bottom: 24rpx;
  animation: messageSlideIn 0.3s ease;
  
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(20rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
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
      white-space: pre-wrap;
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
