/** Light, matte palettes. Every colour in the 3D world and the UI comes from here. */
export interface Palette {
  name: string;
  /** page + sky */
  bg: string;
  /** the board everything sits on */
  ground: string;
  groundEdge: string;
  pad: string;
  road: string;
  roadEdge: string;
  /** main and second accent */
  accent: string;
  accent2: string;
  ink: string;
  muted: string;
  /** computer-part materials */
  pcb: string;
  chip: string;
  metal: string;
  gold: string;
  plastic: string;
  car: string;
}

export const palettes = {
  sage: {
    name: 'Sage Clay',
    bg: '#E8EDE7', ground: '#F3F5F1', groundEdge: '#D3DCD1', pad: '#E1E8DF',
    road: '#A9B5A6', roadEdge: '#F8F9F6',
    accent: '#5D8A6C', accent2: '#E39A72',
    ink: '#24302A', muted: '#66756B',
    pcb: '#7FA38A', chip: '#3C433E', metal: '#C9CEC9', gold: '#C9A96B', plastic: '#343B36',
    car: '#E39A72',
  },
  lilac: {
    name: 'Lilac Mist',
    bg: '#ECEAF3', ground: '#F6F5FA', groundEdge: '#DAD6E6', pad: '#E6E3EF',
    road: '#B2ACCA', roadEdge: '#F9F8FC',
    accent: '#7266B6', accent2: '#EC9C84',
    ink: '#29263E', muted: '#736E8A',
    pcb: '#958BC6', chip: '#3C3949', metal: '#CCC9D5', gold: '#CDAA6E', plastic: '#33303F',
    car: '#EC9C84',
  },
  sky: {
    name: 'Sky Chalk',
    bg: '#E5EEF4', ground: '#F3F7FA', groundEdge: '#CFDCE5', pad: '#DFE8EE',
    road: '#A6BACA', roadEdge: '#F7FAFC',
    accent: '#3E7BAC', accent2: '#EFBC5C',
    ink: '#1D2A36', muted: '#647788',
    pcb: '#6F9DC1', chip: '#34414C', metal: '#C7D0D7', gold: '#CFAE68', plastic: '#2C3742',
    car: '#EFBC5C',
  },
} satisfies Record<string, Palette>;

export type PaletteKey = keyof typeof palettes;
export const paletteKeys = Object.keys(palettes) as PaletteKey[];
export const defaultPalette: PaletteKey = 'sage';
