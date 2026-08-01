import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const PORT = 3005;

// Start Next.js dev server
const next = spawn("npx", ["next", "dev", "--port", String(PORT)], {
  stdio: "inherit",
  cwd: process.cwd(),
});

// Wait for Next.js to start, then open cloudflared tunnel
setTimeout(() => {
  const tunnel = spawn(
    "cloudflared",
    ["tunnel", "--url", `http://localhost:${PORT}`, "--no-autoupdate"],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let urlPrinted = false;

  const printTunnelUrl = (data) => {
    const text = data.toString();
    // cloudflared prints the URL to stderr
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !urlPrinted) {
      urlPrinted = true;
      console.log("");
      console.log(`  \x1b[36m🌐 Tunnel:\x1b[0m  ${match[0]}`);
      console.log("     ↑ Slack に貼ってスマホで確認できます");
      console.log("");
    }
  };

  tunnel.stdout.on("data", printTunnelUrl);
  tunnel.stderr.on("data", printTunnelUrl);

  tunnel.on("error", (err) => {
    console.error("Tunnel failed:", err.message);
    console.error(
      "cloudflared が見つかりません。インストールしてください:\n  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared",
    );
  });

  const cleanup = () => {
    tunnel.kill();
    next.kill();
    process.exit();
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}, 3000);

next.on("error", (err) => {
  console.error("Next.js failed:", err.message);
  process.exit(1);
});

next.on("close", (code) => {
  process.exit(code ?? 0);
});
