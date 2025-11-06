<template>
  <view class="empty-state">
    <view class="empty-icon">
      <uni-icons :type="icon" :size="iconSize" :color="iconColor"></uni-icons>
    </view>
    <text class="empty-text">{{ text }}</text>
    <slot name="action"></slot>
  </view>
</template>

<script setup>
/**
 * 空状态组件
 * @prop {String} icon - 图标类型
 * @prop {Number} iconSize - 图标大小
 * @prop {String} iconColor - 图标颜色
 * @prop {String} text - 提示文字
 */
defineProps({
  icon: {
    type: String,
    default: 'list'
  },
  iconSize: {
    type: Number,
    default: 60
  },
  iconColor: {
    type: String,
    default: '#cbd5e1'
  },
  text: {
    type: String,
    default: '暂无数据'
  }
})
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: 120rpx 32rpx;
}

.empty-icon {
  margin-bottom: 32rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
}
</style>

