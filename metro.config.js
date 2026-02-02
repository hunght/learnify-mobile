const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Resolve react-dom/client to empty module for native builds
// This fixes the @expo/log-box incorrectly importing web dependencies
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    (platform === "android" || platform === "ios") &&
    moduleName === "react-dom/client"
  ) {
    return {
      type: "empty",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
