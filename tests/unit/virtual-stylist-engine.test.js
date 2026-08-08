import { describe, it, expect } from 'vitest';
import { VirtualStylistEngine } from '../../js/virtual-stylist-engine.js';

const topItem = { id: 't1', name: 'White Shirt', color: 'white', style: 'casual' };
const bottoms = [
  { id: 'b1', name: 'Black Jeans', color: 'black', style: 'casual', occasion: 'casual' },
  { id: 'b2', name: 'Green Shorts', color: 'green', style: 'sport', occasion: 'sport' }
];
const footwear = [
  { id: 'f1', name: 'White Sneakers', color: 'white', style: 'casual' }
];

describe('VirtualStylistEngine', () => {
  it('calculates outfit score considering footwear compatibility', () => {
    const engine = new VirtualStylistEngine();
    const scoreWithoutShoe = engine.calculateOutfitScore(topItem, bottoms[0]);
    const scoreWithShoe = engine.calculateOutfitScore(topItem, bottoms[0], footwear[0]);
    
    expect(scoreWithShoe).toBeGreaterThan(scoreWithoutShoe);
  });

  it('recommends bottoms filtered by occasion', () => {
    const engine = new VirtualStylistEngine();
    const casualRecs = engine.recommendBottoms(topItem, bottoms, 'casual');
    
    expect(casualRecs).toHaveLength(1);
    expect(casualRecs[0].bottom.name).toBe('Black Jeans');
  });

  it('generates complete outfit ensemble (top, bottom, footwear)', () => {
    const engine = new VirtualStylistEngine();
    const ensemble = engine.generateFullEnsemble(topItem, bottoms, footwear, 'casual');

    expect(ensemble).not.toBeNull();
    expect(ensemble.top.name).toBe('White Shirt');
    expect(ensemble.bottom.name).toBe('Black Jeans');
    expect(ensemble.footwear.name).toBe('White Sneakers');
    expect(ensemble.totalScore).toBeGreaterThan(70);
  });
});
