declare namespace Bfmt.Utilities.Datamine {
  type ArenaAiEntry = {
    action: string;
    'chance%': number;
    'target conditions': string;
    'target type': string;
  }
  type Unit = {
    ai?: ArenaAiEntry[];
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
    'damage frames': DamageFrames;
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
      attack: MovementEntry;
      skill?: MovementEntry;
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
      _base: StatsEntry;
      _lord: StatsEntry;
    }
  }

  type MovementEntry = {
    'move speed': number;
    'move speed type': string;
    'move type': string;
  }

  type StatsEntry = {
    hp: number;
    atk: number;
    def: number;
    rec: number;
  }

  interface BaseProcEffect {
    'effect delay time(ms)/frame': string;
    'target area': string;
    'target type': string;
  }

  type ProcEffect = BaseProcEffect & {
    'proc id': string;
    [key: string]: any;
  }

  type UnknownProcEffect = BaseProcEffect & {
    'unknown proc id': string;
    'unknown proc param': string;
    [key: string]: any;
  }

  type PassiveEffect = {
    'passive id': string;
    [key: string]: any;
  }

  type UnknownPassiveEffect = {
    'unknown passive id': string;
    'unknown passive params': string;
  }

  type DamageFrames = {
    'effect delay time(ms)/frame': string;
    'frame times': number[];
    'hit dmg% distribution': number[];
    'hit dmg% distribution total': number;
  }

  type BurstLevelEntry = {
    'bc cost': number;
    effects: Array<(ProcEffect | UnknownProcEffect) & { hits?: number; }>;
  }

  type BraveBurst = {
    associated_units?: string[];
    'damage frames': (DamageFrames & { 'proc id': string; hits: number; })[];
    desc: string;
    'drop check count': number;
    id: string;
    name: string;
    levels: BurstLevelEntry[];
  }

  type ExtraSkillCondition = {
    'item required'?: string[];
    'sphere category required'?: string;
    'sphere category required (raw)'?: string;
    'unit required'?: { id: number; name: string; }[];
  }

  type ExtraSkill = {
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

  type SpEnhancementEntry = {
    category: string;
    dependency?: string;
    'dependency comment'?: string;
    id: string;
    skill: SpEnhancementSkill;
  }

  type SpEnhancementSkill = {
    bp: number;
    desc: string;
    effects: SpEnhancementEffect[];
    id: string;
    level: number;
    name: string;
    series: string;
  }

  type SpEnhancementEffect = {
    passive?: PassiveEffect | UnknownPassiveEffect;
    'add to bb'?: ProcEffect | UnknownProcEffect;
    'add to sbb'?: ProcEffect | UnknownProcEffect;
    'add to ubb'?: ProcEffect | UnknownProcEffect;
  }

  type LeaderSkill = {
    desc: string;
    effects: Array<PassiveEffect | UnknownPassiveEffect>;
    id: string;
    name: string;
  }
}
