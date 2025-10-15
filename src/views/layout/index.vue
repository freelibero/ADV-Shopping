<template>
  <div>
    <router-view></router-view>
    <van-tabbar route active-color="#ee0a24" inactive-color="#000">
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">分类页</van-tabbar-item>
      <van-tabbar-item to="/cart" icon="shopping-cart">购物车</van-tabbar-item>
      <van-tabbar-item to="/user" icon="manager">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>

</script>

<style></style>
