<template>
  <view class="medical-history-section">
    <view class="section-header">
      <text class="section-title">病史信息</text>
    </view>

    <view class="history-card" v-if="medicalHistory">
      <!-- 既往病史 -->
      <view class="history-block">
        <view class="block-header">
          <uni-icons type="compose" size="20" color="#00BFCC"></uni-icons>
          <text class="block-title">既往病史</text>
        </view>
        <view class="history-list" v-if="medicalHistory.pastHistory && medicalHistory.pastHistory.length > 0">
          <view class="history-item" v-for="(item, index) in medicalHistory.pastHistory" :key="index">
            <text class="item-dot">•</text>
            <text class="item-text">{{ item }}</text>
          </view>
        </view>
        <view class="empty-tip" v-else>
          <text>暂无既往病史</text>
        </view>
      </view>

      <!-- 过敏史 -->
      <view class="history-block">
        <view class="block-header">
          <uni-icons type="heart" size="20" color="#ef4444"></uni-icons>
          <text class="block-title">过敏史</text>
        </view>
        <view class="history-list" v-if="medicalHistory.allergyHistory && medicalHistory.allergyHistory.length > 0">
          <view class="history-item allergy" v-for="(item, index) in medicalHistory.allergyHistory" :key="index">
            <text class="item-dot">⚠️</text>
            <text class="item-text">{{ item }}</text>
          </view>
        </view>
        <view class="empty-tip" v-else>
          <text>暂无过敏史</text>
        </view>
      </view>

      <!-- 家族病史 -->
      <view class="history-block">
        <view class="block-header">
          <uni-icons type="person" size="20" color="#8b5cf6"></uni-icons>
          <text class="block-title">家族病史</text>
        </view>
        <view class="history-list" v-if="medicalHistory.familyHistory && medicalHistory.familyHistory.length > 0">
          <view class="history-item" v-for="(item, index) in medicalHistory.familyHistory" :key="index">
            <text class="item-dot">•</text>
            <text class="item-text">{{ item }}</text>
          </view>
        </view>
        <view class="empty-tip" v-else>
          <text>暂无家族病史</text>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <uni-icons type="info" size="40" color="#ccc"></uni-icons>
      <text class="empty-text">暂无病史信息</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  medicalHistory: {
    type: Object,
    default: null
  }
})
</script>

<style lang="scss" scoped>
.medical-history-section {
  margin-bottom: 24rpx;
  
  .section-header {
    padding: 24rpx;
    background: white;
    border-radius: 16rpx 16rpx 0 0;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .history-card {
    background: white;
    padding: 24rpx;
    border-radius: 0 0 16rpx 16rpx;
    
    .history-block {
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .block-header {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 16rpx;
        padding-bottom: 12rpx;
        border-bottom: 2rpx solid #f0f0f0;
        
        .block-title {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }
      }
      
      .history-list {
        display: flex;
        flex-direction: column;
        gap: 16rpx;
        
        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 12rpx;
          padding: 16rpx;
          background: #f8fafc;
          border-radius: 8rpx;
          
          &.allergy {
            background: #fef2f2;
            
            .item-text {
              color: #dc2626;
            }
          }
          
          .item-dot {
            font-size: 28rpx;
            color: #00BFCC;
            line-height: 1.5;
            flex-shrink: 0;
          }
          
          .item-text {
            flex: 1;
            font-size: 28rpx;
            color: #666;
            line-height: 1.6;
          }
        }
      }
      
      .empty-tip {
        padding: 24rpx;
        text-align: center;
        font-size: 26rpx;
        color: #999;
        background: #f8fafc;
        border-radius: 8rpx;
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
