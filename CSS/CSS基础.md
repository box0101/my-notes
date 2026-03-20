# CSS基础

### 概念

1. #### **单位**

**（1）相对单位**

**①`em` 和 rem**

如果自身没有设置字体大小则`em`按照父元素的字体大小计算，否则则以自身的字体大小为参照。

或者换种说法是：**`em`**是相对于自身字体大小计算的，但当没有显示设置时会继承父元素的字体大小。

`em`有可能会继承任一父元素的字体大小，而rem则没有这种隐患：

rem是相对于根元素的字体大小进行计算的，如果根元素上没有设置字体大小则 `font-size: 1rem;` 等同于 `font-size: initial;` 也就是设置为浏览器默认字体大小。

**② ex 和 `ch`**

`ex` 是相对于小写字母 x 的高度计算的

`ch` 相对于 0 的宽度

所以二者都跟 `font-size` 和 `font-family` 有关

**③ `vw`、`vh`、`vmax` 和 `vmin`**

这四个单位都是相对于视窗计算的，而视窗在web端指可视区域，移动端指的是布局视窗。

`vw` 相对于视口宽度

`vh` 相对于视口高度

`vmax` 取上述二者最大值

`vmin` 取最小值



**（2）绝对单位**

**①`px`**

最常见的一个单位，表示像素

还有 `pt` 、`pc` 、`cm` 、`mm` 等。



**（3） 频率单位**

```css
1kHz = 1000Hz
```



**（4）时间单位**

```css
1s = 1000ms
```



**（5）分辨率单位**

```css
1dppx = 96dpi
1dpi = 0.39dpcm
1dcpm = 2.54dpi
```



**（6）角度单位**

deg：表示度，一个圆角360deg。



**（7）百分比单位**

**①盒模型中：**

`width` 、 `max-width` 、`min-width`等则是盒子width的百分比。

`height` 、`max-height`、 `min-height`等则是盒子height的百分比。

`padding`、 `margin` ：若是水平的边距则为width的百分比，垂直方向则是height的百分比。

**②文本中：**

`font-size`: 相对于父元素的字体大小。

`line-height`： 相对于自身字体大小。



2. #### 选择器



3. #### 居中



4. #### SASS



### 常考面试题

#### CSS隐藏页面元素的方式？有什么区别？

- `display: none`：不在页面中占据空间，Render树也不会包含该元素，故而不会响应绑定的监听事件。
- `visibility: hidden`：仍在页面中占据空间，也会继承给子元素，相当于透明度为0，但与之不同的是不会响应监听事件。
- `opacity: 0`：仍在页面中占据空间，也会响应监听事件。
- `position: absolute`：利用绝对定位使元素脱离文档流然后通过设置位移使其移除视口，也不会响应监听事件。
- `z-index: -1`：将元素放在最底层，如果没有被其他元素覆盖那仍能响应监听事件。
- `transform: scale(0,0)`：让元素被缩放至0，不可响应监听事件。



这其中最常问的是**`display: none`和`visibility: hidden`的区别：**

1. **Render树和文档流中是否存在：**

前者既不在Render树中也不在文档流中占据空间，后者在Render树中也在文档流中占据空间。

2. **能否被继承**

前者不可被继承，带有`display: none`的元素在Render树中不存在也自然不会有子元素，后者可继承。

3. **是否引起回流**

前者会引起回流，后者只会引起重绘。

4. **读屏器是否读取**

前者不会被读取后者会被读取，这也跟在页面中占据位置有关。



#### CSS性能优化怎么做



#### 空块级元素的自身折叠

考察方式如下题：

```vue
<body>
    <!-- 如下代码,AAA 和 BBB 之间的距离是多少 -->
    <style>
    p { 
        font-size: 16px; 
        line-height: 1; 
        margin-top: 10px; 
        margin-bottom: 15px;
    } 
    </style>

    <p>AAA</p>
    <p></p>
    <p></p>
    <p></p>
    <p>BBB</p>
</body>
```

答案是 **15px**。

1. **空块级元素的自身折叠**

   根据 CSS 规范，如果一个块级元素里面没有内容（文本/子元素）、没有 padding、没有 border、没有明确的 height/min-height，那么它的 margin-top 和 margin-bottom 会发生折叠（合并）。

2. **相邻兄弟元素的外边距折叠**

   在标准文档流中相邻的块级兄弟元素的上下边距也会发生折叠。



#### 弹性布局 Flex 的属性和概念

- flex-direction：决定主轴方向（row, column）。
- justify-content：主轴上的对齐方式（center, space-between 等）。
- align-items：交叉轴上的对齐方式（center, flex-start 等）。
- flex-wrap：超出容器是否换行。
- flex：是 flex-grow (放大)、flex-shrink (缩小) 和 flex-basis (基础大小) 的简写。