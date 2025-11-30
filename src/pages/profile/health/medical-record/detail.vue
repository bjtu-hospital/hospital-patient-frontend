<template>
  <view class="medical-record-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <uni-icons type="spinner-cycle" size="30" color="#00BFCC" class="rotating"></uni-icons>
      <text class="loading-text">正在加载病历...</text>
    </view>

    <!-- 病历内容区域 -->
    <scroll-view v-else scroll-y class="record-scroll">
      <!-- 病历头部信息 -->
      <view class="record-header">
        <view class="header-left">
          <text class="patient-name">{{ recordData?.patientName || '-' }}</text>
          <text class="visit-date">就诊日期：{{ recordData?.visitDate || '-' }}</text>
        </view>
        <view class="header-right">
          <text class="tag department">{{ recordData?.department || '-' }}</text>
        </view>
      </view>

      <!-- 病历单卡片 -->
      <view id="medical-record-content" class="record-card">
        <!-- 医院标题 - 双logo -->
        <view class="hospital-header">
          <image class="logo logo-left" src="/static/BJTU-images/BJTU-logo.png" mode="aspectFit" />
          <view class="hospital-title">
            <text class="title-main">北京交通大学校医院</text>
            <text class="title-sub">Beijing Jiaotong University Hospital</text>
          </view>
          <image class="logo logo-right" src="/static/BJTU-images/hospital_logo.png" mode="aspectFit" />
        </view>

        <!-- 病历单标题 -->
        <view class="record-title">
          <text class="title-text">门 诊 病 历</text>
          <view class="title-line" />
        </view>

        <!-- 基本信息区 -->
        <view class="info-section">
          <view class="info-row">
            <view class="info-item">
              <text class="label">姓名：</text>
              <text class="value">{{ recordData?.patientName || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="label">性别：</text>
              <text class="value">{{ recordData?.gender || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="label">年龄：</text>
              <text class="value">{{ recordData?.age || '-' }}岁</text>
            </view>
          </view>
          <view class="info-row">
            <view class="info-item">
              <text class="label">门诊号：</text>
              <text class="value">{{ recordData?.outpatientNo || '-' }}</text>
            </view>
            <view class="info-item flex-2">
              <text class="label">就诊日期：</text>
              <text class="value">{{ recordData?.visitDate || '-' }}</text>
            </view>
          </view>
          <view class="info-row">
            <view class="info-item">
              <text class="label">科室：</text>
              <text class="value">{{ recordData?.department || '-' }}</text>
            </view>
            <view class="info-item flex-2">
              <text class="label">医生：</text>
              <text class="value">{{ recordData?.doctorName || '-' }}</text>
            </view>
          </view>
        </view>

        <!-- 分隔线 -->
        <view class="divider" />

        <!-- 主诉 -->
        <view class="content-section">
          <view class="section-title">
            <text class="title-icon">●</text>
            <text class="title-text">主诉</text>
          </view>
          <view class="section-content">
            <text class="content-text">{{ recordData?.chiefComplaint || '无' }}</text>
          </view>
        </view>

        <!-- 现病史 -->
        <view class="content-section">
          <view class="section-title">
            <text class="title-icon">●</text>
            <text class="title-text">现病史</text>
          </view>
          <view class="section-content">
            <text class="content-text">{{ recordData?.presentIllness || '无' }}</text>
          </view>
        </view>

        <!-- 辅助检查 -->
        <view v-if="recordData?.auxiliaryExam" class="content-section">
          <view class="section-title">
            <text class="title-icon">●</text>
            <text class="title-text">辅助检查</text>
          </view>
          <view class="section-content">
            <text class="content-text">{{ recordData?.auxiliaryExam }}</text>
          </view>
        </view>

        <!-- 诊断 -->
        <view class="content-section diagnosis-section">
          <view class="section-title">
            <text class="title-icon">●</text>
            <text class="title-text">诊断</text>
          </view>
          <view class="section-content">
            <text class="diagnosis-text">{{ recordData?.diagnosis || '无' }}</text>
          </view>
        </view>

        <!-- 处置/处方 -->
        <view v-if="recordData?.prescription" class="content-section">
          <view class="section-title">
            <text class="title-icon">●</text>
            <text class="title-text">处置/处方</text>
          </view>
          <view class="section-content">
            <text class="content-text prescription-text">{{ recordData?.prescription }}</text>
          </view>
        </view>

        <!-- 医师签名 -->
        <view class="signature-section">
          <view class="signature-row">
            <text class="signature-label">医师签名：</text>
            <text class="signature-value">{{ recordData?.doctorName || '-' }}</text>
          </view>
          <view class="signature-row">
            <text class="signature-label">日期：</text>
            <text class="signature-value">{{ recordData?.visitDate || '-' }}</text>
          </view>
        </view>

        <!-- 医院印章区域 -->
        <view class="stamp-area">
          <view class="stamp-placeholder">
            <text class="stamp-text">北京交通大学</text>
            <text class="stamp-text">校医院</text>
          </view>
        </view>
      </view>

      <!-- 底部安全区域占位 -->
      <view class="bottom-safe-area" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button type="primary" class="download-btn" @tap="downloadPdf">
        <uni-icons type="download" size="18" color="#fff"></uni-icons>
        <text class="btn-text">下载病历 PDF</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMedicalRecordDetail } from '@/api/health'

const loading = ref(true)
const recordData = ref(null)
const recordId = ref('')

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || currentPage.$page.options
  
  if (options.recordId) {
    recordId.value = options.recordId
    loadRecordDetail()
  } else {
    loading.value = false
    uni.showToast({
      title: '缺少病历ID',
      icon: 'none'
    })
  }
})

const loadRecordDetail = async () => {
  try {
    loading.value = true
    const data = await getMedicalRecordDetail(recordId.value)
    // 补充一些 mock 数据中可能缺失的字段，以匹配 UI
    recordData.value = {
      ...data,
      patientName: '张三', // Mock 数据中可能没有，这里先写死或从 user store 获取
      gender: '男',
      age: 35
    }
    console.log('✅ 病历详情加载成功:', recordData.value)
  } catch (error) {
    console.error('❌ 获取病历详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const downloadPdf = () => {
  const pdfUrl = recordData.value?.pdfUrl
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
  uni.showLoading({ title: '正在下载...' })
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
.medical-record-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

// 加载状态
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .rotating {
    animation: rotate 1s linear infinite;
  }

  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #999;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 滚动区域
.record-scroll {
  flex: 1;
  height: 0;
}

// 病历头部信息
.record-header {
  background-color: #fff;
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    flex-direction: column;

    .patient-name {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }

    .visit-date {
      font-size: 26rpx;
      color: #888;
      margin-top: 8rpx;
    }
  }

  .header-right {
    .tag {
      font-size: 24rpx;
      padding: 8rpx 16rpx;
      border-radius: 8rpx;
      background-color: #e8f4ff;
      color: #1989fa;
    }
  }
}

// 病历单卡片
.record-card {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

// 医院标题区域 - 双logo
.hospital-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 32rpx;
  border-bottom: 2rpx solid #1e3a8a;

  .logo {
    width: 100rpx;
    height: 100rpx;
  }

  .logo-left {
    margin-right: 24rpx;
  }

  .logo-right {
    margin-left: 24rpx;
  }

  .hospital-title {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title-main {
      font-size: 36rpx;
      font-weight: 700;
      color: #1e3a8a;
      letter-spacing: 4rpx;
    }

    .title-sub {
      font-size: 20rpx;
      color: #666;
      margin-top: 4rpx;
    }
  }
}

// 病历单标题
.record-title {
  text-align: center;
  padding: 32rpx 0;

  .title-text {
    font-size: 40rpx;
    font-weight: 700;
    color: #333;
    letter-spacing: 16rpx;
  }

  .title-line {
    height: 4rpx;
    background: linear-gradient(90deg, transparent, #c41e3a, transparent);
    margin-top: 16rpx;
  }
}

// 基本信息区
.info-section {
  padding: 20rpx 0;

  .info-row {
    display: flex;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-item {
    flex: 1;
    display: flex;
    font-size: 28rpx;

    &.flex-2 {
      flex: 2;
    }

    .label {
      color: #666;
      white-space: nowrap;
    }

    .value {
      color: #333;
      font-weight: 500;
    }
  }
}

// 分隔线
.divider {
  height: 2rpx;
  background-color: #eee;
  margin: 24rpx 0;
}

// 内容区块
.content-section {
  margin-bottom: 32rpx;

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    .title-icon {
      color: #1e3a8a;
      font-size: 20rpx;
      margin-right: 12rpx;
    }

    .title-text {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .section-content {
    padding-left: 32rpx;

    .content-text {
      font-size: 28rpx;
      color: #555;
      line-height: 1.8;
    }

    .prescription-text {
      white-space: pre-wrap;
    }
  }
}

// 诊断区块特殊样式
.diagnosis-section {
  .section-content {
    background-color: #f0f4ff;
    padding: 20rpx;
    border-radius: 12rpx;
    border-left: 6rpx solid #1e3a8a;

    .diagnosis-text {
      font-size: 30rpx;
      font-weight: 600;
      color: #1e3a8a;
    }
  }
}

// 医师签名区域
.signature-section {
  margin-top: 48rpx;
  padding-top: 32rpx;
  border-top: 2rpx dashed #ddd;
  display: flex;
  justify-content: space-between;

  .signature-row {
    display: flex;
    font-size: 28rpx;

    .signature-label {
      color: #666;
    }

    .signature-value {
      color: #333;
      font-weight: 500;
      text-decoration: underline;
    }
  }
}

// 印章区域
.stamp-area {
  margin-top: 40rpx;
  display: flex;
  justify-content: flex-end;

  .stamp-placeholder {
    width: 160rpx;
    height: 160rpx;
    border: 4rpx solid #c41e3a;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0.6;

    .stamp-text {
      font-size: 22rpx;
      color: #c41e3a;
      font-weight: 600;
    }
  }
}

// 底部安全区域
.bottom-safe-area {
  height: 160rpx;
}

// 底部操作栏
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);

  .download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #00BFCC;
    border-radius: 44rpx;
    height: 88rpx;
    
    &::after {
      border: none;
    }

    .btn-text {
      margin-left: 12rpx;
      font-size: 32rpx;
    }
  }
}
</style>