<template>
  <view class="basic-info-section">
    <view class="section-header">
      <text class="section-title">基本信息</text>
      <button class="edit-btn" @tap="handleEdit" v-if="showEdit">
        <uni-icons type="compose" size="18" color="#00BFCC"></uni-icons>
        <text>编辑</text>
      </button>
    </view>

    <view class="info-card" v-if="patientInfo">
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">姓名</text>
          <text class="info-value">{{ patientInfo.name || '-' }}</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">性别</text>
          <text class="info-value">{{ patientInfo.gender || '-' }}</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">年龄</text>
          <text class="info-value">{{ patientInfo.age || '-' }}岁</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">身高</text>
          <text class="info-value">{{ patientInfo.height || '-' }}cm</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">体重</text>
          <text class="info-value">{{ patientInfo.weight || '-' }}kg</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">血型</text>
          <text class="info-value">{{ patientInfo.bloodType || '-' }}</text>
        </view>
        
        <view class="info-item full-width">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ patientInfo.phone || '-' }}</text>
        </view>
        
        <view class="info-item full-width">
          <text class="info-label">身份证号</text>
          <text class="info-value">{{ patientInfo.idCard || '-' }}</text>
        </view>
        
        <view class="info-item full-width">
          <text class="info-label">居住地址</text>
          <text class="info-value">{{ patientInfo.address || '-' }}</text>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <uni-icons type="info" size="40" color="#ccc"></uni-icons>
      <text class="empty-text">暂无基本信息</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  patientInfo: {
    type: Object,
    default: null
  },
  showEdit: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit'])

const handleEdit = () => {
  emit('edit', props.patientInfo)
  uni.navigateTo({
    url: '/pages/profile/health/basic-info'
  })
}
</script>

<style lang="scss" scoped>
.basic-info-section {
  margin-bottom: 24rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    background: white;
    border-radius: 16rpx 16rpx 0 0;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .edit-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 24rpx;
      background: #f0f9ff;
      border: 1rpx solid #00BFCC;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: #00BFCC;
      
      &::after {
        border: none;
      }
    }
  }
  
  .info-card {
    background: white;
    padding: 24rpx;
    border-radius: 0 0 16rpx 16rpx;
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32rpx 24rpx;
      
      .info-item {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
        
        &.full-width {
          grid-column: 1 / -1;
        }
        
        .info-label {
          font-size: 26rpx;
          color: #999;
        }
        
        .info-value {
          font-size: 30rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
  
  .empty-state {
    background: white;
    padding: 80rpx 24rpx;
    border-radius: 0 0 16rpx 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
