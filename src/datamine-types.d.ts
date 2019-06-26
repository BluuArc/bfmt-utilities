export type UnitArenaAiEntry = {
  action: string;
  'chance%': number;
  'target conditions': string;
  'target type': string;
}

export type UnitMovemmentEntry = {
  'move speed': number;
  'move speed type': string;
  'move type': string;
}

export type UnitStatsEntry = {
  hp: number;
  atk: number;
  def: number;
  rec: number;
}

declare interface BaseProcEffect {
  'effect delay time(ms)/frame': string;
  'target area': string;
  'target type': string;
}

export type ProcEffect = BaseProcEffect & {
  'proc id': string;
  [key: string]: any;
}

export type UnknownProcEffect = BaseProcEffect & {
  'unknown proc id': string;
  'unknown proc param': string;
  [key: string]: any;
}

export type PassiveEffect = {
  'passive id': string;
  [key: string]: any;
}

export type UnknownPassiveEffect = {
  'unknown passive id': string;
  'unknown passive params': string;
}

export type DamageFramesEntry = {
  'effect delay time(ms)/frame': string;
  'frame times': number[];
  'hit dmg% distribution': number[];
  'hit dmg% distribution total': number;
}

export type BurstLevelEntry = {
  'bc cost': number;
  effects: Array<(ProcEffect | UnknownProcEffect) & { hits?: number; }>;
}

export type BraveBurst = {
  associated_units?: string[];
  'damage frames': (DamageFramesEntry & { 'proc id': string; hits: number; })[];
  desc: string;
  'drop check count': number;
  id: string;
  name: string;
  levels: BurstLevelEntry[];
}

export type ExtraSkillCondition = {
  'item required'?: string[];
  'sphere category required'?: string;
  'sphere category required (raw)'?: string;
  'unit required'?: { id: number; name: string; }[];
}

export type ExtraSkill = {
  desc: string;
  effects: Array<(PassiveEffect | UnknownPassiveEffect) & {
    conditions: ExtraSkillCondition[];
    'passive target': string;
  }>;
  id: string;
  name: string;
  rarity?: string;
  target: string;
}

export type SpEnhancementEntry = {
  category: string;
  dependency?: string;
  'dependency comment'?: string;
  id: string;
  skill: SpEnhancementSkill;
}

export type SpEnhancementSkill = {
  bp: number;
  desc: string;
  effects: SpEnhancementEffect[];
  id: string;
  level: number;
  name: string;
  series: string;
}

export type SpEnhancementEffect = {
  passive?: PassiveEffect | UnknownPassiveEffect;
  'add to bb'?: ProcEffect | UnknownProcEffect;
  'add to sbb'?: ProcEffect | UnknownProcEffect;
  'add to ubb'?: ProcEffect | UnknownProcEffect;
}

export type LeaderSkill = {
  desc: string;
  effects: Array<PassiveEffect | UnknownPassiveEffect>;
  id: string;
  name: string;
}

export type Unit = {
  ai?: UnitArenaAiEntry[];
  animations?: {
    [key: string]: {
      'total number of frames': number;
    }
  };
  bb?: BraveBurst;
  sbb?: BraveBurst;
  ubb?: BraveBurst;
  category?: number;
  cost: number;
  'damage frames': DamageFramesEntry;
  dictionary?: {
    description?: string;
    evolution?: string;
    fusion?: string;
    summon?: string;
  },
  'drop check count': number;
  element: 'fire' | 'water' | 'earth' | 'thunder' | 'light' | 'dark';
  exp_pattern: number;
  'extra skill'?: ExtraSkill;
  feskills: SpEnhancementEntry[];
  gender: 'male' | 'female' | 'other';
  'getting type': string;
  guide_id: number;
  id: number;
  imp: {
    'max atk': string;
    'max def': string;
    'max hp': string;
    'max rec': string;
  },
  kind: string;
  'lord damage range': string;
  movement: {
    attack: UnitMovemmentEntry;
    skill?: UnitMovemmentEntry;
  },
  name: string;
  'overdrive stats': {
    'atk%': number;
    'def%': number;
    'rec%': number;
  },
  rarity: number;
  'sell caution': boolean;
  stats: {
    anima: {
      atk: number;
      def: number;
      'hp max': number;
      'hp min': number;
      'rec max': number;
      'rec min': number;
    },
    breaker: {
      hp: number;
      rec: number;
      'atk max': number;
      'atk min': number;
      'def max': number;
      'def min': number;
    },
    guardian: {
      hp: number;
      atk: number;
      'def max': number;
      'def min': number;
      'rec max': number;
      'rec min': number;
    },
    oracle: {
      atk: number;
      def: number;
      'hp max': number;
      'hp min': number;
      'rec max': number;
      'rec min': number;
    },
    _base: UnitStatsEntry;
    _lord: UnitStatsEntry;
  }
}
