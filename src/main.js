import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import 'vant/lib/index.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import persist from 'pinia-plugin-persistedstate'
import '../src/styles/common.less'


// 创建 Pinia 实例并使用持久化插件
const pinia = createPinia().use(persist)
const app = createApp(App)

// 安装 Pinia 实例
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(Vant)
app.mount('#app')
