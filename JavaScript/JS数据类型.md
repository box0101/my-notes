# 数据类型

JS有八种数据类型：`Number`、`String`、`Boolean`、`Null`、`Undefined`、`BigInt`、`Symbol`、`Object`。

`Object` 又包括 `Array`、`Function`、`Set`、`Date` 等特殊的对象类型。

**BigInt 和 Symbol 是 ES6 新增的数据类型：**

- BigInt 是一种数字类型，可以表示无限制精度格式的数字，主要用于存储超大数。
- Symbol 是一种创建后独一无二且不能修改的类型。用于创建唯一标识符和隐藏对象属性，增强了对象的可扩展性和安全性。



**原始数据类型和引用类型：**

二者区别主要在于**存储的位置**不同：

- 原始数据类型直接存储在栈中，占据空间小，大小固定，属于被频繁使用的数据。
- 引用类型存储在堆中，但在栈内有指针指向堆中的起始地址，访问引用类型时先在栈内拿到地址再访问值。

[^栈]: 数据结构中：栈是先进先出的数据结构；操作系统中栈区内存由编译器分配释放。
[^堆]: 数据结构中：堆是一个优先队列，按优先级来进行排序，优先级可以按照大小规定；操作系统中：堆区内存一般由开发者分配释放。



**undefined 和 null：**undefined 是值缺失（未定义），而 null 是对象缺失（空对象）。

- `undefined` 表示变量已经声明但没有赋值或表示对象属性不存在，是 JavaScript 的默认值；
-  `null` 表示开发者主动赋的空值，通常用来表示对象为空。

当二者使用”==“比较时认为二者是相等的，如果是全等号===则是不等的。



### 常考面试题

#### 如何判断数据类型
1. **instanceof**

通过比较对象的原型链上是否有该类型的原型判断对象类型。

要注意的是内置instanceof函数只能判断对象类型而不能判断原始类型。

**面试常考手写instanceof：**
```js
function myInstanceof(obj, constructor) {
    let proto = obj.__proto__;
    
    while(proto) {
        if(proto === constructor.prototype) {
            return true;
        }
        proto = proto.__proto__;
    }
    return false;
}
```

面试会问到：

**为什么instanceof可以判断引用类型？**

核心是JS的原型链机制。instanceof通过在对象的原型链上寻找是否存在目标构造函数的原型prototype属性来判断类型。

2. **constructor**

`constructor` 是一个属性，指向创建对象的构造函数。所以通过 `constructor` 属性，我们可以判断一个对象的类型。

```js
console.log((77).constructor === Number) // true
console.log(([]).constructor === Array) // true
```

要注意的是如果原型被改变就不能用 constructor 来判断数据类型了。

3. **typeof**

只能判断原始数据类型。

4. **Object.prototype.toString.call()**

使用 Object 的原型上的方法 `.toString` 拿到当前的数据类型。

JavaScript 中每个对象都有一个内置属性 `[[Class]]`，表示对象类型，但不能直接拿到而是可以通过 `.toString` 方法访问，由于很多对象的这个方法都被重写了，所以就要拿到 Object 原型上的方法并指向要判断的变量。



综上，如果问**判断数组的方法**：

①采用数组的原生方法`Array.isArray()`

②利用`instanceof`跟Array比较：`[1, 2] instanceof Array` => true

③通过变量的`constrcutor`属性比较：`([1, 2]).constructor === Array`

④利用 Object 的原型上的方法：`Object.prototype.toString.call([1, 2]) // [object Array]`

⑤通过`Array.prototype.isPrototypeOf`：`Array.prototype.isPrototypeOf([1, 2])` => true



#### 什么是 JS 的包装类型
在 JavaScript 中基本类型是没有属性和方法的，为了便于操作在基本类型调用属性或方法时后台会隐式转换成对象。例如 `str.length`, `str.toUpperCase()`。



#### ⭐常见数组方法

可以分为两类：会改变原数组的和不会改变原数组的，

**会改变原数组：**

- `shift()`、`unshift()`、`pop()`、`push()`：对数组首/尾部增删
- `splice()`：删除/替换/插入任意位置，都是根据`splice(删除的位置，删除的个数，插入的元素)`为基础进行操作，删除就只需要写入删除的起始索引和删除个数，替换则加入要替换的值，插入则删除**0**个元素。
- `forEach()`:迭代方法，forEach方法本身不会改变数组但是方法里的回调函数会修改数组。
- `sort()`：对数组原地排序。
- `reserve()`：原地反转。
- `fill()`：填充数组。

**不会改变数组：**

- `toString()`、`join()`：转换成字符串。
- `slice()`：从现有数组中截取出一部分作为新数组，语法是`array.slice(startIndex, endIndex)`，左闭右开。和`splice()`长得很像功能也有些类似但对数组影响不同，`slice()`会返回新数组不改变原数组。
- `concat()`：将传入的值拼接在当前数组后面，如果传入的是数组会解包一层拼进去，如果拼接的是对象则是浅拷贝。
- `every()`、`some()`、`map()`、`filter()`：迭代方法，`map()`和`filter()`会返回新数组，every和some都是只读方法，用于判断，返回true/false。
- `reduce()`：累加器。
- `flat()`：数组扁平化，通过传参控制展开几层，返回新数组。

长得很像的三个：`splice()`、`slice()`、`split()`要注意区别，其中`split()`是字符串方法不是数组方法，会将字符串按要求分割并拼接成数组。



#### 原型和原型链

原型分为**显示原型(`prototype`)**和**隐式原型(`._proto_`)**。

显示原型是构造函数的一个内部属性，用于存放该构造函数的所有实例共享的方法和属性。

隐式原型则是实例对象的一个隐式属性，是所有对象都有的一个属性，指向其构造函数的显示原型。

当访问一个变量的某个属性或方法时，首先在它自己身上找，如果没有则向上查找它的原型对象，层层向上查找直到找到`Object.prototype`，这一过程就是**原型链**。



#### == 操作符的强制类型转换规则

相同类型直接比较值，null 和 undefined 视为相等

布尔值会变数字，字符串和数字相比较会将字符串转为数字

对象和原始类型比较会对对象取值，执行`.valueof()`或`.toString()`



#### map 和 weakMap 的区别

Map 和 WeakMap 都是存放键值对的数据结构，主要区别有三点：

- **键名（Key）的类型限制不同：**

  Map 的键可以是任何类型，WeakMap 的键只能是对象或者非全局注册的 Symbol。

- **对垃圾回收机制的影响不同（强弱引用）：**

  Map 对它的键是强引用，这就意味着只要 Map 实例还在它的键值对就不会被垃圾回收机制回收。WeakMap 对它的键是弱引用，如果没有其他地方指向这个键对象，垃圾回收机制就会自动回收这个对象所占的内存，WeakMap 中对应的键值对也会自动消失。

- **可遍历性与属性的区别：**

  Map 是可以遍历的，有 `keys()`、`values()`、`entries()` 方法，可以使用 `forEach` 和 `for...of` 循环。它还有 `size` 属性可以获取当前键值对的数量，以及 `clear()` 方法清空所有数据。WeakMap 是不可遍历的，也没有 `size()`、`clear()` 这些属性和方法。

在实际开发中，如果要在 DOM 节点上关联数据，或者像 Vue3 响应式系统底层那样缓存代理对象，通常都会采用 WeakMap 来防止内存泄漏。



#### 技巧性题目：如何让 a == 1 && a == 2 && a == 3 成立？

可以利用对象转原始数据的 `.valueof()` 函数重写来实现：

```javascript
const a = {
    value: 0;
    valueof: function() {
        this.value++;
        return this.value
    }
}

// console.log(a == 1); ->true，对象和基本数据类型比较会先调用 .valueof 方法转换
// console.log(a == 2); ->true
// console.log(a == 3); ->true
console.log(a == 1 && a == 2 && a == 3); // true
```

