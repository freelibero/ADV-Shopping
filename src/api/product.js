import request from '@/utils/request'

export const getSeachList = (paramsObj) =>{
  const { categoryId, goodsName, page } = paramsObj
  return request.get('/goods/list',{
    params:{
      categoryId,
      goodsName,
      page
    }
  })
}
