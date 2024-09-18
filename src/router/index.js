import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/preferences',
    name: 'preferences',
    component: () => import(/* webpackChunkName: "service" */ '../views/PreferencesView.vue')
  },
  {
    path: '/location',
    name: 'location',
    component: () => import(/* webpackChunkName: "service" */ '../views/LocationView.vue')
  },
  {
    path: '/send',
    name: 'send',
    component: () => import(/* webpackChunkName: "service" */ '../views/DIDCommSend.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
