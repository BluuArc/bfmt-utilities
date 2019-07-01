import { ProcEffect, UnknownProcEffect, PassiveEffect, UnknownPassiveEffect } from "./datamine-types";

// TODO: dynamically create
/**
 * @type {string[]} List of proc IDs that are associated with attacks
 */
export const attackingProcs = Object.freeze(['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']));

/**
 * Determine if a given proc ID is associated with an attack
 * @param id Proc ID to test
 */
export function isAttackingProcId (id: string): boolean {
  return attackingProcs.includes(id);
}

export function isPassiveEffect (effect: any = {}): boolean {
  return effect && (
    !isNaN(effect['passive id']) ||
    !isNaN(effect['unknown passive id'])
  );
}

export function isProcEffect (effect: any = {}): boolean {
  return effect && (
    !isNaN(effect['proc id']) ||
    !isNaN(effect['unknown proc id'])
  );
}

export function getEffectId (effect?: {
  'proc id'?: string,
  'unknown proc id'?: string,
  'passive id'?: string,
  'unknown passive id'?: string,
}): string {
  let result = '';
  if (effect) {
    result = (<ProcEffect>effect)['proc id'] || (<UnknownProcEffect>effect)['unknown proc id'] ||
      (<PassiveEffect>effect)['passive id'] || (<UnknownPassiveEffect>effect)['unknown passive id'] ||
      result;
  }
  return result;
}
