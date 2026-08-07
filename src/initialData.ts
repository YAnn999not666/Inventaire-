import { Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-chaussures',
    name: 'Chaussures',
    tiers: [
      { id: 'ch-8000', price: 8000, quantity: 0 },
      { id: 'ch-6000', price: 6000, quantity: 0 },
      { id: 'ch-5000', price: 5000, quantity: 0 },
      { id: 'ch-4000', price: 4000, quantity: 0 },
      { id: 'ch-3500', price: 3500, quantity: 0 },
      { id: 'ch-3000', price: 3000, quantity: 0 },
      { id: 'ch-2500', price: 2500, quantity: 0 },
      { id: 'ch-2000', price: 2000, quantity: 0 },
      { id: 'ch-1500', price: 1500, quantity: 0 },
      { id: 'ch-1000', price: 1000, quantity: 0 },
      { id: 'ch-500', price: 500, quantity: 0 },
    ],
  },
  {
    id: 'cat-sacs',
    name: 'Sacs',
    tiers: [
      { id: 'sa-10000', price: 10000, quantity: 0 },
      { id: 'sa-6000', price: 6000, quantity: 0 },
      { id: 'sa-5000', price: 5000, quantity: 0 },
      { id: 'sa-4000', price: 4000, quantity: 0 },
      { id: 'sa-3000', price: 3000, quantity: 0 },
      { id: 'sa-2000', price: 2000, quantity: 0 },
      { id: 'sa-1000', price: 1000, quantity: 0 },
      { id: 'sa-500', price: 500, quantity: 0 },
    ],
  },
  {
    id: 'cat-ceinture',
    name: 'Ceinture',
    tiers: [
      { id: 'ce-3000', price: 3000, quantity: 0 },
      { id: 'ce-1500', price: 1500, quantity: 0 },
      { id: 'ce-1000', price: 1000, quantity: 0 },
    ],
  },
  {
    id: 'cat-gourdes',
    name: 'Gourdes',
    tiers: [
      { id: 'go-2500', price: 2500, quantity: 0 },
      { id: 'go-1500', price: 1500, quantity: 0 },
      { id: 'go-1000', price: 1000, quantity: 0 },
    ],
  },
  {
    id: 'cat-habit',
    name: 'Habit',
    tiers: [
      { id: 'ha-7500', price: 7500, quantity: 0 },
      { id: 'ha-3000', price: 3000, quantity: 0 },
      { id: 'ha-2000', price: 2000, quantity: 0 },
    ],
  },
];
