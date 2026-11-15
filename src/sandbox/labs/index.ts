import type { LabImage } from '../types.ts';
import { LAB_WIRE } from './lab-wire.ts';
import { LAB_HARVEST } from './lab-harvest.ts';
import { LAB_PAYLOAD } from './lab-payload.ts';

export const LAB_IMAGES: LabImage[] = [LAB_WIRE, LAB_HARVEST, LAB_PAYLOAD].sort((a, b) => a.order - b.order);

export function getLabImage(id: string): LabImage | undefined {
  return LAB_IMAGES.find((l) => l.id === id);
}
