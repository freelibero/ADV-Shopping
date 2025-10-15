<template>
  <div v-if="isLoading" class="loading-content" :style="customStyle">
    <div class="loading-spinner"></div>
    <div class="loading-text">{{ loadingText }}</div>
  </div>
  <div v-else class="empty-content" :style="customStyle">
    <div class="empty-icon" :style="{ width: iconSize }">
      <img class="image" :src="icon" mode="widthFix" alt="empty">
    </div>
    <div class="tips">{{ tips }}</div>
    <slot name="slot"></slot>
  </div>
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  // 正在加载
  isLoading: {
    type: Boolean,
    default: true
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({})
  },
  // 提示文字
  tips: {
    type: String,
    default: '亲，暂无相关数据'
  },
  // 加载时提示文字
  loadingText: {
    type: String,
    default: '加载中...'
  },
  // 自定义图标路径
  icon: {
    type: String,
    default: '/src/assets/empty.png'
  },
  // 图标大小
  iconSize: {
    type: String,
    default: '280rpx'
  },
  // 垂直居中模式
  center: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
// 基础动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// 通用容器样式
.empty-content,
.loading-content {
  box-sizing: border-box;
  width: 100%;
  padding: 140rpx 50rpx;
  text-align: center;
  min-height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  // 垂直居中模式
  &.center {
    min-height: 600rpx;
  }

  .tips,
  .loading-text {
    font-size: 28rpx;
    color: #999;
    margin: 50rpx 0;
    line-height: 1.5;
  }
}

// 加载状态样式
.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

// 空状态样式
.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;

  .image {
    width: 100%;
    height: auto;
  }
}

// 响应式调整
@media screen and (max-width: 375px) {

  .empty-content,
  .loading-content {
    padding: 100rpx 30rpx;
  }

  .tips,
  .loading-text {
    font-size: 26rpx;
  }
}

@media screen and (min-width: 768px) {

  .empty-content,
  .loading-content {
    padding: 180rpx 80rpx;
  }

  .tips,
  .loading-text {
    font-size: 32rpx;
  }
}
</style>
