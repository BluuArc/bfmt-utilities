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
