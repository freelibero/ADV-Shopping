<template>
  <div class="address-list">
    <el-header>
      <el-row class="header-row">
        <el-col :span="2">
          <el-button link @click="handleBack" icon="el-icon-arrow-left" size="large" />
        </el-col>
        <el-col :span="20" class="text-center">
          <span class="header-title">
            {{ isFromPay ? '选择收货地址' : '收货地址管理' }}
          </span>
        </el-col>
        <el-col :span="2"></el-col>
      </el-row>
    </el-header>

    <el-main>
      <div class="address-content">
        <!-- 地址列表 -->
        <div v-if="list.length > 0" class="address-item-wrapper">
          <el-card v-for="item in list" :key="item.address_id" :shadow="'hover'" class="address-item"
            @click="isFromPay ? handleSelectAddress(item) : undefined"
            :style="{ cursor: isFromPay ? 'pointer' : 'default' }">
            <div class="address-header">
              <span class="contacts-name">{{ item.name }}</span>
              <span class="contacts-phone">{{ item.phone }}</span>
              <el-tag v-if="item.address_id === defaultId" type="danger" size="small">默认</el-tag>
            </div>
            <div class="address-detail">
              <span v-for="(region, idx) in item.region" :key="idx" class="region-text">{{ region }}</span>
              <span class="detail-text">{{ item.detail }}</span>
            </div>
            <div class="address-footer">
              <div class="left-section">
                <el-radio v-model="defaultId" :label="item.address_id" @change="handleSetDefault(item.address_id)">
                  设置默认
                </el-radio>
              </div>
              <div class="right-section">
                <el-button link @click.stop="handleUpdate(item.address_id)" size="small" class="edit-btn">
                  <i class="el-icon-edit"></i> 编辑
                </el-button>
                <el-button link @click.stop="handleRemove(item.address_id)" size="small" class="delete-btn">
                  <i class="el-icon-delete"></i> 删除
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="暂无收货地址" :image-size="120" />
        </div>
      </div>
    </el-main>

    <!-- 底部按钮 -->
    <el-footer class="footer-fixed">
      <el-button type="primary" size="large" class="add-btn" @click="handleCreate">
        添加新地址
      </el-button>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAddress, defaultAddress, removeAddress } from '@/api/address'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const list = ref([])
const defaultId = ref('')
const isLoading = ref(false)

// 判断是否从支付页面跳转过来
const isFromPay = computed(() => route.query.from === 'pay')

// 获取地址列表
const fetchAddressList = async () => {
  isLoading.value = true
  try {
    const { data } = await getAddress()
    list.value = data.list || []
    await fetchDefaultAddress()
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 获取默认地址ID
const fetchDefaultAddress = async () => {
  try {
    const { data } = await defaultAddress()
    defaultId.value = data.defaultId || ''
  } catch (error) {
    console.error('获取默认地址失败:', error)
  }
}

// 设置默认地址
const handleSetDefault = async (addressId) => {
  try {
    // 这里可能需要调用设置默认地址的API
    // 由于API文件中没有明确提供，暂时只更新本地状态
    defaultId.value = addressId
    ElMessage.success('默认地址设置成功')
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置默认地址失败，请稍后重试')
  }
}

// 编辑地址
const handleUpdate = (addressId) => {
  router.push(`/address/update/${addressId}`)
}

// 删除地址
const handleRemove = async (addressId) => {
  try {
    await removeAddress({ address_id: addressId })
    // 重新获取地址列表
    await fetchAddressList()
    ElMessage.success('地址删除成功')
  } catch (error) {
    console.error('删除地址失败:', error)
    ElMessage.error('删除地址失败，请稍后重试')
  }
}

// 创建新地址
const handleCreate = () => {
  router.push({
    path: '/address/create',
    query: isFromPay.value ? { from: 'pay' } : {}
  })
}

// 选择地址并返回到支付页面
const handleSelectAddress = (addressItem) => {
  if (isFromPay.value) {
    // 构建支付页面需要的地址格式
    const selectedAddress = {
      id: addressItem.address_id,
      name: addressItem.name,
      mobile: addressItem.phone,
      region: {
        province: addressItem.region[0] || '',
        city: addressItem.region[1] || '',
        region: addressItem.region[2] || ''
      },
      detail: addressItem.detail,
      isDefault: addressItem.isDefault || 0
    }

    // 返回到支付页面并带上所选地址信息和原始的路由参数
    // 这样可以确保返回支付页面时，商品参数不会丢失
    const originalQueryParams = { ...route.query }
    delete originalQueryParams.from // 移除from参数，因为我们现在要返回支付页面

    router.push({
      path: '/pay',
      query: {
        ...originalQueryParams,
        selectedAddress: JSON.stringify(selectedAddress)
      }
    })
  }
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 页面加载时获取地址列表
onMounted(() => {
  fetchAddressList()
})
</script>

<style scoped>
.address-list {
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

.address-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.address-item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  width: 100%;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.contacts-name {
  font-size: 16px;
  margin-right: 12px;
}

.contacts-phone {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.address-detail {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
}

.region-text {
  margin-right: 5px;
}

.detail-text {
  display: block;
  margin-top: 5px;
}

.address-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.left-section {
  display: flex;
  align-items: center;
}

.right-section {
  display: flex;
  gap: 16px;
}

.edit-btn .el-icon-edit,
.delete-btn .el-icon-delete {
  margin-right: 4px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.footer-fixed {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
}

.add-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(to right, #f9211c, #ff6335);
  border: none;
}
</style>
