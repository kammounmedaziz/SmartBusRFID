export function isPositiveNumber(v){
  const n = Number(v)
  return Number.isFinite(n) && n>0
}

export function isNonEmpty(s){
  return typeof s === 'string' && s.trim().length>0
}
