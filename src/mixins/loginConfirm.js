// loginConfirm.js
import { showConfirmDialog } from 'vant'

// 导出一个函数，接收必要的参数
export const loginConfirm = (userStore, router, route) => {
  if (!userStore.token) {
    showConfirmDialog({
      title: '温馨提示',
      message: '此时需要先登录才能继续操作哦',
      confirmButtonText: '去登录',
      cancelButtonText: '再逛逛',
    })
      .then(() => {
        router.replace({
          path: '/login',
          query: { backUrl: route.fullPath },
        })
      })
      .catch(() => {})

    return true
  }
  return false
}
