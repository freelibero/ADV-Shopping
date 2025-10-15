<script setup>
import GoodsItem from '@/components/GoodsItem.vue';
import { useRoute } from 'vue-router';
import { getSeachList } from '@/api/product';
import { ref, computed, onMounted } from 'vue'
const route = useRoute()
const search = ref({
  page: 1,
  proList: []
})
const querySeach = computed(() => {
  return route.query.search
})
onMounted(async () => {
  const { data: { list } } = await getSeachList({
    categoryId: route.query.categoryId,
    goodsName: querySeach.value,
    page: search.value.page
  })
  search.value.proList = list.data
})

</script>

<template>
  <div class="search">
    <van-nav-bar fixed title="商品列表" left-arrow @click-left="$router.go(-1)" />

    <van-search readonly shape="round" background="#ffffff" :value="querySeach || '搜索'" show-action
      @click="$router.push('/search')">
      <template #action>
        <van-icon class="tool" name="apps-o" />
      </template>
    </van-search>

    <!-- 排序选项按钮 -->
    <div class="sort-btns">
      <div class="sort-item">综合</div>
      <div class="sort-item">销量</div>
      <div class="sort-item">价格 </div>
    </div>

    <div class="goods-list">
      <GoodsItem v-for="item in search.proList" :key="item.goods_id" :item="item"></GoodsItem>
    </div>
  </div>
</template>

<style lang="less" scoped>
.search {
  padding-top: 46px;

  ::v-deep .van-icon-arrow-left {
    color: #333;
  }

  .tool {
    font-size: 24px;
    height: 40px;
    line-height: 40px;
  }

  .sort-btns {
    display: flex;
    height: 36px;
    line-height: 36px;

    .sort-item {
      text-align: center;
      flex: 1;
      font-size: 16px;
    }
  }
}

// 商品样式
.goods-list {
  background-color: #f6f6f6;
}
</style>
