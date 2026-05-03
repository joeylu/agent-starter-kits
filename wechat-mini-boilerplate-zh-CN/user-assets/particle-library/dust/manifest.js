module.exports = {
  name: 'dust',
  description: 'Reusable dust particle textures for dots, chips, and puffs.',
  textures: {
    dot: {
      path: 'user-assets/particle-library/dust/dust-dot.png',
      kind: 'single',
      size: [64, 64]
    },
    chip: {
      path: 'user-assets/particle-library/dust/dust-chip.png',
      kind: 'single',
      size: [64, 64]
    },
    puff: {
      path: 'user-assets/particle-library/dust/dust-puff.png',
      kind: 'single',
      size: [96, 96]
    }
  },
  presets: {
    groundDust: {
      effectType: 'burst',
      recommendedRenderer: 'ParticleContainer',
      textures: ['dot', 'puff'],
      motion: 'sideways-low-gravity',
      layer: 'front',
      notes: 'Ground contact dust burst.'
    },
    debrisBurst: {
      effectType: 'burst',
      recommendedRenderer: 'ParticleContainer',
      textures: ['dot', 'chip'],
      motion: 'outward-with-gravity',
      layer: 'front',
      notes: 'Small debris burst for impacts.'
    }
  }
};
