import type { ComponentType } from 'react';
import type { PartKey, Stop } from '@/content/types';
import AiChip from './AiChip';
import CacheStack from './CacheStack';
import Cores from './Cores';
import Cpu from './Cpu';
import GpuCard from './GpuCard';
import IoPanel from './IoPanel';
import M2Ssd from './M2Ssd';
import Motherboard from './Motherboard';
import PowerSupply from './PowerSupply';
import RamKit from './RamKit';

export interface PartProps {
  /** repeated items (RAM sticks, cores) */
  count?: number;
  /** true while the visitor is parked at this stop */
  active?: boolean;
  /** the stop's content, for parts that show it in 3D (skill balls on the cores) */
  data?: Stop;
}

/** Maps each stop's `part` key to its 3D model. */
export const parts: Record<PartKey, ComponentType<PartProps>> = {
  cpu: Cpu,
  motherboard: Motherboard,
  cores: Cores,
  ram: RamKit,
  cache: CacheStack,
  ssd: M2Ssd,
  coprocessor: AiChip,
  gpu: GpuCard,
  psu: PowerSupply,
  io: IoPanel,
};
