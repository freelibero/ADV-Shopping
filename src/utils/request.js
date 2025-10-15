import axios from 'axios'
import { useUserStore } from '@/stores/modules/user'
import router from '@/router'
import { ElLoading, ElMessage } from 'element-plus'

const baseURL = 'https://smart-shop.itheima.net/index.php?s=/api'
const instance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    platform: 'H5', // 或者其他合适的值
  },
})

let loadingInstance = null

// 显示 loading
const showLoading = () => {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(14, 228, 240, 0.7)',
  })
}

// 清除 loading 提示的封装函数
const clearLoading = () => {
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 开启 loading
    showLoading()

    const userStore = useUserStore()
    if (userStore.token) {
      // 修改为和 Vue 2 版本一致的请求头字段
      //有时候请求头不同会影响获取token
      config.headers['Access-Token'] = userStore.token
      config.headers.platform = 'H5'
    }
    return config
  },
  (err) => {
    // 请求出错，清除 loading 提示
    clearLoading()
    ElMessage.error('请求出错，请稍后重试')
    return Promise.reject(err)
  },
)

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 请求成功，清除 loading 提示
    clearLoading()
    const res = response.data
    if (res.status !== 200) {
      // 给错误提示
      ElMessage.error(res.message)
      // 抛出一个错误的 promise
      return Promise.reject(res.message)
    }
    return res
  },
  (error) => {
    // 请求失败，清除 loading 提示
    clearLoading()
    let errorMessage = '网络错误，请稍后重试'
    if (error.response) {
      // 请求已发出，但服务器响应状态码不在 2xx 范围内
      errorMessage = `错误状态码: ${error.response.status}, 错误信息: ${error.response.data.message || '服务器错误'}`
      if (error.response.status === 401) {
        // 401 状态码，跳转到登录页面
        router.push('/login')
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMessage = '没有收到服务器响应，请检查网络连接'
    } else {
      // 在设置请求时触发了错误
      errorMessage = `请求错误: ${error.message}`
    }

    // 使用 ElMessage 显示错误提示
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  },
)

export default instance
