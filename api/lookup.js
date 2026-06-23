export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: "no key" });
  }

  const response = await fetch("https://YOUR_SHOP.myshopify.com/admin/api/2024-10/graphql.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOPIFY_TOKEN
    },
    body: JSON.stringify({
      query: `
      {
        metaobjects(type: "sidekick_project", first: 50) {
          nodes {
            fields {
              key
              value
            }
          }
        }
      }`
    })
  });

  const data = await response.json();

  const projects = data.data.metaobjects.nodes;

  const match = projects.find(p =>
    p.fields.find(f => f.key === "handle_key")?.value === key
  );

  if (!match) {
    return res.json({ found: false });
  }

  const get = (k) =>
    match.fields.find(f => f.key === k)?.value || null;

  res.json({
    found: true,
    customerName: get("customer_name"),
    serviceType: get("service_type"),
    status: get("status")
  });
}
