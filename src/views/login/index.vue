<script setup>
import { useRouter } from 'vue-router';
import { userGetCode, userGetMsgCode, userLoginCode } from '@/api/login';
import { ref, onMounted, onUnmounted } from 'vue';
import { showToast } from 'vant';
import { useUserStore } from '@/stores';

const router = useRouter()
const useStore = useUserStore()
const formModel = ref({
  picUrl: '',
  picKey: '',
  totalSecond: 60,
  timer: null,
  second: 60,
  mobile: '', // 手机号
  picCode: '',
  msgCode: ''
})
const validFn = () => {
  if (!/^1[3-9]\d{9}$/.test(formModel.value.mobile)) {
    showToast('请输入正确的手机号');
    return false;
  }
  if (!/^\w{4}$/.test(formModel.value.picCode)) {
    showToast('请输入正确的图形验证码');
    return false;
  }
  return true;
};
const getPicCode = async () => {
  try {
    const { data: { base64, key } } = await userGetCode()
    formModel.value.picUrl = base64
    formModel.value.picKey = key
  } catch (error) {
    console.error('获取图片验证码失败:', error);
  }
}
const getCode = async () => {
  if (!validFn()) {
    return;
  }
  if (!formModel.value.timer && formModel.value.second === formModel.value.totalSecond) {
    await userGetMsgCode(formModel.value.picCode, formModel.value.picKey, formModel.value.mobile)
    showToast('验证码发送成功，请留意查收')

    formModel.value.timer = setInterval(() => {
      formModel.value.second--

      if (formModel.value.second < 1) {
        clearInterval(formModel.value.timer)
        formModel.value.timer = null
        formModel.value.second = formModel.value.totalSecond
      }
    }, 1000)

  }
}
const login = async () => {
  if (!validFn()) {
    return;
  }
  if (!/^\d{6}$/.test(formModel.value.msgCode)) {
    showToast('请输入正确的手机验证码');
    return;
  }
  try {
    const res = await userLoginCode({
      mobile: formModel.value.mobile,
      smsCode: formModel.value.msgCode
    });
    if (res && res.status === 200) {
      useStore.setToken(res.data.token);
      router.push('/');
      showToast('登录成功');
    } else {
      showToast(res.message || '登录失败，请稍后重试');
      console.error('登录失败，响应数据:', res);
    }
  } catch (error) {
    showToast('登录失败，请稍后重试');
    console.error('登录请求出错:', error);
  }
};
onUnmounted(() => {
  if (formModel.value.timer) {
    clearInterval(formModel.value.timer);
    formModel.value.timer = null;
  }
});
onMounted(() => {
  getPicCode()
})

</script>
<template>
  <div class="login">
    <van-nav-bar title="会员登录" left-arrow @click-left="router.go(-1)" />
    <div class="container">
      <div class="title">
        <h3>手机号登录</h3>
        <p>未注册的手机号登录后将自动注册</p>
      </div>

      <div class="form">
        <div class="form-item">
          <input v-model="formModel.mobile" class="inp" maxlength="11" placeholder="请输入手机号码" type="text">
        </div>
        <div class="form-item">
          <input v-model="formModel.picCode" class="inp" maxlength="4" placeholder="请输入图形验证码" type="text">
          <img v-if="formModel.picUrl" :src="formModel.picUrl" @click="getPicCode" alt="">
        </div>
        <div class="form-item">
          <input v-model="formModel.msgCode" class="inp" placeholder="请输入短信验证码" type="text">
          <button @click="getCode">
            {{ formModel.second === formModel.totalSecond ? '获取验证码' : formModel.second + '秒后重新获取' }}
          </button>
        </div>
      </div>

      <div class="login-btn" @click="login">登录</div>
    </div>
  </div>

</template>
<style scoped lang="scss">
.container {
  padding: 49px 29px;

  .title {
    margin-bottom: 20px;

    h3 {
      font-size: 26px;
      font-weight: normal;
    }

    p {
      line-height: 40px;
      font-size: 14px;
      color: #b8b8b8;
    }
  }

  .form-item {
    border-bottom: 1px solid #f3f1f2;
    padding: 8px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;

    .inp {
      display: block;
      border: none;
      outline: none;
      height: 32px;
      font-size: 14px;
      flex: 1;
    }

    img {
      width: 94px;
      height: 31px;
    }

    button {
      height: 31px;
      border: none;
      font-size: 13px;
      color: #cea26a;
      background-color: transparent;
      padding-right: 9px;
    }
  }

  .login-btn {
    width: 100%;
    height: 42px;
    margin-top: 39px;
    background: linear-gradient(90deg, #ecb53c, #ff9211);
    color: #fff;
    border-radius: 39px;
    box-shadow: 0 10px 20px 0 rgba(0, 0, 0, .1);
    letter-spacing: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
