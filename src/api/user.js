import requset from '@/utils/request'

// 获取用户信息详情
export const getUserInfoDetail = () => {
  return requset.get("/user/info");
};
