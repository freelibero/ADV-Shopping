import request from '@/utils/request'

export const getAddress = () => {
  return request.get('/address/list', {})
}
export const defaultAddress = () => {
  return request.get('/address/defaultId', {})
}
export const addressDeatil = () => {
  return request.get('/region/tree')
}
export const addAddress = (data) => {
  return request.post('/address/add', data)
}
export const removeAddress = (data) => {
  return request.post('/address/remove', data)
}
export const editAddress = (data) => {
  return request.post('/address/edit', data)
}
