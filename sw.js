// 圏外でも開けるようにするためだけのもの。
// 🚨 母の語りはここに入れない。保存は index.html 側（端末の中）。
//
// ⚠️ 中身を書き換えたら CACHE の番号を上げること。上げないと古い画面が残る。
const CACHE = "mother-interview-v1";
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
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
