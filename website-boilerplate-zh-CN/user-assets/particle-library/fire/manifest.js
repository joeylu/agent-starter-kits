module.exports = {
  name: 'fire',
  description: 'Reusable fire particle textures for sparks, embers, and light smoke.',
  textures: {
    spark: {
      path: 'user-assets/particle-library/fire/fire-spark.png',
      kind: 'single',
      size: [64, 64]
    },
    ember: {
      path: 'user-assets/particle-library/fire/fire-ember.png',
      kind: 'single',
      size: [64, 64]
    },
    smoke: {
      path: 'user-assets/particle-library/fire/fire-smoke.png',
      kind: 'single',
      size: [96, 96]
    }
  },
  presets: {
    itemBurning: {
      effectType: 'continuous',
      recommendedRenderer: 'ParticleContainer',
      textures: ['spark', 'ember', 'smoke'],
      motion: 'upward',
      layer: 'front',
      notes: 'Continuous visible fire effect around the top and sides of an object.'
    },
    emberBurst: {
      effectType: 'burst',
      recommendedRenderer: 'ParticleContainer',
      textures: ['spark', 'ember'],
      motion: 'outward-upward',
      layer: 'front',
      notes: 'Short fire-spark burst for impact or ignition moments.'
    }
  }
};
