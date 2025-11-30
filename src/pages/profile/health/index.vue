<template>
  <view class="health-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的健康档案</text>
      <button class="refresh-btn" @tap="refreshData" :disabled="loading">
        <uni-icons 
          type="refreshempty" 
          size="20" 
          color="#00BFCC"
          :class="{ rotating: loading }"
        ></uni-icons>
      </button>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading && !healthData" class="loading-container">
      <uni-icons type="spinner-cycle" size="40" color="#00BFCC"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 主内容 -->
    <view v-else-if="healthData" class="health-content">
      <!-- 基本信息 -->
      <BasicInfo 
        :patient-info="healthData.basicInfo"
        :show-edit="true"
        @edit="handleEdit"
      />

      <!-- 病史信息 -->
      <MedicalHistory :medical-history="healthData.medicalHistory" />

      <!-- 就诊记录 -->
      <ConsultationRecords 
        :records="healthData.consultationRecords"
        :is-patient-view="true"
      />
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <uni-icons type="info" size="60" color="#ddd"></uni-icons>
      <text class="empty-text">暂无健康档案数据</text>
      <button class="retry-btn" @tap="refreshData">
        <text>重新加载</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyHealthRecord } from '@/api/health'
import BasicInfo from './components/BasicInfo.vue'
import MedicalHistory from './components/MedicalHistory.vue'
import ConsultationRecords from './components/ConsultationRecords.vue'

const loading = ref(false)
const healthData = ref(null)

const loadHealthData = async () => {
  try {
    loading.value = true
    const data = await getMyHealthRecord()
    healthData.value = data
    console.log('✅ 健康档案加载成功:', data)
  } catch (error) {
    console.error('❌ 获取健康档案失败:', error)
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadHealthData()
}

const handleEdit = (info) => {
  console.log('编辑基本信息:', info)
  // 编辑功能保留接口，具体实现可以后续完善
}

onMounted(() => {
  loadHealthData()
})
</script>

<style lang="scss" scoped>
.health-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 24rpx;
    margin: -24rpx -24rpx 24rpx -24rpx;
    background: linear-gradient(135deg, #00BFCC 0%, #008c99 100%);
    
    .page-title {
      font-size: 38rpx;
      font-weight: 600;
      color: white;
      letter-spacing: 1rpx;
    }
    
    .refresh-btn {
      padding: 12rpx;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &::after {
        border: none;
      }
      
      &:disabled {
        opacity: 0.6;
      }
      
      .rotating {
        animation: rotate 1s linear infinite;
      }
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    gap: 16rpx;
    
    .loading-text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .health-content {
    // 组件样式在各自组件中定义
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    gap: 24rpx;
    
    .empty-text {
      font-size: 30rpx;
      color: #999;
    }
    
    .retry-btn {
      padding: 20rpx 48rpx;
      background: #00BFCC;
      border: none;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: white;
      
      &::after {
        border: none;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
