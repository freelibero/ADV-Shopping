import request from '@/utils/request'

export const getCateGoryPage = () => {
  return request.get('/category/list')
}
