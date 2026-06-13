import http from "https";

export function testKimiKey(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: "moonshot-v1-8k",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5
    });

    const req = http.request({
      hostname: "api.moonshot.cn",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      }
    }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => resolve(false));
    req.write(data);
    req.end();
  });
}

export function testMinimaxKey(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      model: "minimax-text-01",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5
    });

    const req = http.request({
      hostname: "api.minimax.chat",
      path: "/v1/text/chat",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      }
    }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => resolve(false));
    req.write(data);
    req.end();
  });
}
