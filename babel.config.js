module.exports = function (api) {
    api.cache(true);

    const isNativeWind = process.env.NATIVE_WIND === "true";

    const plugins = [];
    if (isNativeWind) {
        plugins.push("nativewind/babel");
    }

    return {
        presets: ["babel-preset-expo"],
        plugins
    };
};
