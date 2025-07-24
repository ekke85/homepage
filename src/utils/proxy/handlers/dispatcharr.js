import createLogger from "utils/logger";
import getServiceWidget from "utils/config/service-helpers";
import fetch from "node-fetch";

const logger = createLogger("dispatcharrProxyHandler");

// Simple in-memory cache for tokens
const tokenCache = {};

export default async function dispatcharrProxyHandler(req, res, map) {
  const { group, service, index, endpoint } = req.query;
  const widget = await getServiceWidget(group, service, index);

  if (!widget?.url) {
    logger.error("Missing or invalid url:", widget?.url);
    return res.status(400).send("Widget misconfigured: url missing or not absolute");
  }
  if (!endpoint) {
    logger.error("Missing endpoint");
    return res.status(400).send("Widget misconfigured: endpoint missing");
  }

  // Cache tokens per widget url+username
  const cacheKey = `${widget.url}|${widget.username}`;
  let cache = tokenCache[cacheKey] || {};

  // Simple expiry check
  function isTokenValid() {
    if (!cache.access || !cache.expires) return false;
    return Date.now() < cache.expires - 60 * 1000; // 1min leeway
  }

  async function getToken() {
    // If token is valid, return it
    if (isTokenValid()) return cache.access;

    // If refresh token exists, try refreshing
    if (cache.refresh) {
      const refreshRes = await fetch(`${widget.url}/api/accounts/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: cache.refresh }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        cache.access = data.access;
        // Token expiry 
        cache.expires = Date.now() + 4 * 60 * 1000; // 4min fallback
        tokenCache[cacheKey] = cache;
        return cache.access;
      }
    }

    // If no valid token or refresh, login again
    const tokenRes = await fetch(`${widget.url}/api/accounts/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: widget.username, password: widget.password }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      logger.error("Token fetch failed:", text);
      throw new Error("Dispatcharr login failed: " + text);
    }

    const { access, refresh } = await tokenRes.json();
    cache.access = access;
    cache.refresh = refresh;
    
    cache.expires = Date.now() + 4 * 60 * 1000;
    tokenCache[cacheKey] = cache;

    return cache.access;
  }

  try {
    
    const access = await getToken();
    const apiRes = await fetch(`${widget.url}${endpoint}`, {
      headers: { Authorization: `Bearer ${access}` },
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      logger.error("API fetch failed:", text);
      return res.status(apiRes.status).send(text);
    }

    const apiData = await apiRes.json();
    return res.status(200).json(map ? map(apiData) : apiData);
  } catch (e) {
    logger.error(e);
    return res.status(500).send("Internal server error");
  }
}

