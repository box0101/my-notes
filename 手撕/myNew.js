function myNew (constructor, ...args) {
  let obj = {}
  obj.__proto__ = constructor.prototype
  const result = constructor.call(obj, ...args)
  return result instanceof Array ? result : obj
}

function A (name) {
  console.log(name)
}

let a = myNew(A, 'gem')
console.log(a)
