<template>
  <div class="address-create">
    <!-- 标题栏 -->
    <div class="header-bar">
      <el-button link @click="handleBack" icon="el-icon-arrow-left" size="large" class="back-button" />
      <div class="page-title">收货地址</div>
    </div>

    <!-- 表单组件 -->
    <div class="form-wrapper">
      <el-form ref="addressFormRef" :model="addressForm" :rules="rules" label-width="140px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入收货人手机号" />
        </el-form-item>

        <el-form-item label="地区" prop="region">
          <SelectRegion v-model="addressForm.region" placeholder="请选择省/市/区" />
        </el-form-item>

        <el-form-item label="详细地址" prop="detail" :border-bottom="false">
          <el-input v-model="addressForm.detail" type="textarea" :rows="3" placeholder="街道门牌、楼层等信息" />
        </el-form-item>
      </el-form>
    </div>

    <!-- 默认地址选项 -->
    <div class="default-option">
      <el-checkbox v-model="addressForm.isDefault">设为默认收货地址</el-checkbox>
    </div>

    <!-- 操作按钮 -->
    <div class="footer">
      <div class="btn-wrapper">
        <el-button type="primary" class="btn-item btn-item-main" :class="{ disabled: isSubmitting }"
          @click="handleSubmit()" :loading="isSubmitting" size="large">
          保存
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addAddress } from '@/api/address'
import { ElMessage, ElMessageBox } from 'element-plus'
import SelectRegion from '@/components/SelectRegion.vue'

const router = useRouter()
const route = useRoute()
const addressFormRef = ref()
const isSubmitting = ref(false)

// 表单数据
const addressForm = reactive({
  name: '',
  phone: '',
  region: [],
  detail: '',
  isDefault: false
})

// 表单验证规则
const rules = {
  name: [
    {
      required: true,
      message: '请输入姓名',
      trigger: ['blur', 'change']
    }
  ],
  phone: [
    {
      required: true,
      message: '请输入手机号',
      trigger: ['blur', 'change']
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号码不正确',
      trigger: ['blur']
    }
  ],
  region: [
    {
      required: true,
      message: '请选择省市区',
      trigger: ['blur', 'change'],
      type: 'array'
    }
  ],
  detail: [
    {
      required: true,
      message: '请输入详细地址',
      trigger: ['blur', 'change']
    }
  ]
}

// 表单提交
const handleSubmit = async () => {
  try {
    // 确保表单验证成功后才继续执行
    const isValid = await addressFormRef.value.validate()

    // 如果验证失败，isValid可能为false或抛出异常
    if (!isValid) {
      return
    }

    isSubmitting.value = true

    // 构建提交数据，按照API规范包装在form对象中
    // 转换region数据为API要求的包含value和label属性的对象数组
    // 由于无法直接获取到label，我们使用简单的label作为占位符
    const formattedRegion = addressForm.region.map((item, index) => ({
      value: Number(item), // 确保是数字类型
      label: `region${index + 1}` // 暂时使用占位符label
    }))
    
    const submitData = {
      form: {
        name: addressForm.name,
        phone: addressForm.phone,
        region: formattedRegion,
        detail: addressForm.detail
      }
    }

    // 发送请求到后端
    const response = await addAddress(submitData)

    ElMessage.success('地址添加成功')

    // 检查是否是从支付页面跳转
    if (route.query.from === 'pay') {
      // 构建支付页面需要的地址格式（不包含form嵌套）
      const paymentAddress = {
        // 添加一个临时id，实际应用中应该使用服务器返回的id
        id: Date.now(),
        name: addressForm.name,
        mobile: addressForm.phone,
        // 将region数组转换为支付页面需要的对象格式
        region: addressForm.region.length >= 3 ? {
          province: addressForm.region[0],
          city: addressForm.region[1],
          region: addressForm.region[2]
        } : {},
        detail: addressForm.detail,
        isDefault: addressForm.isDefault ? 1 : 0
      }
      
      // 返回到支付页面并带上新创建的地址信息
      router.push({
        path: '/pay',
        query: {
          selectedAddress: JSON.stringify(paymentAddress)
        }
      })
    } else {
      // 返回到地址列表页
      router.push('/address')
    }
  } catch (error) {
    // 区分验证错误和其他错误
    if (error.name === 'ValidationError') {
      // Element Plus的表单验证会自动显示错误提示，这里不需要额外处理
    } else if (error.response) {
      // 服务器返回了错误状态码
      ElMessage.error(`添加地址失败: ${error.response.data.message || '服务器错误'}`)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('没有收到服务器响应，请检查网络连接')
    } else {
      // 其他错误
      ElMessage.error(`添加地址失败: ${error.message || '未知错误'}`)
    }
  } finally {
    isSubmitting.value = false
  }
}

// 返回上一页
const handleBack = () => {
  // 如果表单有内容，提示用户是否放弃编辑
  if (addressForm.name || addressForm.phone || addressForm.region.length > 0 || addressForm.detail) {
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
</script>

<style>
.address-create {
  background: #ffffff;
}
</style>
<style scoped>
/* 基础样式 - 使用相对单位 */
.address-create {
  min-height: 100vh;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 40rpx;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  position: relative;
}

.back-button {
  position: absolute;
  left: 30rpx;
  margin-right: 0;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.form-wrapper {
  margin: 20rpx auto;
  padding: 30rpx 40rpx;
  width: 94%;
  max-width: 768px;
  background: #fff;
}

.default-option {
  margin: 0 auto 20rpx auto;
  padding: 20rpx 40rpx;
  width: 94%;
  max-width: 768px;
  background: #fff;
}

/* 底部操作栏 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.btn-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.btn-item {
  flex: 1;
  font-size: 28rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  color: #fff;
  border-radius: 50rpx;
  width: 100%;
}

.btn-item-main {
  background: linear-gradient(to right, #f9211c, #ff6335);
  border: none;
}

.btn-item-main.disabled {
  background: #ff9779;
}

/* 响应式设计 - 适配手机 */
  @media screen and (max-width: 768px) {
    .header-bar {
      padding: 15rpx 30rpx;
    }

    .form-wrapper,
    .default-option {
      width: 98%;
      padding: 15rpx 20rpx 15rpx 0rpx;
      margin: 15rpx 0 15rpx 0rpx;
    }

    .footer {
      height: 100rpx;
      padding: 0 15rpx;
    }

    .btn-wrapper {
      padding: 0 15rpx;
    }

    .btn-item {
      height: 80rpx;
      line-height: 80rpx;
      font-size: 26rpx;
    }

    .address-create {
      padding-bottom: 120rpx;
    }

    /* 使用正确的CSS选择器来设置Element Plus表单标签宽度 */
    .el-form-item__label {
      width: 120px !important;
    }

    /* 确保输入框有足够的宽度 */
    .el-form-item__content {
      margin-left: 120px !important;
    }

    .page-title {
      font-size: 32rpx;
    }
  }

/* 响应式设计 - 适配平板和小屏幕电脑 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .form-wrapper,
  .default-option {
    width: 85%;
    max-width: 600px;
  }

  .header-bar {
    padding: 25rpx 50rpx;
  }

  .page-title {
    font-size: 40rpx;
  }

  .btn-item {
    font-size: 30rpx;
    height: 110rpx;
    line-height: 110rpx;
  }

  .footer {
    height: 130rpx;
  }
}

/* 响应式设计 - 适配大屏幕电脑 */
@media screen and (min-width: 1025px) {
  .form-wrapper,
  .default-option {
    width: 70%;
    max-width: 600px;
  }

  .address-create {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #ffffff;
  }

  .header-bar {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
  }

  .footer {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* 确保表单元素在不同屏幕尺寸下都有良好的触摸区域 */
.el-input__inner,
.el-select .el-input__inner {
  min-height: 80rpx;
  font-size: 28rpx;
  padding: 0 20rpx;
}

.el-textarea__inner {
  font-size: 28rpx;
  padding: 20rpx;
}

.el-checkbox {
  font-size: 28rpx;
  padding: 10rpx 0;
}

/* 确保按钮在移动设备上有足够的点击区域 */
.el-button {
  min-height: 80rpx;
  min-width: 120rpx;
  font-size: 28rpx;
}
</style>
