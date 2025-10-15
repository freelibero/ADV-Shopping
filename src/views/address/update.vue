<template>
  <div class="address-update">
    <el-header>
      <el-row class="header-row">
        <el-col :span="2">
          <el-button link @click="handleBack" icon="el-icon-arrow-left" size="large" />
        </el-col>
        <el-col :span="20" class="text-center">
          <span class="header-title">编辑收货地址</span>
        </el-col>
        <el-col :span="2"></el-col>
      </el-row>
    </el-header>

    <el-main>
      <div v-if="isLoading" class="loading-state">
        <el-loading :text="'加载中...'" />
      </div>
      
      <div v-else class="address-form">
        <el-form ref="addressFormRef" :model="addressForm" :rules="rules" label-width="80px" class="form-wrapper">
          <el-form-item label="收货人" prop="name">
            <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
          </el-form-item>

          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="addressForm.phone" placeholder="请输入手机号码" />
          </el-form-item>

          <el-form-item label="所在地区" prop="region">
            <SelectRegion v-model="addressForm.region" placeholder="请选择省/市/区" @change="handleRegionChange" />
          </el-form-item>

          <el-form-item label="详细地址" prop="detail">
            <el-input v-model="addressForm.detail" type="textarea" :rows="4"
              placeholder="请输入详细地址信息，如道路、门牌号、小区、楼栋号、单元等" />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="addressForm.isDefault">设为默认收货地址</el-checkbox>
          </el-form-item>
        </el-form>
      </div>
    </el-main>

    <!-- 底部按钮 -->
    <el-footer class="footer-fixed">
      <el-button type="primary" size="large" class="submit-btn" @click="handleSubmit" :loading="isSubmitting">
        保存
      </el-button>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { editAddress } from '@/api/address'
import { ElMessage, ElMessageBox } from 'element-plus'
import SelectRegion from '@/components/SelectRegion.vue'

const router = useRouter()
const route = useRoute()
const addressFormRef = ref()
const isLoading = ref(true)
const isSubmitting = ref(false)
const addressId = ref(route.params.id)

// 表单数据
const addressForm = reactive({
  address_id: addressId.value,
  name: '',
  phone: '',
  region: [],
  detail: '',
  isDefault: false
})

// 已移除cascaderProps配置，使用SelectRegion组件内部配置

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号码格式', 
      trigger: 'blur' 
    }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 200, message: '详细地址长度在 5 到 200 个字符', trigger: 'blur' }
  ]
}

// 获取地址详情
const fetchAddressDetail = async () => {
  try {
    // 注意：这里假设我们需要从列表中获取地址详情
    // 在实际项目中，可能需要一个专门的API来获取地址详情
    // 由于没有提供这个API，我们暂时从本地存储或其他方式获取
    // 这里简化处理，实际项目中需要根据实际情况调整
    const addressData = JSON.parse(localStorage.getItem('addressList')) || []
    const address = addressData.find(item => item.address_id === addressId.value)
    
    if (address) {
      addressForm.name = address.name
      addressForm.phone = address.phone
      addressForm.region = address.region || []
      addressForm.detail = address.detail
      addressForm.isDefault = address.isDefault === 1
    } else {
      ElMessage.warning('未找到地址信息')
      router.back()
    }
  } catch (error) {
    console.error('获取地址详情失败:', error)
    ElMessage.error('获取地址详情失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 地区选择变化处理
const handleRegionChange = (value) => {
  // 这里可以添加地区选择后的处理逻辑
  console.log('选择的地区:', value)
}

// 表单提交
const handleSubmit = async () => {
  try {
    await addressFormRef.value.validate()
    
    isSubmitting.value = true
    
    // 构建提交数据
    const submitData = {
      address_id: addressId.value,
      name: addressForm.name,
      phone: addressForm.phone,
      region: addressForm.region,
      detail: addressForm.detail,
      isDefault: addressForm.isDefault ? 1 : 0
    }
    
    await editAddress(submitData)
    
    ElMessage.success('地址更新成功')
    
    // 返回地址列表页
    router.push('/address')
  } catch (error) {
    console.error('更新地址失败:', error)
    if (error.name !== 'ValidationError') {
      ElMessage.error('更新地址失败，请稍后重试')
    }
  } finally {
    isSubmitting.value = false
  }
}

// 返回上一页
const handleBack = () => {
  // 如果表单有内容变化，提示用户是否放弃编辑
  if (hasFormChanged()) {
    ElMessageBox.confirm(
      '表单内容尚未保存，确定要离开吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.back()
    }).catch(() => {
      // 用户取消，不执行操作
    })
  } else {
    router.back()
  }
}

// 检查表单是否有变化
const hasFormChanged = () => {
  // 这里简化处理，实际项目中需要比较原始数据和当前数据
  return true
}

// 页面加载时获取数据
onMounted(async () => {
  // 只需要获取地址详情，地区数据由SelectRegion组件内部处理
  await fetchAddressDetail()
})
</script>

<style scoped>
.address-update {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-row {
  line-height: 60px;
  border-bottom: 1px solid #f0f0f0;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.address-form {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.form-wrapper {
  max-width: 100%;
}

.footer-fixed {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(to right, #f9211c, #ff6335);
  border: none;
}
</style>