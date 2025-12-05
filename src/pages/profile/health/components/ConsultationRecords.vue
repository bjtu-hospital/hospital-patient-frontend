<template>
  <view class="consultation-records-section">
    <view class="section-header">
      <text class="section-title">就诊记录</text>
      <text class="record-count" v-if="records && records.length > 0">
        共 {{ records.length }} 条
      </text>
    </view>

    <view class="records-list" v-if="records && records.length > 0">
      <view 
        class="record-card" 
        v-for="record in records" 
        :key="record.id"
        @tap="viewRecordDetail(record.id)"
      >
        <view class="record-header">
          <view class="header-left">
            <text class="outpatient-no">{{ record.outpatientNo }}</text>
            <view class="status-badge" :class="record.status">
              <text>{{ getStatusText(record.status) }}</text>
            </view>
          </view>
          <text class="visit-date">{{ record.visitDate }}</text>
        </view>

        <view class="record-body">
          <view class="info-row">
            <view class="info-item">
              <uni-icons type="home" size="16" color="#666"></uni-icons>
              <text class="info-text">{{ record.department }}</text>
            </view>
          </view>
          
          <view class="info-row">
            <view class="info-item">
              <uni-icons type="person" size="16" color="#666"></uni-icons>
              <text class="info-text">{{ record.doctorName }}</text>
            </view>
          </view>
          
          <view class="complaint-box">
            <text class="complaint-label">主诉：</text>
            <text class="complaint-text">{{ record.chiefComplaint }}</text>
          </view>
          
          <view class="diagnosis-box">
            <text class="diagnosis-label">诊断：</text>
            <text class="diagnosis-text">{{ record.diagnosis }}</text>
          </view>
        </view>

        <view class="record-footer">
          <view class="footer-actions">
            <button class="action-btn primary" @tap.stop="viewRecordDetail(record.id)">
              <uni-icons type="eye" size="16" color="#00BFCC"></uni-icons>
              <text>查看详情</text>
            </button>
            <button 
              class="action-btn" 
              v-if="record.pdfUrl" 
              @tap.stop="previewPdf(record.pdfUrl)"
            >
              <uni-icons type="paperplane" size="16" color="#666"></uni-icons>
              <text>查看病历单</text>
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <uni-icons type="list" size="60" color="#ddd"></uni-icons>
      <text class="empty-text">暂无就诊记录</text>
      <text class="empty-tip">您的就诊记录将在这里显示</text>
    </view>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  },
  isPatientView: {
    type: Boolean,
    default: false
  }
})

const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'ongoing': '进行中',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

const viewRecordDetail = (recordId) => {
  uni.navigateTo({
    url: `/pages/profile/health/medical-record/detail?recordId=${recordId}`
  })
}

const previewPdf = (pdfUrl) => {
  if (!pdfUrl) {
    uni.showToast({
      title: '暂无病历单',
      icon: 'none'
    })
    return
  }
  
  // H5端使用新窗口打开PDF
  // #ifdef H5
  window.open(pdfUrl, '_blank')
  // #endif
  
  // 小程序端使用下载
  // #ifndef H5
  uni.showLoading({ title: '加载中...' })
  uni.downloadFile({
    url: pdfUrl,
    success: (res) => {
      uni.hideLoading()
      if (res.statusCode === 200) {
        const filePath = res.tempFilePath
        uni.openDocument({
          filePath: filePath,
          fileType: 'pdf',
          success: () => {
            console.log('打开文档成功')
          },
          fail: (err) => {
            console.error('打开文档失败:', err)
            uni.showToast({
              title: '无法打开PDF文件',
              icon: 'none'
            })
          }
        })
      }
    },
    fail: (err) => {
      uni.hideLoading()
      console.error('下载PDF失败:', err)
      uni.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  })
  // #endif
}
</script>

<style lang="scss" scoped>
.consultation-records-section {
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
    
    .record-count {
      font-size: 26rpx;
      color: #999;
    }
  }
  
  .records-list {
    background: white;
    padding: 0 24rpx 24rpx;
    border-radius: 0 0 16rpx 16rpx;
    
    .record-card {
      margin-top: 24rpx;
      padding: 24rpx;
      background: #f8fafc;
      border-radius: 12rpx;
      border: 2rpx solid #e5e7eb;
      transition: all 0.3s;
      
      &:active {
        background: #f1f5f9;
        transform: scale(0.98);
      }
      
      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;
        padding-bottom: 16rpx;
        border-bottom: 2rpx solid #e5e7eb;
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 12rpx;
          
          .outpatient-no {
            font-size: 28rpx;
            font-weight: 600;
            color: #333;
          }
          
          .status-badge {
            padding: 4rpx 12rpx;
            border-radius: 4rpx;
            font-size: 22rpx;
            
            &.completed {
              background: #d1fae5;
              color: #065f46;
            }
            
            &.ongoing {
              background: #dbeafe;
              color: #1e40af;
            }
            
            &.cancelled {
              background: #fee2e2;
              color: #991b1b;
            }
          }
        }
        
        .visit-date {
          font-size: 26rpx;
          color: #666;
        }
      }
      
      .record-body {
        .info-row {
          display: flex;
          gap: 24rpx;
          margin-bottom: 12rpx;
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 8rpx;
            
            .info-text {
              font-size: 26rpx;
              color: #666;
            }
          }
        }
        
        .complaint-box,
        .diagnosis-box {
          margin-top: 12rpx;
          padding: 12rpx;
          background: white;
          border-radius: 8rpx;
          
          .complaint-label,
          .diagnosis-label {
            font-size: 26rpx;
            color: #999;
            margin-right: 8rpx;
          }
          
          .complaint-text,
          .diagnosis-text {
            font-size: 28rpx;
            color: #333;
            line-height: 1.6;
          }
        }
      }
      
      .record-footer {
        margin-top: 16rpx;
        padding-top: 16rpx;
        border-top: 2rpx solid #e5e7eb;
        
        .footer-actions {
          display: flex;
          gap: 12rpx;
          
          .action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8rpx;
            padding: 16rpx 24rpx;
            background: white;
            border: 2rpx solid #e5e7eb;
            border-radius: 8rpx;
            font-size: 26rpx;
            color: #666;
            
            &::after {
              border: none;
            }
            
            &.primary {
              background: #f0f9ff;
              border-color: #00BFCC;
              color: #00BFCC;
            }
          }
        }
      }
    }
  }
  
  .empty-state {
    background: white;
    padding: 100rpx 24rpx;
    border-radius: 0 0 16rpx 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
    
    .empty-text {
      font-size: 30rpx;
      color: #999;
      font-weight: 500;
    }
    
    .empty-tip {
      font-size: 26rpx;
      color: #ccc;
    }
  }
}
</style>
