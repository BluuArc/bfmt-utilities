import {
  PassiveEffect,
  ProcEffect,
  UnknownPassiveEffect,
  UnknownProcEffect,
} from './datamine-types';

// TODO: dynamically create
/**
 * List of proc IDs that are associated with attacks
 */
export const attackingProcs = Object.freeze(['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']));

/**
 * Determine if a given proc ID is associated with an attack
 * @param id Proc ID to test
 */
export function isAttackingProcId (id: string): boolean {
  return attackingProcs.includes(id);
}

/**
 * Determine whether a given effect entry is a passive effect
 * @param effect the effect entry to test
 */
export function isPassiveEffect (effect: any = {}): boolean { // tslint:disable-line no-any
  return !!effect && (
    !isNaN(effect['passive id']) ||
    !isNaN(effect['unknown passive id'])
  );
}

/**
 * Determine whether a given effect entry is a proc effect
 * @param effect the effect entry to test
 */
export function isProcEffect (effect: any = {}): boolean { // tslint:disable-line no-any
  return !!effect && (
    !isNaN(effect['proc id']) ||
    !isNaN(effect['unknown proc id'])
  );
}

/**
 * Get the ID of a given effect entry
 * @param effect the effect entry to read from
 */
export function getEffectId (effect?: {
  // tslint:disable: completed-docs
  'proc id'?: string,
  'unknown proc id'?: string,
  'passive id'?: string,
  'unknown passive id'?: string,
  // tslint:enable: completed-docs
}): string {
  let result = '';
  if (effect) {
    result = (effect as ProcEffect)['proc id'] || (effect as UnknownProcEffect)['unknown proc id'] ||
      (effect as PassiveEffect)['passive id'] || (effect as UnknownPassiveEffect)['unknown passive id'] ||
      result;
  }
  return result;
}
