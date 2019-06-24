
export function generateInputPairsOfTypesExcept (types = [], valuesToUse = {
  string: 'some string',
  number: 12,
  object: () => ({ some: 'object' }),
  array: () => [],
  function: () => () => {},
}) {
  const generatePair = (name, value) => ({ name, value });
  return [
    !types.includes('undefined') && generatePair('undefined', void 0),
    !types.includes('null') && generatePair('null', null),
    !types.includes('string') && generatePair('a string', valuesToUse.string),
    !types.includes('number') && generatePair('a number', valuesToUse.number),
    !types.includes('object') && generatePair('an object', valuesToUse.object()),
    !types.includes('array') && generatePair('an array', valuesToUse.array()),
    !types.includes('function') && generatePair('a function', valuesToUse.function()),
  ].filter(v => v);
}
