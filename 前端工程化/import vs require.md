# import VS require

简单来说二者都用于**模块化**，负责把一个模块里的内容引入到另一个模块中使用。

[^模块化]: 一种将复杂 JavaScript 程序拆分成可按需导入的单独模块的机制。

- **import**

import/export来自 **ES Modules（ESM）**，是现代JavaScript的模块语法。

`import` 声明有四种形式：

1. 具名导入：必须使用和导出时相同的名字导入（除非使用as重命名) `import { export1, export2 } from 'module-name'`
2. 默认导入：`import your-name from 'module-name'`
3. 命名空间导入
4. 副作用导入

- **require**

属于 **CommonJS** 的写法，Node.js早期通用的模块语法：

```javascript
// 导出 foo.js
module.export  = { foo() { return 'foo'}}
// 导入
const foo = require('./foo')
```



#### 二者区别

1. import属于ESM的现代语法，而require属于CommonJS（Node经典模块）。

2. **加载时机：**

   require在运行时加载函数，所以可以用于路由懒加载，只在用到时再加载，而import是编译期静态语法，相当于会提升，哪怕放在最后面也会在编译时被解析执行。当然import语法也可以懒加载，但需要用到ESM提供的 import()，返回Promise。



#### Tree-shaking

Tree-shaking 的字面意思是“摇树”——把一棵树上枯黄无用的叶子摇落。在前端工程中，它指代消除死代码，即打包时把那些定义了但从未被引用过的方法或变量剔除掉，从而减小打包体积。

Tree-shaking 的核心原理依赖于 ES6 模块语法——ES Module（ESM）。

**核心原理**

1. **静态模块结构**

   CommonJS 动态模块下打包工具在不运行代码的情况下无法知道到底加载了哪些内容，而 ESM 是静态的，打包工具只要解析代码就能通过抽象语法树确定模块的依赖关系。

2. **实现步骤：**

   1. 解析：将所有源文件解析出抽象语法树。
   
   2. 标记：
      - 从入口文件开始遍历
      - 记录每个模块导出的变量和函数
      - 记录这些导出在其他地方是否被引用
      - Webpack 会给没有用到的导出打上一个特殊标记
   
   3. 代码转换：将代码重新生成，此时未使用的导出代码依然存在
   
   4. 压缩与剔除：
   
      这是真正 shaking 的一步，打包工具本身往往只负责标记，最后的删除动作由压缩器完成，压缩器看到这些被标记为未引用的代码就会将其物理剔除。