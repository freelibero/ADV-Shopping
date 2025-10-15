<template>
  <div class="container">
    <div v-if="isLoading" class="loading">
      <el-loading :spinning="isLoading" text="加载中..." />
    </div>
    <div v-else class="field-body" @click="handleSelect()">
      <el-input v-model="displayText" :placeholder="placeholder" readonly />
    </div>
    <el-dialog v-model="show" title="选择地区" width="90%" :fullscreen="isMobile" :close-on-click-modal="true">
      <el-cascader-panel v-model="selectedValues" :options="options" :props="cascaderProps" @change="handleConfirm" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="show = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm(selectedValues)">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { addressDeatil } from '@/api/address'

// 判断是否为移动设备
const isMobile = ref(false)

// 检测窗口大小变化
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

// 初始化检测
checkScreenSize()
// 监听窗口大小变化
window.addEventListener('resize', checkScreenSize)

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择省/市/区'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 响应式数据
const isLoading = ref(true)
const show = ref(false)
const options = ref([])
const selectedValues = ref([])

// 显示文本 - 增强查找逻辑和错误处理
const displayText = computed({
  get() {
    const regions = selectedValues.value
    if (!regions || regions.length === 0) {
      return ''
    }

    console.log('regions数组内容:', regions)

    // 从options中找到对应的label
    let labels = []
    let currentOptions = options.value

    // 如果regions数组的第一个元素是对象，尝试获取其id或code
    if (regions.length > 0 && typeof regions[0] === 'object') {
      return regions.map(r => r.label || r.name || '').join('/')
    }

    for (let i = 0; i < regions.length; i++) {
      console.log(`查找第${i + 1}级，值: ${regions[i]}`)
      const item = currentOptions.find(opt =>
        opt.value === regions[i] ||
        opt.code === regions[i] ||
        opt.id === regions[i] ||
        String(opt.value) === String(regions[i])
      )
      if (item) {
        labels.push(item.label)
        console.log(`找到匹配项: ${item.label}`)
        if (item.children && item.children.length > 0) {
          currentOptions = item.children
        }
      } else {
        console.log(`未找到匹配项: ${regions[i]}`)
        // 如果找不到匹配项，尝试直接使用值作为标签
        labels.push(String(regions[i]))
      }
    }

    const result = labels.join('/')
    console.log('最终显示文本:', result)
    return result
  }
})

// 级联选择器配置 - 确保value和emitPath正确配置
const cascaderProps = {
  label: 'label',
  value: 'code',
  children: 'children',
  emitPath: true, // 设置为true以获取完整路径
  checkStrictly: true
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      selectedValues.value = [...newValue]
    }
  },
  { immediate: true }
)

// 打开选择器
const handleSelect = () => {
  show.value = true
}

// 获取地区数据
const fetchRegionData = async () => {
  try {
    isLoading.value = true
    const response = await addressDeatil()

    // 根据OpenAPI规范处理复杂的嵌套对象结构
    if (response && response.data && response.data.list) {
      // 转换嵌套对象为级联选择器所需的数组格式
      options.value = transformRegionData(response.data.list)
    } else {
      // 兼容其他可能的数据格式
      options.value = Array.isArray(response) ? response :
        Array.isArray(response?.data) ? response.data :
          Array.isArray(response?.list) ? response.list : []
    }
  } catch (error) {
    console.error('获取地区数据失败:', error)
    ElMessage.error('获取地区数据失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 将OpenAPI返回的嵌套对象结构转换为级联选择器所需的数组格式
const transformRegionData = (data) => {
  if (!data || typeof data !== 'object') return []

  return Object.keys(data).map(key => {
    const province = data[key]
    const cityList = []

    // 处理城市级别
    if (province.city && typeof province.city === 'object') {
      Object.keys(province.city).forEach(cityKey => {
        const city = province.city[cityKey]
        const regionList = []

        // 处理区县级别
        if (city.region && typeof city.region === 'object') {
          Object.keys(city.region).forEach(regionKey => {
            const region = city.region[regionKey]
            regionList.push({
              label: region.name,
              value: region.id,
              code: region.id
            })
          })
        }

        cityList.push({
          label: city.name,
          value: city.id,
          code: city.id,
          children: regionList
        })
      })
    }

    return {
      label: province.name,
      value: province.id,
      code: province.id,
      children: cityList
    }
  })
}

// 确认选择后的回调
const handleConfirm = (value) => {
  if (value && value.length > 0) {
    // 处理不同格式的返回值
    const selectedData = Array.isArray(value) ? value : [value]
    selectedValues.value = selectedData

    // 确保emit正确的值类型
    emit('update:modelValue', selectedData)
    emit('change', selectedData)

    // 添加调试日志查看实际的数据结构
    console.log('已选择地区值:', selectedValues.value)
    console.log('显示文本值:', displayText.value)
    console.log('options数据结构:', JSON.stringify(options.value.slice(0, 1), null, 2)) // 只打印第一个选项
  }
  show.value = false
}

// 组件挂载时获取地区数据
onMounted(() => {
  fetchRegionData()
})
</script>

<style scoped>
.container {
  width: 100%;
}

.loading {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-body {
  width: 100%;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 - 适配手机 */
@media screen and (max-width: 768px) {
  /* 确保输入框在移动设备上有足够的高度和字体大小 */
  :deep(.el-input__inner) {
    height: 44px !important;
    font-size: 16px !important;
  }
  
  /* 确保级联选择器在全屏模式下正确显示 */
  :deep(.el-dialog__body) {
    padding: 0 !important;
  }
  
  /* 调整级联选择器的高度 */
  :deep(.el-cascader-panel) {
    height: calc(100vh - 120px);
    min-height: 300px;
  }
  
  /* 调整按钮样式以适应触摸操作 */
  :deep(.el-button) {
    padding: 10px 20px !important;
    font-size: 16px !important;
  }
  
  /* 调整对话框标题样式 */
  :deep(.el-dialog__title) {
    font-size: 18px !important;
    padding: 15px 0 !important;
  }
}

/* 响应式设计 - 适配平板 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  /* 在平板上调整对话框宽度 */
  :deep(.el-dialog) {
    width: 70% !important;
  }
}
</style>
