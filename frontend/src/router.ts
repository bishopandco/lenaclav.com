import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("./views/HomeView.vue"),
    },
    {
      path: "/blog",
      name: "blog-index",
      component: () => import("./views/BlogIndexView.vue"),
    },
    {
      path: "/env",
      name: "env",
      component: () => import("./views/EnvView.vue"),
    },
    {
      path: "/blog/:id",
      name: "blog-show",
      component: () => import("./views/BlogShowView.vue"),
      props: true,
    },
    {
      path: "/signin",
      name: "sign-in",
      component: () => import("./views/SignInView.vue"),
    },
    {
      path: "/signup",
      name: "sign-up",
      component: () => import("./views/SignUpView.vue"),
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("./views/ResetPasswordView.vue"),
    },
    {
      path: "/admin",
      meta: { requiresAuth: true },
      component: () => import("./views/admin/AdminLayout.vue"),
      children: [
        {
          path: "",
          redirect: { name: "admin-blog-list" },
        },
        {
          path: "events",
          name: "admin-event-list",
          component: () => import("./views/admin/EventAdminListView.vue"),
        },
        {
          path: "events/new",
          name: "admin-event-new",
          component: () => import("./views/admin/EventAdminEditView.vue"),
          props: { mode: "create" },
        },
        {
          path: "events/:id",
          name: "admin-event-edit",
          component: () => import("./views/admin/EventAdminEditView.vue"),
          props: (route) => ({ mode: "edit", id: route.params.id }),
        },
        {
          path: "blogs",
          name: "admin-blog-list",
          component: () => import("./views/admin/BlogAdminListView.vue"),
        },
        {
          path: "blogs/new",
          name: "admin-blog-new",
          component: () => import("./views/admin/BlogAdminEditView.vue"),
          props: { mode: "create" },
        },
        {
          path: "blogs/:id",
          name: "admin-blog-edit",
          component: () => import("./views/admin/BlogAdminEditView.vue"),
          props: (route) => ({ mode: "edit", id: route.params.id }),
        },
      ],
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.ensureSession();
  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return {
      path: "/signin",
      query: { redirect: to.fullPath },
    };
  }
  return true;
});

export default router;
