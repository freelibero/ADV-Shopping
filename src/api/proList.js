import request from '@/utils/request'
export const getProDetail = (goodsId) => {
  return request.get('/goods/detail', {
    params: {
      goodsId,
    },
  })
}
export const getProComments = (goodsId, limit) => {
  return request.get('/comment/listRows', {
    params: {
      goodsId,
      limit,
    },
  })
}
