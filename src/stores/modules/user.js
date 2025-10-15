import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '@/router'
import { getUserInfoDetail } from '@/api/user'

export const useUserStore = defineStore(
  'V-user',
  () => {
    const token = ref('') // 定义 token
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }
    const user = ref({})
    const getUser = async () => {
      const res = await getUserInfoDetail()
      user.value = res.data.data
    }
    const setUser = (obj) => {
      user.value = obj
    }
    // 退出登录
    const logout = () => {
      token.value = ''
      user.value = {}
      router.push('/login') // 跳转到登录页面
    }
    return {
      token,
      setToken,
      removeToken,
      user,
      getUser,
      setUser,
      logout,
    }
  },
  {
    persist: true,
  },
)
