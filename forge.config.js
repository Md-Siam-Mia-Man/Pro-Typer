// forge.config.js
module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon.ico',
  },
  rebuildConfig: {},
  makers: [
    // We only need the packaged files, not a full 'make' from Forge
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    {
      name: "@electron-forge/plugin-fuses",
      config: {
        // Your fuse configurations go here
      },
    },
  ],
};
