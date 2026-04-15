export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET = list all subscribers
    if (request.method === "GET") {
      const list = await env.SUBSCRIBERS.list();
      const subscribers = [];
      for (const key of list.keys) {
        const value = await env.SUBSCRIBERS.get(key.name);
        subscribers.push(JSON.parse(value));
      }
      return new Response(JSON.stringify({ count: subscribers.length, subscribers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const body = await request.json();
      const email = body.email;

      if (!email || !email.includes("@") || !email.includes(".")) {
        return new Response(JSON.stringify({ error: "Invalid email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const normalized = email.toLowerCase().trim();

      // Check if already subscribed
      const existing = await env.SUBSCRIBERS.get(normalized);
      if (existing) {
        return new Response(JSON.stringify({ message: "Already subscribed" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Store subscriber
      const data = JSON.stringify({
        email: normalized,
        subscribedAt: new Date().toISOString(),
        source: request.headers.get("Referer") || "direct",
      });

      await env.SUBSCRIBERS.put(normalized, data);

      return new Response(JSON.stringify({ message: "Subscribed successfully", stored: normalized }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Bad request", detail: err.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
