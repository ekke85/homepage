import dispatcharrProxyHandler from "utils/proxy/handlers/dispatcharr";

const widget = {
  api: "{url}{endpoint}",
  proxyHandler: dispatcharrProxyHandler,
  mappings: {
    status: {
      endpoint: "/proxy/ts/status", 
    },
    version: {
      endpoint: "/api/core/version/",
    },
    channels: {
      endpoint: "/api/channels/channels/",
    },
    groups: {
      endpoint: "/api/channels/streams/groups/",
    },
  },
};

export default widget;


