import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
      component: () => import('@/views/layout/index.vue'),
      children: [
        { path: '/home', component: () => import('../views/layout/home.vue') },
        { path: '/category', component: () => import('../views/layout/category.vue') },
        { path: '/cart', component: () => import('../views/layout/cart.vue') },
        { path: '/user', component: () => import('../views/layout/user.vue') },
      ],
    },
    { path: '/myorder', component: () => import('../views/myorder/index.vue') },
    { path: '/pay', component: () => import('../views/pay/index.vue') },
    { path: '/search', component: () => import('../views/search/index.vue') },
    { path: '/searchlist', component: () => import('../views/search/list.vue') },
    { path: '/prodetail/:id', component: () => import('../views/prodetail/index.vue') },
    { path: '/address', component: () => import('../views/address/index.vue') },
    { path: '/address/create', component: () => import('../views/address/create.vue') },
    { path: '/address/update/:id', component: () => import('../views/address/update.vue') },
    { path: '/login', component: () => import('../views/login/index.vue') },
    { path: '/paymoney', component: () => import('../views/PayMoney/index.vue') },
  ],
})

export default router
