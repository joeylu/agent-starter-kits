module.exports = {
  name: 'water',
  description: 'Reusable water particle textures for drops, foam, and splash shapes.',
  textures: {
    drop: {
      path: 'user-assets/particle-library/water/water-drop.png',
      kind: 'single',
      size: [64, 64]
    },
    foam: {
      path: 'user-assets/particle-library/water/water-foam.png',
      kind: 'single',
      size: [64, 64]
    },
    splash: {
      path: 'user-assets/particle-library/water/water-splash.png',
      kind: 'single',
      size: [96, 96]
    }
  },
  presets: {
    sideSplash: {
      effectType: 'burst',
      recommendedRenderer: 'ParticleContainer',
      textures: ['drop', 'foam', 'splash'],
      motion: 'sideways-with-gravity',
      layer: 'front',
      notes: 'Obvious water splash burst from the bottom or side of an object.'
    },
    drip: {
      effectType: 'continuous',
      recommendedRenderer: 'ParticleContainer',
      textures: ['drop'],
      motion: 'downward-gravity',
      layer: 'front',
      notes: 'Light dripping water effect.'
    }
  }
};
