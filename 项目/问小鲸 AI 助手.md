# 问小鲸AI助手技术文档

## 项目概述

"问小鲸"是Datawhale平台集成的AI学习助手，基于跨域 iframe + postMessage 通信技术实现，能够实时解析课程内容并动态投喂给大模型，为学习者提供智能问答和辅助学习功能。

## 核心功能实现

### 1. 跨域通信机制

#### 1.1 iframe嵌入方案
```vue
<!-- WenXiaoJing.vue -->
<iframe
  ref="wxjIframe"
  :src="wxjUrl"
  frameborder="0"
  class="wxj-iframe"
  allow="microphone; camera; clipboard-read; clipboard-write"
  @load="handleIframeLoad"
/>
```

**技术要点**：
- **环境隔离**：AI助手运行在独立域名（wxj.datawhale.cn）
- **安全沙箱**：iframe提供天然的运行环境隔离
- **权限控制**：通过allow属性控制API访问权限

#### 1.2 postMessage通信协议
```typescript
// 核心通信方法
const postMessageToIframe = (message: any) => {
  if (wxjIframe.value) {
    wxjIframe.value.contentWindow?.postMessage(
      {
        ...message,
        current_url: window.location.href,
      },
      wxjUrl, // 严格的目标域名验证
    );
  }
};
```

**安全机制**：

- **域名验证**：postMessage指定目标域名，防止恶意攻击
- **消息格式**：结构化的消息格式确保数据一致性
- **来源检查**：接收方验证消息来源的合法性

### 2. DOM内容解析与投喂

#### 2.1 实时内容提取
```typescript
// 内容提取核心逻辑
const postContentToWxj = async () => {
  await nextTick(); // 确保DOM更新完成
  const doc = document.querySelector('.doc') || document.querySelector('#tree-render');
  if (doc) {
    wxjRef.value?.postMessageToIframe({
      type: 'content',
      text: doc.textContent || (doc as HTMLElement).innerText || '',
      html: doc.innerHTML,
      learnId: route.params.learnId,
      contentId: route.params.contentId,
    });
  }
};
```

**技术实现**：
- **DOM选择器**：精准定位课程内容容器
- **文本提取**：textContent获取纯文本，innerHTML保留格式
- **异步处理**：nextTick确保DOM渲染完成

#### 2.2 内容清理优化
```typescript
function cleanCourseContent(content: string) {
  // 移除图片块等非文本内容
  let cleanedContent = content
    .replace(/````\{multi-images\}[\s\S]*?````/g, '')
    .replace(/```\{img\}[\s\S]*?```/g, '');

  // 格式化处理
  cleanedContent = cleanedContent
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  return cleanedContent;
}
```

**清理策略**：
- **过滤非文本**：移除图片、代码块等干扰内容
- **格式标准化**：统一换行和空格处理
- **长度控制**：截断避免大模型token超标

### 3. 集成架构设计

#### 3.1 组件通信模式
```vue
<!-- 内容页面集成 -->
<WenXiaoJing
  v-model="showWxj"
  ref="wxjRef"
  @iframe-load="postContentToWxj"
/>
```

**集成要点**：
- **双向绑定**：v-model控制显示状态
- **事件驱动**：iframe加载完成后触发内容投喂
- **引用暴露**：通过ref暴露通信方法

#### 3.2 内容同步机制
```typescript
// 路由变化时同步内容
watch(
  () => route.params.contentId,
  async () => {
    void postContentToWxj();
  },
);
```

**同步策略**：
- **响应式监听**：Vue watch监听路由参数变化
- **自动投喂**：课程切换时自动更新AI助手内容
- **状态管理**：确保内容与当前学习进度一致

## 技术亮点

### 1. 安全的跨域通信
- **严格验证**：postMessage目标域名白名单
- **数据隔离**：iframe提供天然安全边界
- **权限控制**：精细化的API访问权限管理

### 2. 高效的DOM解析
- **精准定位**：基于CSS选择器的内容提取
- **性能优化**：异步处理和内容截断机制
- **格式保留**：同时提供纯文本和HTML格式

### 3. 智能的内容投喂
- **实时同步**：路由变化自动更新内容
- **上下文感知**：携带课程ID和内容ID信息
- **业务集成**：与学习进度深度结合

## 总结

通过 iframe + postMessage 的跨域通信方案和DOM内容解析技术，成功实现了"问小鲸"AI助手的无缝集成。该方案不仅解决了第三方服务集成的安全性问题，还提供了高效的内容同步机制，为学习者创造了智能化的学习体验。



### 面试 Q&A

- **必问题**：为什么选择 iframe + postMessage？有没有考虑过其他跨域方案（如 JSONP、CORS、WebSocket）？
- **深挖点**：“DOM 解析实时提取课程文本”具体是怎么做的？提取哪些内容？如何避免提取到无关内容（如导航栏、广告）？
- **考察点**：跨域通信方案的选型依据、DOM操作性能考量

**Q1：** 看你实习做了AI助手集成，用的iframe + postMessage。**为什么要用iframe？直接嵌入不香吗？如果用户禁用iframe怎么办？**

**Q2：** 你提到了"DOM解析实时提取课程文本投喂大模型"。**具体怎么解析的？如果课程内容是动态加载的（比如滚动加载），你怎么保证能抓到所有文本？**

如何防止恶意iframe内嵌到页面

传统iframe的缺点，如何解决url丢失，dom节点割裂
