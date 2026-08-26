// 圏外でも開けるようにするためだけのもの。
// 🚨 母の語りはここに入れない。保存は index.html 側（端末の中）。
//
// ⚠️ 中身を書き換えたら CACHE の番号を上げること。上げないと古い画面が残る。
// v2 … 2026-08-24。問いを16個足し、重い問いの扱いを変えた（index.html）。
// v3 … 2026-08-27。開いただけで新しい版に入れ替わるようにした（下の fetch）。
const CACHE = "mother-interview-v3";
const FILES = ["./", "./index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// まずネットワーク、だめなら端末の中のものを出す。
// （母が開いたときに、新しい問いが入っていれば新しいほうを使いたい）
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    // 🚨 cache: "no-cache" を外さない。ただの fetch() は端末の中のものを先に見るため、
    //    置き場が付ける「しばらく聞き直さなくてよい」の間、外に出ずに古いものを貯め直す。
    fetch(e.request, { cache: "no-cache" })
      .then((res) => {
        // 🚨 ちゃんと返ってきたものだけ貯める。断られた返事を貯めると、圏外でそれが出る。
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
