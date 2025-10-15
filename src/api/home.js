import request from '@/utils/request'
export const getGoodsItem = () =>
  request.get('/page/detail', {
    params: {
      pageId: 0,
    },
  })
