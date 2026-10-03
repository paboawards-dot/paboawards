/**
 * Appel HTTPS passant par un proxy à adresse IP FIXE (CONNECT), sans aucune dépendance externe.
 * Sert uniquement aux appels vers CinetPay (liste blanche IP). Activé si CINETPAY_PROXY_URL est défini,
 * ex : http://utilisateur:motdepasse@proxy.exemple.com:9293
 */
import http from "http";
import https from "https";
import tls from "tls";

export type ProxyResult = { status: number; text: string };

export function proxyConfigured(): boolean {
  return !!process.env.CINETPAY_PROXY_URL;
}

export function fetchViaProxy(
  method: string,
  urlStr: string,
  headers: Record<string, string>,
  body: string | undefined,
  timeoutMs = 15000,
): Promise<ProxyResult> {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (err: Error | null, val?: ProxyResult) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      err ? reject(err) : resolve(val as ProxyResult);
    };
    const timer = setTimeout(() => {
      finish(new Error("proxy_timeout"));
      try { creq.destroy(); } catch { /* rien */ }
    }, timeoutMs);

    const target = new URL(urlStr);
    const proxy = new URL(process.env.CINETPAY_PROXY_URL as string);
    const tport = Number(target.port) || 443;
    const hostPort = `${target.hostname}:${tport}`;

    const connectHeaders: Record<string, string> = { Host: hostPort };
    if (proxy.username) {
      const cred = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
      connectHeaders["Proxy-Authorization"] = "Basic " + Buffer.from(cred).toString("base64");
    }
    const secureProxy = proxy.protocol === "https:";
    const creq = (secureProxy ? https : http).request({
      host: proxy.hostname,
      port: Number(proxy.port) || (secureProxy ? 443 : 80),
      method: "CONNECT",
      path: hostPort,
      headers: connectHeaders,
    });
    creq.on("error", (e) => finish(new Error("proxy_error " + e.message)));
    creq.on("connect", (cres, socket) => {
      if (cres.statusCode !== 200) {
        socket.destroy();
        return finish(new Error("proxy_refused http=" + cres.statusCode));
      }
      const payload = body ? Buffer.from(body) : undefined;
      const req = https.request(
        {
          host: target.hostname,
          port: tport,
          method,
          path: target.pathname + target.search,
          headers: { ...headers, ...(payload ? { "Content-Length": String(payload.length) } : {}) },
          agent: false,
          createConnection: () => tls.connect({ socket, servername: target.hostname }),
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => finish(null, { status: res.statusCode || 0, text: Buffer.concat(chunks).toString("utf8") }));
          res.on("error", (e) => finish(e));
        },
      );
      req.on("error", (e) => finish(new Error("proxy_tls_error " + e.message)));
      if (payload) req.write(payload);
      req.end();
    });
    creq.end();
  });
}
