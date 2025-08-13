export default {
  async scheduled(event, env, ctx) {
    const KV_DB = env.API_KV_DB;
    // Write code for updating your API
    switch (event.cron) {
      case "0 */1 * * *":
        let ipList= await fetchIpList();
        if (ipList.length === 0) {
          console.error("IP list is empty. Skipping link generation.");
          return;
        }
        const generatedLinks = [];
        linkList.forEach((link) => {
          ipList.forEach((ip, i) => {
            try {
              const newVlessUrl = new URL(link);
              if (ip.includes(":")) {
                const [host, port] = ip.split(":");
                newVlessUrl.hostname = host;
                newVlessUrl.port = port;
                newVlessUrl.hash = +newVlessUrl.hash + "_" + host + "_" + port;
              } else {
                newVlessUrl.hostname = ip;
                newVlessUrl.hash = newVlessUrl.hash + "_" + ip;
              }
              generatedLinks.push(newVlessUrl.toString());
            } catch (e) {
              console.warn(
                `Error processing IP "${ip}": ${e.message}. Skipping this IP.`
              );
            }
          });
        });

        await KV_DB.put("best-vless", generatedLinks.join("\n"));
        console.log(generatedLinks)

        break;
      case "*/10 * * * *":
        break;
      case "*/45 * * * *":
        break;
      default:
        break;
    }
    console.log("cron processed");
  },
};

async function fetchIpList() {
  const url = "https://ip.164746.xyz/ipTop10.html";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const ipsText = await response.text();
    let ipList = ipsText
      .split(",")
      .map((ip) => ip.trim())
      .filter((ip) => ip);
    // ipList.push(...optimizedDomains)
    return ipList;
  } catch (error) {
    console.error("Error fetching IP list:", error);
  } finally {
  }
}




const linkList = [
  "vless://b3bf87f8-4e28-4977-aa43-96e23de62518@usa.visa.com:443?encryption=none&security=tls&sni=vpn-vless.4416123.xyz&fp=randomized&type=ws&host=vpn-vless.4416123.xyz&path=%2F%3Fed%3D2560#CF_V8_usa.visa.com_443",
  "vless://25b906ae-b8c2-4612-c595-13c4d87897ca@cf.4416123.xyz:443?encryption=none&security=tls&type=ws&host=cf.4416123.xyz&path=%2Fcf%3Fed%3D2048#cf-vless",
  "trojan://123jiachao@www.visa.com.sg:443?security=tls&sni=vpn-trojan.4416123.xyz&fp=random&type=ws&host=vpn-trojan.4416123.xyz&path=%2F%3Fed%3D2560#vpn-trojan.4416123.xyz",
];
