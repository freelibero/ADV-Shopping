import request from '@/utils/request'
export const addCartList = (goodsId, goodsNum, goodsSkuId) => {
  return request.post('/cart/add', {
    goodsId,
    goodsNum,
    goodsSkuId,
  })
}

export const getCartList = () => {
  return request.get('/cart/list')
}

export const getChangeCount = (goodsId, goodsNum, goodsSkuId) => {
  return request.post('/cart/update', {
    goodsId,
    goodsNum,
    goodsSkuId,
  })
}

export const delSelect = (cartIds) => {
  return request.post('/cart/clear', {
    cartIds,
  })
}
