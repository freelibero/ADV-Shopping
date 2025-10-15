<script setup>
import OrderList from '@/components/OrderList.vue';
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { getMyOrderList } from '@/api/order';

const route = useRoute()

const data = ref({
  active: route.query.dataType || 'all',
  page: 1,
  list: []
})

// 定义获取订单列表的异步函数
const getOrderList = async () => {
  try {
    const response = await getMyOrderList(data.value.active, data.value.page);
    const orderList = response?.data?.list;
    if (Array.isArray(orderList)) {
      orderList.forEach((item) => {
        item.total_num = 0;
        if (item.goods) {
          item.goods.forEach(goods => {
            item.total_num += goods.total_num || 0;
          });
        }
      });
      data.value.list = orderList;
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
  }

}
  // 正确监听 data.value.active 的变化
  watch(() => data.value.active, () => {
    getOrderList();
  }, { immediate: true });

</script>


<template>
  <div class="order">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.go(-1)" />
    <van-tabs v-model="data.active">
      <van-tab name="all" title="全部"></van-tab>
      <van-tab name="payment" title="待支付"></van-tab>
      <van-tab name="delivery" title="待发货"></van-tab>
      <van-tab name="received" title="待收货"></van-tab>
      <van-tab name="comment" title="待评价"></van-tab>
    </van-tabs>

    <OrderList v-for="item in data.list" :key="item.order_id" :item="item"></OrderList>
  </div>
</template>

<style lang="less" scoped>
.order {
  background-color: #fafafa;
}

.van-tabs {
  position: sticky;
  top: 0;
}
</style>
