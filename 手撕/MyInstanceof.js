function myInstanceof (obj, constructor) {
  let proto = obj.__proto__

  while(proto !== null) {
    if(proto === constructor.prototype) return true
    proto = proto.__proto__
  }

  return false
}


// test
let num = 77
let str = 'gem'

let arr = new Array(3).fill(0)
let obj = {
  name: 'gem',
  age: 18
}

function A () {
  A.name = 'gloria'
}
let a = new A()

console.log('start')
console.log('-----------')

console.log(num instanceof Number)
console.log(str instanceof String)
console.log('----')

console.log(myInstanceof(num, Number))
console.log(myInstanceof(str, String))
console.log(myInstanceof(num, String))
console.log('----')

console.log(myInstanceof(arr, Array))
console.log(myInstanceof(obj, Object))
console.log('----')

console.log(myInstanceof(a, A))