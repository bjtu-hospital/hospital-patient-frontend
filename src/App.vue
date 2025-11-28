<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 应用启动时
onLaunch(async () => {
  console.log('App Launch')
  
  // 从本地存储恢复登录状态
  const hasAuth = userStore.restoreAuth()
  
  if (hasAuth) {
    // 如果本地有token，验证登录态是否有效
    try {
      await userStore.checkAuth()
      console.log('登录态验证成功')
    } catch (error) {
      console.error('登录态验证失败:', error)
      // 验证失败会自动清理token，并在需要登录的页面跳转到登录页
    }
  }
})

// 应用显示时
onShow(() => {
  console.log('App Show')
})

// 应用隐藏时
onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/*每个页面公共css */
</style>
