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



const linkList = JSON.parse(atob(`WyJ0cm9qYW46Ly8xMjNqaWFjaGFvQHd3dy52aXNhLmNvbS5zZzo0NDM/c2VjdXJpdHk9dGxzJnNuaT12cG4tdHJvamFuLjQ0MTYxMjMueHl6JmZwPXJhbmRvbSZ0eXBlPXdzJmhvc3Q9dnBuLXRyb2phbi40NDE2MTIzLnh5eiZwYXRoPSUyRiUzRmVkJTNEMjU2MCN2cG4tdHJvamFuLjQ0MTYxMjMueHl6Iiwidmxlc3M6Ly9jNzAxZDcxOC1mYjRjLTQ5YzMtYjViMy1lNmEyMmMyYzNhNGRAY2YuNDQxNjEyMy54eXo6NDQzP2VuY3J5cHRpb249bm9uZSZzZWN1cml0eT10bHMmc25pPWpjLXhoLjQ0MTYxMjMueHl6JnR5cGU9eGh0dHAmcGF0aD0lMkY0OWMzJm1vZGU9YXV0byN4aHR0cC12bGVzcy1zanozMGNxOCIsInZsZXNzOi8vMjViOTA2YWUtYjhjMi00NjEyLWM1OTUtMTNjNGQ4Nzg5N2NhQGNmLjQ0MTYxMjMueHl6OjQ0Mz9lbmNyeXB0aW9uPW5vbmUmc2VjdXJpdHk9dGxzJnR5cGU9d3MmaG9zdD1jZi40NDE2MTIzLnh5eiZwYXRoPSUyRmNmJTNGZWQlM0QyMDQ4I2NmLXZsZXNzIl0=`));


