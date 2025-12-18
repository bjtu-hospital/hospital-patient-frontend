<template>
  <view class="waitlist-container">
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-state">
      <uni-load-more status="loading" content-text="加载中..."></uni-load-more>
    </view>

    <!-- 候补列表 -->
    <view v-else class="waitlist-list">
      <view 
        class="waitlist-card" 
        v-for="item in waitlist" 
        :key="item.id"
      >
        <!-- 医生信息头部 -->
        <view class="card-header">
          <view class="doctor-info">
            <text class="doctor-name">{{ item.doctorName }} {{ item.doctorTitle }}</text>
            <text class="department-info">{{ item.departmentName }} {{ item.hospitalName }}</text>
          </view>
          <view class="status-badge" :class="getStatusClass(item.status)">
            <text class="status-text">{{ getStatusText(item.status) }}</text>
          </view>
        </view>
        
        <!-- 候补详细信息 -->
        <view class="card-content">
          <view class="info-item">
            <text class="info-label">就诊人</text>
            <text class="info-value">{{ item.patientName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">候补日期</text>
            <text class="info-value">{{ item.appointmentDate }} {{ item.appointmentTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">挂号费用</text>
            <text class="info-value price">¥{{ item.price }}</text>
          </view>
          <view class="info-item" v-if="item.status === 'waitlist'">
            <text class="info-label">候补排位</text>
            <text class="info-value queue-number">第{{ item.queueNumber }}位</text>
          </view>
          <view class="info-item">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ item.createdAt }}</text>
          </view>
        </view>
        
        <!-- 可转预约提示 -->
        <view class="convert-tip" v-if="item.status === 'waitlist' && item.canConvert">
          <view class="tip-icon">
            <uni-icons type="checkmarkempty" size="18" color="#10b981"></uni-icons>
          </view>
          <text class="tip-text">有号源啦！可以转为预约</text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="card-actions">
          <!-- 候补中：可转预约 + 取消候补 -->
          <template v-if="item.status === 'waitlist'">
            <button class="detail-btn" @tap="viewDetail(item)">
              查看详情
            </button>
            <button 
              class="convert-btn" 
              v-if="item.canConvert"
              @tap="handleConvert(item)"
            >
              转为预约
            </button>
            <button 
              class="cancel-btn" 
              v-else
              @tap="handleCancel(item.id)"
            >
              取消候补
            </button>
          </template>
          
          <!-- 其他状态：只显示查看详情 -->
          <template v-else>
            <button class="detail-btn full-width" @tap="viewDetail(item)">
              查看详情
            </button>
          </template>
        </view>
      </view>
    </view>
    
    <!-- 温馨提示 -->
    <view v-if="!loading && waitlist.length > 0" class="bottom-tip">
      <view class="tip-icon">
        <uni-icons type="info-filled" size="18" color="#ef4444"></uni-icons>
      </view>
      <text class="tip-text">温馨提示：候补成功转为预约后，请在30分钟内完成支付</text>
    </view>
    
    <!-- 空状态 -->
    <EmptyState 
      v-if="!loading && waitlist.length === 0"
      icon="list"
      text="暂无候补记录"
    >
      <template #action>
        <button class="go-appointment-btn" @tap="goToAppointment">
          立即预约
        </button>
      </template>
    </EmptyState>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyWaitlist, cancelWaitlist, convertWaitlistToAppointment } from '@/api/appointment'
// 💡 候补转预约是后端自动触发的，不需要在这里请求订阅消息授权
// 授权已在用户加入候补时完成（confirm-waitlist.vue）

const waitlist = ref([])
const loading = ref(false)

// 加载候补列表
const loadWaitlist = async () => {
  try {
    loading.value = true
    const result = await getMyWaitlist()
    // 后端返回 { list: [...] }
    let list = result.list || result || []
    
    // ✅ 修复：按创建时间降序排序（最新的在最上面）
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA  // 降序：新的在前
    })
    
    waitlist.value = list
    console.log('候补列表（已排序）:', waitlist.value)
  } catch (error) {
    console.error('获取候补列表失败:', error)
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 取消候补
const handleCancel = (waitlistId) => {
  console.log('点击取消候补，ID:', waitlistId)
  
  uni.showModal({
    title: '取消候补',
    content: '确定要取消候补吗？取消后需重新加入候补队列。',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '取消中...' })
          
          await cancelWaitlist(waitlistId)
          
          uni.hideLoading()
          uni.showToast({
            title: '已取消候补',
            icon: 'success'
          })
          
          // 立即刷新列表
          loadWaitlist()
          
        } catch (error) {
          uni.hideLoading()
          console.error('取消候补失败:', error)
          uni.showToast({
            title: error.message || '取消失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 候补转预约（手动触发 - 仅用于测试或特殊情况）
// 💡 说明：正常流程是后端自动检测号源并触发转预约
// 此功能仅供用户手动操作（如后端自动转换失败时的补救措施）
const handleConvert = async (item) => {
  console.log('手动触发候补转预约，候补信息:', item)
  
  uni.showModal({
    title: '转为预约',
    content: `确定将候补转为预约吗？\n医生：${item.doctorName}\n日期：${item.appointmentDate}\n费用：¥${item.price}`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '转换中...' })
          
          // 💡 直接调用转预约接口，不需要再次请求授权
          // 因为用户在加入候补时已经完成了授权
          const appointment = await convertWaitlistToAppointment(item.id, {
            slotId: item.slotId || 'default_slot'
            // 不需要传递订阅消息参数，后端会使用之前保存的授权记录
          })
          
          uni.hideLoading()
          console.log('✅ 转预约成功:', appointment)
          
          // 保存预约信息到本地，供支付页面使用
          uni.setStorageSync('lastAppointment', appointment)
          
          // 跳转到支付页面
          uni.navigateTo({
            url: `/pages/home/appointment/payment`
          })
          
        } catch (error) {
          uni.hideLoading()
          console.error('转预约失败:', error)
          uni.showToast({
            title: error.message || '转预约失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 查看详情
const viewDetail = (item) => {
  // 跳转到候补详情页面（候补成功页面）
  uni.navigateTo({
    url: `/pages/home/waitlist/waitlist-success?waitlistId=${item.id}&position=${item.queueNumber || 0}&status=${item.status}`
  })
}

// 去预约
const goToAppointment = () => {
  uni.navigateTo({
    url: '/pages/home/appointment/select-hospital'
  })
}

// 获取状态样式类
const getStatusClass = (status) => {
  return {
    'status-waiting': status === 'waitlist',
    'status-success': status === 'converted',
    'status-expired': status === 'expired',
    'status-cancelled': status === 'cancelled'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    waitlist: '候补中',
    converted: '已转预约',
    expired: '已过期',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadWaitlist()
})

// 每次页面显示时刷新列表
onShow(() => {
  loadWaitlist()
})
</script>

<style lang="scss" scoped>
.waitlist-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* 候补列表 */
.waitlist-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.waitlist-card {
  background: white;
  border-radius: $border-radius-lg;
  padding: 32rpx;
  box-shadow: $box-shadow-base;
  transition: all 0.2s ease;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid $color-slate-100;
}

.doctor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.doctor-name {
  font-size: 28rpx;
  font-weight: $font-semibold;
  color: $color-slate-900;
}

.department-info {
  font-size: 24rpx;
  color: $color-slate-600;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: $font-medium;
}

.status-badge.status-waiting {
  background: #f0fdff;
  color: $hospital-primary;
  border: 1rpx solid $hospital-primary;
}

.status-badge.status-success {
  background: #ecfdf5;
  color: #10b981;
  border: 1rpx solid #10b981;
}

/* 可转预约提示 */
.convert-tip {
  background: #ecfdf5;
  padding: 16rpx 20rpx;
  border-radius: $border-radius-base;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  border: 1rpx solid #86efac;
}

.convert-tip .tip-text {
  font-size: 24rpx;
  color: #10b981;
  font-weight: $font-medium;
}

.queue-number {
  color: $hospital-primary !important;
  font-weight: $font-bold !important;
}

.status-badge.status-expired {
  background: $color-slate-100;
  color: $color-slate-500;
  border: 1rpx solid $color-slate-300;
}

.status-badge.status-cancelled {
  background: #fef2f2;
  color: #dc2626;
  border: 1rpx solid #fca5a5;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  margin-bottom: 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $color-slate-50;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: $color-slate-600;
}

.info-value {
  font-size: 26rpx;
  color: $color-slate-900;
  font-weight: $font-medium;
  text-align: right;
}

.price {
  color: #dc2626;
  font-weight: $font-semibold;
  margin-left: 4rpx;
}


/* 操作按钮 */
.card-actions {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.detail-btn {
  flex: 1;
  padding: 20rpx;
  background: white;
  border: 1rpx solid $hospital-primary;
  border-radius: $border-radius-base;
  color: $hospital-primary;
  font-size: 26rpx;
  font-weight: $font-medium;
  transition: all 0.2s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    background: #f0fdff;
  }
}

.detail-btn.full-width {
  flex: none;
  width: 100%;
}

.convert-btn {
  flex: 1;
  padding: 20rpx;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
  border-radius: $border-radius-base;
  color: white;
  font-size: 26rpx;
  font-weight: $font-medium;
  transition: all 0.2s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.9;
  }
}

.cancel-btn {
  flex: 1;
  padding: 20rpx;
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  border: none;
  border-radius: $border-radius-base;
  color: white;
  font-size: 26rpx;
  font-weight: $font-medium;
  transition: all 0.2s ease;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.9;
  }
}

/* 底部提示 */
.bottom-tip {
  background: #fef2f2;
  margin: 24rpx 32rpx;
  padding: 20rpx 24rpx;
  border-radius: $border-radius-base;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  border: 1rpx solid #fecaca;
}

.tip-icon {
  margin-top: 2rpx;
}

.tip-text {
  flex: 1;
  font-size: 24rpx;
  color: #991b1b;
  line-height: 1.5;
}

/* 空状态 */
.go-appointment-btn {
  background: linear-gradient(135deg, $hospital-primary 0%, $hospital-primary-light 100%);
  color: white;
  border: none;
  border-radius: 24rpx;
  padding: 24rpx 48rpx;
  font-size: 26rpx;
  font-weight: $font-medium;
  box-shadow: 0 8rpx 25rpx rgba(0, 213, 217, 0.3);
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 35rpx rgba(0, 213, 217, 0.4);
  }
}

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}
</style>


