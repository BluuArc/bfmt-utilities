// TODO: dynamically create
export const attackingProcs = Object.freeze(['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']));

export function isAttackingProcId (id: string): boolean {
  return attackingProcs.includes(id);
}
