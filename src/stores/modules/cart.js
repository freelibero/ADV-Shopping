import { delSelect, getCartList, getChangeCount } from '@/api/cart'
import { defineStore } from 'pinia'
import { showToast } from 'vant'
export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: [],
  }),
  actions: {
    // 对应 Vuex 的 setCartList mutation
    setCartList(newList) {
      this.cartList = newList
    },
    toggleCheck(goodsId) {
      const goods = this.cartList.find((item) => item.goods_id === goodsId)
      if (goods) {
        goods.isChecked = !goods.isChecked
      }
    },
    toggleAllCheck(flag) {
      this.cartList.forEach((item) => {
        item.isChecked = flag
      })
    },
    changeCount({ goodsId, goodsNum }) {
      const goods = this.cartList.find((item) => item.goods_id === goodsId)
      if (goods) {
        goods.goods_num = goodsNum
      }
    },
    // 对应 Vuex 的 getCartAction action
    async getCartAction() {
      const { data } = await getCartList()
      console.log(data)

      data.list.forEach((item) => {
        // 为每个商品添加 isChecked 属性并设置为 true
        item.isChecked = true
      })
      this.setCartList(data.list)
    },
    async changeCountAction({ goodsNum, goodsId, goodsSkuId }) {
      this.changeCount({ goodsId, goodsNum })
      await getChangeCount(goodsId, goodsNum, goodsSkuId)
    },
    async delSel() {
      const selCartList = this.selCartList
      const carsIds = selCartList.map((item) => item.id)
      await delSelect(carsIds)
      showToast('删除成功')
      await this.getCartAction()
    },
  },
  getters: {
    // 计算购物车商品总数
    cartTotal: (state) => {
      return state.cartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    // 过滤出已选中的商品列表
    selCartList(state) {
      return state.cartList.filter((item) => item.isChecked)
    },
    // 计算已选中商品的总数
    selCount() {
      return this.selCartList.reduce((sum, item) => sum + item.goods_num, 0)
    },
    // 计算已选中商品的总价格，保留两位小数
    selPrice() {
      return this.selCartList
        .reduce((sum, item) => {
          return sum + item.goods_num * item.goods.goods_price_min
        }, 0)
        .toFixed(2)
    },
    isAllChecked(state) {
      return state.cartList.every((item) => item.isChecked)
    },
  },
})
