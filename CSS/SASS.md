# SASS
一种CSS预处理器，完全兼容所有版本的CSS。

## 1. 注释
SASS里支持两种注释方法：
```css
// 注释

/* 注释 */
```

## 2. 嵌套
SASS中允许嵌套着写样式，得到类似HTML结构的CSS代码。

嵌套写法让拥有相同父元素的继承元素可以一并写在父元素内，简化了代码：
```css
html, body {
  height: 100%;
}

html #root, body #root {
  height: 100%;
}
```
这段代码可简化如下
```css
html, body {
  height: 100%;

  #root {
    height: 100%;
  }
}
```
**注意**：编写SASS是嵌套尽量不要太深不要超过三层。

还可以在嵌套中使用 `&` 代指上一个元素：
```css
button {
  background-color: #fff;
  &:hover {
    background-color: #ccc;
  }
}
```
在CSS中是：
```css
button {
  background-color: #fff;
}

button:hover {
  background-color: #ccc;
}
```

## Sass/Less 对比原生 CSS 的优势
### 1. 能够使用嵌套
使用嵌套使得代码更加简洁易懂。

### 2. 能够直接进行计算
原生CSS想要计算需要通过函数 `calc()` ，没有那么方便代码也比较冗余，在SASS中可以直接进行逻辑运算 `width: 100% / 3;`

### 3. 能够复用
可以利用 `mixin` 声明函数，在其他选择器中复用，支持修改参数等。

### 4. 支持继承/扩展
功能与 `mixin` 相似，但 `extend` 需要基于一个选择器来进行扩展/继承，这个选择器可以是传统选择器也可以是**占位选择器**。

**占位选择器：**只有被 `extend` 的会真正生成样式。
```css
/* This CSS will print because %message-shared is extended. */
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

/* 占位选择器，不会真的有这个选择器，但可以基于它扩展/继承 */
%equal-heights {
  display: flex;
  flex-wrap: wrap;
}

.message {
  @extend %message-shared;
}

.success {
  @extend %message-shared;
  border-color: green;
}

.error {
  @extend %message-shared;
  border-color: red;
}

.warning {
  @extend %message-shared;
  border-color: yellow;
}
```

### 注意：
本来还有支持声明变量这一优势，但现代CSS已经原生支持声明变量了。

## 拓展： CSS预处理器与后处理器
**预处理器：** 是扩展CSS功能的一种语言，通过编译器预编译成标准CSS语言，为原生CSS增加了嵌套、运算、循环、复用等功能。

**后处理器：**不是语言而是一种工具，在样式表生成后处理CSS，通过postCSS等工具编写的代码是不符合CSS规范的，需要在构建阶段借助后处理器构建成标准的CSS语言。