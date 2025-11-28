export default {
  async fetch(request, env, ctx) {
    // 直接通过 Assets 绑定提供静态资源
    // 文档参考：https://developers.cloudflare.com/workers/static-assets/
    const url = new URL(request.url);

    // 将根路径映射到 index.html
    if (url.pathname === '/' || url.pathname === '') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }

    // 其他路径交给静态资源处理
    const res = await env.ASSETS.fetch(request);
    // 如果未命中静态资源，尝试回退到 index.html（适用于相对路径或子路径）
    if (res.status === 404) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }
    return res;
  }
}
