<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import CountBox from '@/components/CountBox.vue';
import defaultImg from '@/assets/default-avatar.png'
import { loginConfirm } from '@/mixins/loginConfirm';
import { getProDetail, getProComments } from '@/api/proList';
import { addCartList } from '@/api/cart';
import { showToast } from 'vant';
import { useUserStore } from '@/stores';
import { useCartStore } from '@/stores/modules/cart';

const cartStore = useCartStore()
const userStore = useUserStore()

const route = useRoute();
const router = useRouter();


const goodsId = computed(() => route.params.id)
const showActionSheet = ref(false)
const formModel = ref({
  images: [],
  current: 0,
  detail: {},
  total: 0, // 评价总数
  commentList: [], // 评价列表
  defaultImg,
  mode: 'cart', // 标记弹层状态
  addCount: 1, // 数字框绑定的数据
  cartTotal: 0 // 购物车角标
})
const onChange = (index) => {
  formModel.value.current = index;
}
const getDetail = async () => {
  const { data: { detail } } = await getProDetail(goodsId.value)
  formModel.value.detail = detail;
  formModel.value.images = detail.goods_images;
}
const getComment = async () => {
  const { data: { list, total } } = await getProComments(goodsId.value)
  formModel.value.commentList = list;
  formModel.value.total = total;
}
const addFn = () => {
  if (loginConfirm(userStore, router, route)) {
    console.log('登录验证阻止了弹窗显示');
    return
  }
  formModel.value.mode = 'cart'
  showActionSheet.value = true
  console.log('addFn called, showActionSheet:', showActionSheet.value)
}
const buyNow = () => {
  if (loginConfirm(userStore, router, route)) return
  formModel.value.mode = 'buyNow'
  showActionSheet.value = true
  console.log('buyNow called, showActionSheet:', showActionSheet.value)
}
const addCart = async () => {
  if (loginConfirm(userStore, router, route)) return
  const { data } = await addCartList(
    goodsId.value,
    formModel.value.addCount,
    formModel.value.detail.skuList[0]?.goods_sku_id || '',)
  formModel.value.cartTotal = data.cartTotal
  await cartStore.getCartAction()
  showToast({
    message: '添加成功',
    duration: 1000
  })
  showActionSheet.value = false;
  console.log('addCart called, showActionSheet:', showActionSheet.value)
}
const goBuyNow = () => {
  if (loginConfirm(userStore, router, route)) return

  router.push({
    path: 'pay',
    query: {
      mode: 'buyNow',
      goodsId: goodsId.value,
      goodsSkuId: formModel.value.detail.skuList[0]?.goods_sku_id || '',
      goodsNum: formModel.value.addCount
    }
  })
  showActionSheet.value = false;
  console.log('goBuyNow called, showActionSheet:', showActionSheet.value)
}

onMounted(async () => {
  await getDetail();
  await getComment();
})




watch(showActionSheet, (newVal) => {
  console.log('showActionSheet changed:', newVal)
}, { deep: true })
</script>

<template>
  <div class="prodetail">
    <van-nav-bar fixed title="商品详情页" left-arrow @click-left="$router.go(-1)" />

    <van-swipe :autoplay="4000" @change="onChange">
      <van-swipe-item v-for="(image, index) in formModel.images" :key="index">
        <img :src="image.external_url" />
      </van-swipe-item>

      <template #indicator>
        <div class="custom-indicator">{{ formModel.current + 1 }} / {{ formModel.images.length }}</div>
      </template>
    </van-swipe>

    <!-- 商品说明 -->
    <div class="info">
      <div class="title">
        <div class="price">
          <span class="now">￥{{ formModel.detail.goods_price_min }}</span>
          <span class="oldprice">￥{{ formModel.detail.goods_price_max }}</span>
        </div>
        <div class="sellcount">已售 {{ formModel.detail.goods_sales }} 件</div>
      </div>
      <div class="msg text-ellipsis-2">
        {{ formModel.detail.goods_name }}
      </div>

      <div class="service">
        <div class="left-words">
          <span><van-icon name="passed" />七天无理由退货</span>
          <span><van-icon name="passed" />48小时发货</span>
        </div>
        <div class="right-icon">
          <van-icon name="arrow" />
        </div>
      </div>
    </div>

    <!-- 商品评价 -->
    <div class="comment">
      <div class="comment-title">
        <div class="left">商品评价 ({{ formModel.total }}条)</div>
        <div class="right">查看更多 <van-icon name="arrow" /> </div>
      </div>
      <div class="comment-list">
        <div class="comment-item" v-for="item in formModel.commentList" :key="item.comment_id">
          <div class="top">
            <img :src="item.user.avatar_url || defaultImg" alt="">
            <div class="name">{{ item.user.nick_name }}</div>
            <van-rate :size="16" :value="item.score / 2" color="#ffd21e" void-icon="star" void-color="#eee" />
          </div>
          <div class="content">
            {{ item.content }}
          </div>
          <div class="time">
            {{ item.create_time }}
          </div>
        </div>
      </div>
    </div>

    <!-- 商品描述 -->
    <div class="desc" v-html="formModel.detail.content">

    </div>

    <!-- 底部 -->
    <div class="footer">
      <div @click="$router.push('/')" class="icon-home">
        <van-icon name="wap-home-o" />
        <span>首页</span>
      </div>
      <div @click="$router.push('/cart')" class="icon-cart">
        <span v-if="formModel.cartTotal > 0" class="num">{{ formModel.cartTotal }}</span>
        <van-icon name="shopping-cart-o" />
        <span>购物车</span>
      </div>
      <div @click="addFn" class="btn-add">加入购物车</div>
      <div @click="buyNow" class="btn-buy">立刻购买</div>

    </div>

    <!-- 加入购物车/立即购买 公用的弹层 -->
    <van-action-sheet v-model:show="showActionSheet" :title="formModel.mode === 'cart' ? '加入购物车' : '立刻购买'">

      <div class="product">
        <div class="product-title">
          <div class="left">
            <img :src="formModel.detail.goods_image" alt="">
          </div>
          <div class="right">
            <div class="price">
              <span>¥</span>
              <span class="nowprice">{{ formModel.detail.goods_price_min }}</span>
            </div>
            <div class="count">
              <span>库存</span>
              <span>{{ formModel.detail.stock_total }}</span>
            </div>
          </div>
        </div>
        <div class="num-box">
          <span>数量</span>
          <!-- v-model 本质上 :value 和 @input 的简写 -->
          <CountBox v-model="formModel.addCount"></CountBox>
        </div>

        <!-- 有库存才显示提交按钮 -->
        <div class="showbtn" v-if="formModel.detail.stock_total > 0">
          <div class="btn" @click="addCart" v-if="formModel.mode === 'cart'">加入购物车</div>
          <div class="btn now" @click="goBuyNow" v-else>立刻购买</div>
        </div>

        <div class="btn-none" v-else>该商品已抢完</div>
      </div>
    </van-action-sheet>
  </div>
</template>



<style lang="less" scoped>
.prodetail {
  padding-top: 46px;

  :deep(.van-icon-arrow-left) {
    color: #333;
  }

  img {
    display: block;
    width: 100%;
  }

  .custom-indicator {
    position: absolute;
    right: 10px;
    bottom: 10px;
    padding: 5px 10px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 15px;
  }

  .desc {
    width: 100%;
    overflow: scroll;

    :deep(img) {
      display: block;
      width: 100% !important;
    }
  }

  .info {
    padding: 10px;
  }

  .title {
    display: flex;
    justify-content: space-between;

    .now {
      color: #fa2209;
      font-size: 20px;
    }

    .oldprice {
      color: #959595;
      font-size: 16px;
      text-decoration: line-through;
      margin-left: 5px;
    }

    .sellcount {
      color: #959595;
      font-size: 16px;
      position: relative;
      top: 4px;
    }
  }

  .msg {
    font-size: 16px;
    line-height: 24px;
    margin-top: 5px;
  }

  .service {
    display: flex;
    justify-content: space-between;
    line-height: 40px;
    margin-top: 10px;
    font-size: 16px;
    background-color: #fafafa;

    .left-words {
      span {
        margin-right: 10px;
      }

      .van-icon {
        margin-right: 4px;
        color: #fa2209;
      }
    }
  }

  .comment {
    padding: 10px;
  }

  .comment-title {
    display: flex;
    justify-content: space-between;

    .right {
      color: #959595;
    }
  }

  .comment-item {
    font-size: 16px;
    line-height: 30px;

    .top {
      height: 30px;
      display: flex;
      align-items: center;
      margin-top: 20px;

      img {
        width: 20px;
        height: 20px;
      }

      .name {
        margin: 0 10px;
      }
    }

    .time {
      color: #999;
    }
  }

  .footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 55px;
    background-color: #fff;
    border-top: 1px solid #ccc;
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    .icon-home,
    .icon-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;

      .van-icon {
        font-size: 24px;
      }
    }

    .btn-add,
    .btn-buy {
      height: 36px;
      line-height: 36px;
      width: 120px;
      border-radius: 18px;
      background-color: #ffa900;
      text-align: center;
      color: #fff;
      font-size: 14px;
    }

    .btn-buy {
      background-color: #fe5630;
    }
  }
}

.tips {
  padding: 10px;
}

// 弹层的样式
.product {
  .product-title {
    display: flex;

    .left {
      img {
        width: 90px;
        height: 90px;
      }

      margin: 10px;
    }

    .right {
      flex: 1;
      padding: 10px;

      .price {
        font-size: 14px;
        color: #fe560a;

        .nowprice {
          font-size: 24px;
          margin: 0 5px;
        }
      }
    }
  }

  .num-box {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    align-items: center;
  }

  .btn,
  .btn-none {
    height: 40px;
    line-height: 40px;
    margin: 20px;
    border-radius: 20px;
    text-align: center;
    color: rgb(255, 255, 255);
    background-color: rgb(255, 148, 2);
  }

  .btn.now {
    background-color: #fe5630;
  }

  .btn-none {
    background-color: #cccccc;
  }
}


/*:deep(.van-action-sheet) {
  display: block !important;
  z-index: 9999 !important;
}  */

.footer .icon-cart {
  position: relative;
  padding: 0 6px;

  .num {
    z-index: 999;
    position: absolute;
    top: -2px;
    right: 0;
    min-width: 16px;
    padding: 0 4px;
    color: #fff;
    text-align: center;
    background-color: #ee0a24;
    border-radius: 50%;
  }
}
</style>
