# `TipTap`编辑器视频能力扩展技术文档

## 项目概述

本项目针对`TipTap`编辑器进行了视频功能扩展，实现了长视频上传与断点续传功能，并集成了听悟AI视频解析能力。通过开发自定义视频节点插件，为用户提供了完整的视频上传、管理和AI分析解决方案。

## 核心功能实现

### 1. `TipTap`视频节点插件开发

#### 1.1 自定义视频节点定义
```typescript
// packages/new-editor/src/plugins/Video.ts
export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  
  addAttributes(): Record<keyof AttachmentAttributes, any> {
    return {
      id: { default: null },           // 唯一标识符，用于节点状态更新
      src: { default: null },           // OSS视频链接
      status: { default: 'placeholder' }, // 上传状态：placeholder/uploading/done/error
      progress: { default: 0 },         // 上传进度 0-100
      objectKey: { default: null },     // OSS对象键
      fileName: { default: null },     // 文件名
      tingwuTaskId: { default: null }, // 听悟AI任务ID
    };
  }
});
```

**技术实现要点**：
- **原子节点设计**：视频节点作为原子单元，确保编辑器的完整性
- **多状态管理**：支持占位符、上传中、完成、错误四种状态
- **属性扩展**：可扩展的视频节点属性支持后续功能迭代

#### 1.2 Vue节点视图组件
```vue
<!-- packages/new-editor/src/components/Video.vue -->
<template>
  <div class="tt-video__box">
    <!-- AI工具条（hover显示） -->
    <div class="tt-video__aiBar" :class="{ 'is-visible': visible }">
      <button @click="handleTingwu" :disabled="aiDisabled" :title="aiBtnTitle">
        <span>✨</span>
        <span>AI 工具</span>
        <span :data-status="videoProcessingStatus">{{ videoProcessingStatusName }}</span>
      </button>
    </div>
    
    <!-- 视频播放器或上传进度显示 -->
    <video v-if="isDone" :src="attrs.src" controls />
    <div v-else class="tt-video__placeholder">
      <div class="tt-video__title">{{ titleText }}</div>
      <div class="tt-video__percent">{{ Math.round(progress) }}%</div>
      <div class="tt-video__bar">
        <div class="tt-video__barFill" :style="{ width: `${progress}%` }"></div>
      </div>
      <button v-if="attrs.status === 'error'" @click="resume">继续上传</button>
    </div>
  </div>
</template>
```

**UI交互设计**：
- **状态可视化**：实时显示上传进度和状态
- **断点续传**：上传失败时提供"继续上传"按钮
- **AI工具集成**：hover显示AI分析功能入口

### 2. OSS分片上传与断点续传机制

#### 2.1 断点续传核心原理

**断点续传的核心机制**基于阿里云OSS的分片上传能力和浏览器本地存储的检查点保存机制：

```typescript
// packages/new-editor/src/utils/files/ossUpload.ts

// 生成唯一检查点键名，确保文件唯一性
function cpKey(bucket: string, objectKey: string, file: File) {
  return `oss_cp:${bucket}:${objectKey}:${file.size}:${file.lastModified}`;
}

export async function multipartUploadWithResume(opts: {
  file: File;
  objectKey: string;
  onProgress: (percent: number) => void;
}) {
  const sts = await getStsToken();
  const client = new OSS({
    endpoint: import.meta.env.VITE_OSS_ENDPOINT,
    bucket: import.meta.env.VITE_OSS_BUCKET,
    accessKeyId: sts.accessKeyId,
    accessKeySecret: sts.accessKeySecret,
    stsToken: sts.securityToken,
  });

  // 断点续传检查点机制
  const key = cpKey(bucket, opts.objectKey, opts.file);
  const saved = localStorage.getItem(key);
  const checkpoint = saved ? JSON.parse(saved) : undefined;

  const result = await client.multipartUpload(opts.objectKey, opts.file, {
    checkpoint, // 传入检查点进行续传
    progress: async (p: number, cp: any) => {
      // 实时更新进度到UI
      opts.onProgress(Math.round(p * 100));
      
      // 保存最新的检查点到localStorage
      if (cp) localStorage.setItem(key, JSON.stringify(cp));
    },
  });

  // 上传完成，清理检查点
  localStorage.removeItem(key);
  return { url: `https://${endpoint}/${result.name}` };
}
```

#### 2.2 检查点数据结构详解

**检查点在localStorage中的存储结构**：
```json
{
  "uploadId": "168a3f9c7e574f9bae6a7c8b3d4f5e6a",  // OSS分片上传ID
  "file": {
    "name": "video.mp4",
    "size": 104857600,      // 文件大小(字节)
    "lastModified": 1710355200000
  },
  "doneParts": [            // 已完成的分片列表
    {
      "number": 1,          // 分片序号
      "etag": "etag-xxxxx",  // OSS返回的ETag
      "size": 5242880       // 分片大小
    },
    {
      "number": 2,
      "etag": "etag-yyyyy",
      "size": 5242880
    }
  ],
  "partSize": 5242880,      // 每个分片的大小
  "bucket": "test-datawhale", // 存储桶名称
  "name": "user123/videos/1710355200000/video.mp4" // OSS对象键
}
```

#### 2.3 浏览器关闭后的恢复流程

**恢复上传的完整流程**：

1. **编辑器初始化检测**：
```typescript
// packages/new-editor/src/plugins/Video.ts
markUploadingVideosAsError: () => ({ state, dispatch }) => {
  const { doc } = state;
  let tr = state.tr;
  
  doc.descendants((node, pos) => {
    if (node.type.name === 'video' && node.attrs.status === 'uploading') {
      // 检测到未完成的上传，标记为错误状态
      tr = tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        status: 'error', // 等待用户手动恢复
      });
    }
  });
  
  if (changed && dispatch) {
    dispatch(tr);
  }
}
```

2. **用户手动恢复上传**：
```typescript
resumeVideoUpload: (id: string) => ({ editor }) => {
  void (async () => {
    // 重新选择文件（必须与原文件相同）
    const file = await pickFileOnce({ kind: 'video' });
    if (!file) return;
    
    // 使用相同的objectKey继续上传
    await startUpload(editor, id, file);
  })();
}
```

3. **续传验证机制**：
```typescript
const startUpload = async (editor: any, id: string, file: File) => {
  const nodeAttrs = findVideoAttrsById(editor, id);
  const objectKey = nodeAttrs?.objectKey; // 使用保存的objectKey
  
  // 恢复进度从上次断点开始
  updateVideoAttrsById(editor, id, {
    status: 'uploading',
    progress: nodeAttrs?.progress ?? 0, // 恢复进度
    objectKey,
    fileName: file.name,
  });
  
  // 继续分片上传，OSS SDK会自动处理续传
  await multipartUploadWithResume({ file, objectKey, onProgress });
};
```

#### 2.4 恢复上传的关键条件

**续传必须满足的条件**：
- **文件一致性**：重新选择的文件必须与原文件完全相同（通过文件大小和修改时间验证）
- **objectKey一致性**：视频节点中保存的OSS对象键保持不变
- **有效的STS Token**：重新获取有效的上传凭证
- **localStorage中的检查点**：必须存在对应的检查点数据

**技术实现要点**：
- **唯一性保障**：通过文件大小+修改时间确保检查点唯一性
- **实时保存**：每个分片上传完成后立即保存检查点
- **自动清理**：上传成功或失败后清理对应的检查点
- **错误恢复**：提供清晰的用户界面引导用户手动恢复上传

#### 2.5 完整的视频上传流程

**首次上传流程**：
```typescript
// packages/new-editor/src/plugins/Video.ts
const startUpload = async (editor: any, id: string, file: File) => {
  const nodeAttrs = findVideoAttrsById(editor, id);
  const objectKey = nodeAttrs?.objectKey;

  // 1. 更新节点状态为上传中
  updateVideoAttrsById(editor, id, {
    status: 'uploading',
    progress: nodeAttrs?.progress ?? 0, // 从上次进度继续
    objectKey,
    fileName: file.name,
  });

  try {
    // 2. 执行分片上传（支持断点续传）
    const { url } = await multipartUploadWithResume({
      file,
      objectKey,
      onProgress: (p: number) => {
        // 3. 实时更新进度到UI
        updateVideoAttrsById(editor, id, { status: 'uploading', progress: p });
      },
    });

    // 4. 上传成功，更新节点状态
    updateVideoAttrsById(editor, id, { 
      status: 'done', 
      progress: 100, 
      src: url 
    });
  } catch (e) {
    // 5. 上传失败，标记错误状态，等待用户恢复
    updateVideoAttrsById(editor, id, { status: 'error' });
  }
};
```

#### 2.6 断点续传状态流转图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   首次上传启动    │    │   浏览器意外关闭   │    │   用户恢复上传   │
│                 │    │                 │    │                 │
│ • 生成objectKey  │    │ • localStorage  │    │ • 重新选择文件    │
│ • 创建视频节点    │    │   保存检查点     │    │ • 验证文件一致性    │
│ • 开始分片上传    │    │ • 节点状态保持    │    │ • 加载检查点数据   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                ┌─────────────────▼─────────────────┐
                │           续传上传流程              │
                │                                   │
                │ 1. 检测localStorage检查点           │
                │ 2. OSS SDK自动恢复分片上传           │
                │ 3. 从上次断点继续上传                │
                │ 4. 实时更新进度到UI                 │
                │ 5. 上传完成清理检查点                │
                └─────────────────┬─────────────────┘
                                   │
                        ┌─────────▼───────┐
                        │   上传完成/失败   │
                        │                │
                        │ • 成功：显示视频  │
                        │ • 失败：显示错误  │
                        └─────────────────┘
```

#### 2.7 文件一致性验证机制

**确保续传文件正确性的关键**：
```typescript
// 检查点键名生成逻辑
function cpKey(bucket: string, objectKey: string, file: File) {
  return `oss_cp:${bucket}:${objectKey}:${file.size}:${file.lastModified}`;
}

// 续传前的文件验证
const resumeUpload = async (editor: any, id: string, newFile: File) => {
  const nodeAttrs = findVideoAttrsById(editor, id);
  const objectKey = nodeAttrs?.objectKey;
  
  // 生成检查点键名
  const checkpointKey = cpKey(bucket, objectKey, newFile);
  
  // 检查localStorage中是否存在对应的检查点
  const savedCheckpoint = localStorage.getItem(checkpointKey);
  if (!savedCheckpoint) {
    throw new Error('找不到对应的上传检查点，无法续传');
  }
  
  // 验证文件是否与检查点匹配
  const checkpoint = JSON.parse(savedCheckpoint);
  if (newFile.size !== checkpoint.file.size || 
      newFile.lastModified !== checkpoint.file.lastModified) {
    throw new Error('文件不匹配，请选择正确的文件进行续传');
  }
  
  // 文件验证通过，开始续传
  await startUpload(editor, id, newFile);
};
```

### 3. 听悟AI视频解析集成

#### 3.1 AI视频处理API集成
```typescript
// packages/new-editor/src/apis/tingwu.ts
export async function videoProcessRequestApi(data: { videoUrl: string }) {
  const response = await editorService.post('/admin/editor/v2/videoProcessRequest', { data });
  return response.data as string; // 返回听悟任务ID
}

export async function videoProgressDetailApi(params: { taskId: string }) {
  const response = await editorService.get('/admin/editor/v2/videoProgressDetail', { params });
  return response.data as VideoProgressDetail;
}

// 视频处理结果数据结构
type VideoProgressDetail = {
  tingwuTaskId?: string;
  tingwuStatus?: 'pending' | 'running' | 'done' | 'failed';
  chapters: string;    // 章节划分结果
  summary: string;    // 视频摘要
  keywords: string;   // 关键词提取
};
```

#### 3.2 实时状态同步机制
```typescript
// packages/new-editor/src/components/Video.vue
const handleTingwu = async () => {
  if (node.attrs.src) {
    videoProcessingStatus.value = 'running';
    const taskId = await videoProcessRequestApi({ videoUrl: node.attrs.src });
    
    // 通过updateAttributes实时同步节点状态
    updateAttributes({ tingwuTaskId: taskId });
    
    // 启动轮询查询处理进度
    videoProcessingDetailInterval.value = setInterval(videoProgressDetailQuery, 15000);
  }
};

async function videoProgressDetailQuery() {
  const detail = await videoProgressDetailApi({ taskId: node.attrs.tingwuTaskId });
  videoProcessingStatus.value = detail.tingwuStatus ?? 'pending';
  
  // 处理完成时停止轮询
  if (videoProcessingStatus.value !== 'running') {
    clearInterval(videoProcessingDetailInterval.value);
  }
}
```

**状态同步机制**：
- **实时更新**：通过updateAttributes API实时更新节点状态
- **轮询查询**：15秒间隔轮询AI处理进度
- **状态可视化**：展示摘要与章节划分等AI分析结果

### 4. 节点状态管理工具

#### 4.1 节点属性更新工具
```typescript
// packages/new-editor/src/utils/files/videoDocUtils.ts
export function updateVideoAttrsById(editor: Editor, id: string, patch: Record<string, any>) {
  const pos = findVideoPosById(editor, id);
  if (pos == null) return false;
  const node = editor.state.doc.nodeAt(pos);
  if (!node) return false;
  
  editor.chain().command(({ tr }) => {
    tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...patch });
    return true;
  }).run();
  return true;
}
```

## 技术实现深度解析

### 1. 断点续传机制的技术优势

#### 1.1 可靠性保障
- **自动恢复机制**：基于OSS分片上传的检查点机制，确保网络中断、浏览器崩溃等异常情况下的数据完整性
- **文件一致性验证**：通过文件大小和修改时间双重验证，防止错误文件续传
- **进度实时保存**：每个分片上传完成后立即保存检查点，最大限度减少数据丢失风险

#### 1.2 性能优化
- **并行上传**：支持多个分片同时上传，充分利用网络带宽
- **内存优化**：分片上传避免大文件占用过多内存，适合大视频文件处理
- **智能重试**：自动处理网络异常，减少人工干预需求

#### 1.3 用户体验优化
- **进度可视化**：实时显示上传进度，增强用户掌控感
- **状态明确指示**：清晰的状态标识（上传中、完成、错误、可恢复）
- **一键恢复**：简单的"继续上传"操作，降低用户操作门槛

### 2. 检查点机制的实现细节

#### 2.1 检查点生命周期管理
```typescript
// 检查点创建时机
- 首次分片上传开始时创建检查点
- 每个分片上传完成后更新检查点
- 上传过程中实时保存检查点

// 检查点清理时机
- 上传成功：立即清理对应检查点
- 上传失败：保留检查点等待恢复
- 用户取消：清理检查点
- 页面刷新：检查点保留在localStorage中
```

#### 2.2 检查点容错机制
```typescript
// 检查点数据验证
function validateCheckpoint(checkpoint: any): boolean {
  return checkpoint && 
         checkpoint.uploadId && 
         checkpoint.file &&
         checkpoint.doneParts &&
         Array.isArray(checkpoint.doneParts);
}

// 检查点恢复逻辑
async function resumeFromCheckpoint(checkpoint: any, file: File) {
  if (!validateCheckpoint(checkpoint)) {
    throw new Error('检查点数据损坏，无法恢复上传');
  }
  
  // 验证文件与检查点匹配
  if (file.size !== checkpoint.file.size || 
      file.lastModified !== checkpoint.file.lastModified) {
    throw new Error('文件与检查点不匹配');
  }
  
  // 使用检查点恢复上传
  return await client.multipartUpload(checkpoint.name, file, {
    checkpoint,
    progress: updateProgressAndCheckpoint
  });
}
```

### 3. 浏览器兼容性与存储策略

#### 3.1 存储方案选择
- **localStorage**：作为主要存储方案，支持大多数现代浏览器
- **IndexedDB**：备用方案，支持更大存储容量
- **Session Storage**：临时存储，页面关闭后自动清理

#### 3.2 存储容量管理
```typescript
// 检查点数据清理策略
function cleanupCheckpoints() {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000; // 一周前
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('oss_cp:')) {
      try {
        const checkpoint = JSON.parse(localStorage.getItem(key)!);
        // 清理过期检查点（超过一周）
        if (checkpoint.timestamp && checkpoint.timestamp < oneWeekAgo) {
          localStorage.removeItem(key);
        }
      } catch {
        // 数据损坏，直接清理
        localStorage.removeItem(key);
      }
    }
  });
}
```

### 4. 错误处理与异常恢复

#### 4.1 网络异常处理
- **自动重试机制**：网络中断时自动重试上传
- **超时处理**：设置合理的上传超时时间
- **进度回退保护**：防止进度异常回退

#### 4.2 用户操作异常
- **页面刷新恢复**：刷新后自动检测未完成上传
- **浏览器关闭恢复**：重新打开后提供恢复选项
- **文件选择错误**：提供清晰的错误提示和重新选择引导

### 5. 性能监控与优化

#### 5.1 上传性能指标
- **上传速度监控**：实时计算并显示上传速率
- **分片成功率**：跟踪每个分片的成功/失败情况
- **网络质量评估**：根据上传表现评估网络状况

#### 5.2 用户体验优化
- **进度平滑更新**：避免进度跳动，提供流畅的视觉体验
- **预估完成时间**：根据当前速度预估剩余时间
- **上传优先级管理**：支持多个文件的上传队列管理

## 总结

通过 `TipTap` 视频节点插件开发、OSS 分片上传断点续传机制以及听悟 AI 视频解析能力的集成，成功构建了一套完整的编辑器视频功能扩展方案。该方案不仅解决了长视频上传的技术难题，还通过 AI 能力增强了视频内容的价值，为用户提供了专业级的视频编辑体验。