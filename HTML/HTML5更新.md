# HTML5 更新
## 1. 语义化标签
### 什么是语义化标签：
编写 HTML 代码时选用能够更好表达内容意义和结构的标签。其实就是根据内容语义化实现代码语义化。

### 语义化标签有哪些：
- nav
- header
- footer
- artical
- section
- aside

### 语义化标签的作用：
1. 有助于SEO
2. 增强代码可读性，有助于开发与维护

## 2. 媒体标签
HTML5 新增了`<audio>`、 `<vedio>` 等媒体标签，原生支持播放音视频，不再依赖于flash等插件。

## 3. 表单类型和表单属性
### （1）表单类型

- email
- number
- search
- url
- date

### （2）表单属性
- `placeholder`：提醒文本
- `autofocus`：自动获取焦点，同时多个表单元素拥有该属性也只有一个元素会获得焦点。
- `required`：不能为空。
- `autocomplete`：是否自动补全。必须要提交过表单并且有 `name` 属性才能使用该属性。

## 4. 进度条
提供了原生进度条 `<progress>` 标签（ IE、Safari 不支持）。但仍要掌握手写进度条。

## 5. DOM 查询操作
添加了 `document.querySelector()` 和 `document.querySelectorAll()` 两个获取 DOM 的 API。

## 6. Web存储
新增了 `localStorage` 和 `sessionStorage` 两个客户端存储数据的方法。

## 7. 图形绘制技术
- `Canvas`：HTML 新增的一个标签，用于位图的绘制。
- `SVG`：SVG是一种矢量图形，HTML5支持直接嵌入`<svg>`标签。