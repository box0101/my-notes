# 数据类型

JS有八种数据类型：`Number`、`String`、`Boolean`、`Null`、`Undefined`、`Object`、`BigInt`、`Symbol`。

### BigInt 和 Symbol 是 ES6 新增的数据类型：
- BigInt 是一种数字类型，可以表示无限制精度格式的数字，主要用于存储超大数。
- Symbol 是一种创建后独一无二且不能修改的类型。

### 原始数据类型和引用类型：
二者区别主要在于存储的位置不同：

- 原始数据类型直接存储在栈中，占据空间小，大小固定，属于被频繁使用的数据。
- 引用类型存储在堆中，但在栈内有指针指向堆中的起始地址，访问引用类型时先在栈内拿到地址再访问值。

### 堆和栈：

- 数据结构中：
  - 栈是先进先出的数据结构。
  - 堆是一个优先队列，按优先级来进行排序，优先级可以按照大小规定。
- 操作系统中：
  - 栈区内存由编译器分配释放。
  - 堆区内存一般由开发者分配释放。


### undefined 和 null
undefined 是值缺失，而 null 是对象缺失。

## 如何判断数据类型
### 1. instanceof
通过比较对象的原型链上是否有该类型的原型判断对象类型。

要注意的是内置instanceof函数只能判断对象类型而不能判断原始类型。

**面试常考手写instanceof：**
```js
function myInstanceof (obj, constructor) {
  let proto = obj.__proto__

  while(proto !== null) {
    if(proto === constructor.prototype) return true
    proto = proto.__proto__
  }

  return false
}
```

### 2. constructor
可以访问变量的 `constructor` 属性判断数据类型。
```js
console.log((77).constructor === Number) // true
console.log(([]).constructor === Array) // true
```

要注意的是如果原型被改变就不能用 constructor 来判断数据类型了。

### 3. typeof
只能判断原始数据类型。

### 4. Object.prototype.toString.call()
使用 Object 的原型上的方法 `.toString` 拿到当前的数据类型。

## JS 的包装类型
在 JavaScript 中基本类型是没有属性和方法的，为了便于操作在基本类型调用属性或方法时后台会隐式转换成对象。

例如 `str.length`, `str.toUpperCase()`。