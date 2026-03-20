# Pinia VS Vuex



### 面试常考题

#### Pinia如何使用

1. 创建一个store，其中包含`state状态`、`getters计算属性`、`actions`，getters表示计算属性，actions则是对状态的操作。
2. 在应用里注册Pinia
3. 在组件里使用store，获取数据修改数据等。



#### Pinia对比Vuex的优势

1. **核心属性不同**

   Pinia核心属性只有`State`、`Getters`、`Actions`三个，Vuex则有`State`、`Getters`、`Mutations`、`Actions`、`Modules`五个。Pinia的API更简洁。

2. **TS支持**

   Pinia完美支持TS无需额外配置，Vuex则支持较差。

3. **代码分割**

   Pinia自动支持代码分割，每个Store都是独立的模块，Vuex则需要手动配置Modules。