import type { RouteRecordRaw } from "vue-router";
const Preview = () => import("../../views/Preview.vue");

const preview : RouteRecordRaw[] =  [{
    name: 'Preview',
    path: "/preview",
    component: Preview,
}]

export default preview;