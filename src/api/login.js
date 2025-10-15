import request from '@/utils/request'
// 获取图形验证码
export const userGetCode = () => request.get('/captcha/image')

//获取短信验证码
export const userGetMsgCode = ({ captchaCode, captchaKey, mobile }) =>
  request.post('/captcha/sendSmsCaptcha', {
    captchaCode,
    captchaKey,
    mobile,
  })
// 登录
export const userLoginCode = ({ mobile, smsCode }) => {
  return request.post(
    '/passport/login',
    {
      // 按照规范将参数放在 form 对象中
      form: {
        isParty: false,
        mobile,
        partyData: {},
        smsCode,
      },
    },
    {
      // 添加 platform 请求头
      headers: {
        platform: 'H5',
      },
    },
  )
}
