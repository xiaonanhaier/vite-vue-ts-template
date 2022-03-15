import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import type { App } from "vue";

const modules = import.meta.globEager('./modules/**/*.ts');

const routeModuleList: RouteRecordRaw[] = [];

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});


export const rootRoute: RouteRecordRaw = {
    path: '/',
    name: 'Root',
    redirect: '/preview'
};

const router = createRouter({
    history: createWebHistory(),
    routes: [rootRoute, ...routeModuleList],
    strict: true
});

export default function setupRouter (app: App) {
    app.use(router)
}