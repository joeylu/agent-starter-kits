module.exports = {
  name: 'smoke',
  description: 'Reusable smoke particle textures for soft puffs and diffuse clouds.',
  textures: {
    puff: {
      path: 'user-assets/particle-library/smoke/smoke-puff.png',
      kind: 'single',
      size: [96, 96]
    },
    soft: {
      path: 'user-assets/particle-library/smoke/smoke-soft.png',
      kind: 'single',
      size: [128, 128]
    }
  },
  presets: {
    softSmoke: {
      effectType: 'continuous',
      recommendedRenderer: 'ParticleContainer',
      textures: ['puff', 'soft'],
      motion: 'slow-upward-drift',
      layer: 'front',
      notes: 'Soft smoke rising from an object.'
    },
    dissipate: {
      effectType: 'burst',
      recommendedRenderer: 'ParticleContainer',
      textures: ['soft'],
      motion: 'expand-and-fade',
      layer: 'front',
      notes: 'Short smoke puff that expands and fades.'
    }
  }
};
