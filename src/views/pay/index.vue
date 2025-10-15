<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAddress } from '@/api/address'
import { useRouter, useRoute } from 'vue-router'
import { checkOrder, getSubmitOrder } from '@/api/order'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const address = ref({
  AddressList: [],
  personal: {},
  order: {},
  remark: ''
})

// 存储从路由参数中获取的选中地址
const routeSelectedAddress = ref(null)

// 从路由参数中获取选中的地址
const getSelectedAddressFromRoute = () => {
  const selectedAddressStr = route.query.selectedAddress
  if (selectedAddressStr) {
    try {
      return JSON.parse(selectedAddressStr)
    } catch (e) {
      console.error('解析选中地址失败:', e)
    }
  }
  return null
}

// 初始化路由选中地址
routeSelectedAddress.value = getSelectedAddressFromRoute()

// 监听路由参数变化
watch(
  () => route.query.selectedAddress,
  (newValue) => {
    if (newValue) {
      try {
        routeSelectedAddress.value = JSON.parse(newValue)
      } catch (e) {
        console.error('解析选中地址失败:', e)
      }
    }
  }
)

const selectAddress = computed(() => {
  // 优先使用路由参数中传递的选中地址
  if (routeSelectedAddress.value) {
    return routeSelectedAddress.value
  }
  // 否则使用默认地址或第一个地址
  return address.value.AddressList.find(item => item.isDefault === 1) || address.value.AddressList[0]
})
const longAddress = computed(() => {
  if (!selectAddress.value) return ''

  const region = selectAddress.value.region
  const detail = selectAddress.value.detail || ''

  // 检查region是否是对象格式（从支付页面选择的地址）
  if (region && typeof region === 'object' && !Array.isArray(region)) {
    // 提取省市区信息并确保它们存在
    const province = region.province || ''
    const city = region.city || ''
    const district = region.region || ''
    return province + city + district + detail
  }
  // 如果region是数组（从创建地址页面传递的）
  else if (Array.isArray(region) && region.length > 0) {
    // 直接使用数组中的值拼接
    return region.join('') + detail
  }
  // 如果都不是，直接返回详情
  return detail
})
// 定义计算属性 mode
const mode = computed(() => route.query.mode)
// 定义计算属性 cartIds
const cartIds = computed(() => route.query.cartIds)
const goodsId = computed(() => route.query.goodsId)
const goodsSkuId = computed(() => route.query.goodsSkuId)
const goodsNum = computed(() => route.query.goodsNum)
const fetchAddressList = async () => {
  const { data: { list } } = await getAddress()
  address.value.AddressList = list
}
// 获取订单列表
const getOrderList = async () => {
  if (mode.value === 'cart') {
    try {
      const { data: { order, personal } } = await checkOrder(mode.value, { cartIds: cartIds.value })
      address.value.order = order
      address.value.personal = personal
    } catch (error) {
      console.error('获取订单列表失败', error)
    }
  }
  if (mode.value === 'buyNow') {
    const { data: { order, personal } } = await checkOrder(mode.value, {
      goodsId: goodsId.value,
      goodsSkuId: goodsSkuId.value,
      goodsNum: goodsNum.value
    })
    address.value.order = order
    address.value.personal = personal
  }
}
const submitOrder = async () => {
  try {
    if (mode.value === 'cart') {
      await getSubmitOrder(mode.value, {
        remark: address.value.remark,
        cartIds: cartIds.value,
      });
    }
    if (mode.value === 'buyNow') {
      await getSubmitOrder(mode.value, {
        remark: address.value.remark,
        goodsId: goodsId.value,
        goodsSkuId: goodsSkuId.value,
        goodsNum: goodsNum.value
      });
    }
    // 修改 showToast 调用方式
    showToast({
      type: 'success',
      message: '订单提交成功'
    });
    router.replace('/PayMoney');
  } catch (error) {
    console.error('订单提交失败', error);
    showToast({
      type: 'fail',
      message: '订单提交失败，请稍后重试'
    });
  }
};
onMounted(async () => {
  await fetchAddressList()
  await getOrderList()
})

</script>



<template>
  <div class="pay">
    <van-nav-bar fixed title="订单结算台" left-arrow @click-left="$router.go(-1)" />

    <!-- 地址相关 -->
    <div class="address" @click="$router.push({ path: '/address', query: { ...$route.query, from: 'pay' } })">

      <div class="left-icon">
        <van-icon name="logistics" />
      </div>

      <!-- 更健壮的条件判断，确保只要有有效的地址数据就显示 -->
      <div class="info" v-if="selectAddress && (selectAddress.id || selectAddress.name)">
        <div class="info-content">
          <span class="name">{{ selectAddress.name }}</span>
          <span class="mobile">{{ selectAddress.mobile }}</span>
          <span v-if="selectAddress.isDefault === 1" class="default-tag">默认</span>
        </div>
        <div class="info-address">
          {{ longAddress }}
        </div>
      </div>

      <div class="info" v-else>
        请选择配送地址
      </div>

      <div class="right-icon">
        <van-icon name="arrow" />
      </div>
    </div>

    <!-- 订单明细 -->
    <div class="pay-list" v-if="address.order.goodsList">
      <div class="list">
        <div class="goods-item" v-for="item in address.order.goodsList" :key="item.goods_id">
          <div class="left">
            <img :src="item.goods_image" alt="" />
          </div>
          <div class="right">
            <p class="tit text-ellipsis-2">
              {{ item.goods_name }}
            </p>
            <p class="info">
              <span class="count">x{{ item.total_num }}</span>
              <span class="price">¥{{ item.total_pay_price }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="flow-num-box">
        <span>共 {{ address.order.orderTotalNum }} 件商品，合计：</span>
        <span class="money">￥{{ address.order.orderTotalPrice }}</span>
      </div>

      <div class="pay-detail">
        <div class="pay-cell">
          <span>订单总金额：</span>
          <span class="red">￥{{ address.order.orderTotalPrice }}</span>
        </div>

        <div class="pay-cell">
          <span>优惠券：</span>
          <span>无优惠券可用</span>
        </div>

        <div class="pay-cell">
          <span>配送费用：</span>
          <span v-if="false">请先选择配送地址</span>
          <span v-else class="red">+￥0.00</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="pay-way">
        <span class="tit">支付方式</span>
        <div class="pay-cell">
          <span><van-icon name="balance-o" />余额支付（可用 ¥ {{ address.personal.balance }} 元）</span>
          <!-- <span>请先选择配送地址</span> -->
          <span class="red"><van-icon name="passed" /></span>
        </div>
      </div>

      <!-- 买家留言 -->
      <div class="buytips">
        <textarea v-model="address.remark" placeholder="选填：买家留言（50字内）" name="" id="" cols="30" rows="10"></textarea>
      </div>
    </div>

    <!-- 底部提交 -->
    <div class="footer-fixed">
      <div class="left">实付款：<span>￥{{ address.order.orderTotalPrice }}</span></div>
      <div class="tipsbtn" @click="submitOrder">提交订单</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.pay {
  padding-top: 46px;
  padding-bottom: 46px;

  // 修改 ::v-deep 为 :deep()
  :deep(.van-nav-bar__arrow) {
    color: #333;
  }
}

.address {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  font-size: 14px;
  color: #666;
  position: relative;
  background: url(@/assets/border-line.png) bottom repeat-x;
  background-size: 60px auto;
  cursor: pointer;

  .left-icon {
    margin-right: 20px;
  }

  .right-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-7px);
  }

  .default-tag {
    margin-left: 10px;
    color: #ee0a24;
    font-size: 12px;
    border: 1px solid #ee0a24;
    border-radius: 4px;
    padding: 2px 6px;
  }
}

.goods-item {
  height: 100px;
  margin-bottom: 6px;
  padding: 10px;
  background-color: #fff;
  display: flex;

  .left {
    width: 100px;

    img {
      display: block;
      width: 80px;
      margin: 10px auto;
    }
  }

  .right {
    flex: 1;
    font-size: 14px;
    line-height: 1.3;
    padding: 10px;
    padding-right: 0px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    color: #333;

    .info {
      margin-top: 5px;
      display: flex;
      justify-content: space-between;

      .price {
        color: #fa2209;
      }
    }
  }
}

.flow-num-box {
  display: flex;
  justify-content: flex-end;
  padding: 10px 10px;
  font-size: 14px;
  border-bottom: 1px solid #efefef;

  .money {
    color: #fa2209;
  }
}

.pay-cell {
  font-size: 14px;
  padding: 10px 12px;
  color: #333;
  display: flex;
  justify-content: space-between;

  .red {
    color: #fa2209;
  }
}

.pay-detail {
  border-bottom: 1px solid #efefef;
}

.pay-way {
  font-size: 14px;
  padding: 10px 12px;
  border-bottom: 1px solid #efefef;
  color: #333;

  .tit {
    line-height: 30px;
  }

  .pay-cell {
    padding: 10px 0;
  }

  .van-icon {
    font-size: 20px;
    margin-right: 5px;
  }
}

.buytips {
  display: block;

  textarea {
    display: block;
    width: 100%;
    border: none;
    font-size: 14px;
    padding: 12px;
    height: 100px;
  }
}

.footer-fixed {
  position: fixed;
  background-color: #fff;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 46px;
  line-height: 46px;
  border-top: 1px solid #efefef;
  font-size: 14px;
  display: flex;

  .left {
    flex: 1;
    padding-left: 12px;
    color: #666;

    span {
      color: #fa2209;
    }
  }

  .tipsbtn {
    width: 121px;
    background: linear-gradient(90deg, #f9211c, #ff6335);
    color: #fff;
    text-align: center;
    line-height: 46px;
    display: block;
    font-size: 14px;
  }
}
</style>
