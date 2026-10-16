// 预置文章数据（MVP 阶段用本地假数据代替后端接口）
export const seedArticles = [
  {
    id: 'what-is-react',
    title: 'React 到底是什么？一篇文章讲明白',
    author: '林小流',
    createdAt: '2026-10-12',
    likes: 128,
    tags: ['React', '入门'],
    content: `React 是由 Meta（Facebook）开源的 JavaScript UI 库，用来构建用户界面。它只负责「界面长什么样」，路由、请求、状态管理都交给生态里的其他库，所以既轻量又灵活。

## 组件化思维

React 的核心思想是把页面拆成一个个独立、可复用的组件。一个按钮是组件，一张文章卡片是组件，整个页面就是组件的组合。每个组件管好自己的结构和状态，组合起来就是一个完整应用。

## 声明式渲染

你只需要描述「数据是什么样子，界面就长什么样子」，数据变了界面自动跟着变，不用像 jQuery 那样手动操作 DOM。这一步解放了前端工程师的大部分生产力。

## 学完能干什么

网页应用（React）、手机 APP（React Native）、桌面软件（Electron）都能做。招聘平台上大量「前端开发」岗位的核心技能就是 React，学它就是给自己拓宽就业面。`,
  },
  {
    id: 'jsx-in-5-minutes',
    title: 'JSX 5 分钟入门：在 JS 里写 HTML',
    author: '林小流',
    createdAt: '2026-10-10',
    likes: 96,
    tags: ['React', 'JSX'],
    content: `JSX 是 React 的模板语法，长得像 HTML，但本质是 JavaScript。浏览器并不认识它，Vite 里的编译器会把它转换成普通的函数调用。

## 三个最常用的规则

第一，标签必须闭合，<img> 也要写成 <img />。第二，className 代替 class，因为 class 是 JS 保留字。第三，花括号 {} 里可以写任何 JS 表达式，结果会渲染到页面上。

## 列表渲染

数组配合 map() 是最常见的渲染方式：把数据数组映射成一组 JSX 元素，每个元素必须有唯一的 key，React 靠它识别哪些项变了。

## 条件渲染

用 && 或者三元表达式就够了：数据为空时显示加载提示，有数据时渲染列表，一行代码搞定。`,
  },
  {
    id: 'usestate-guide',
    title: 'useState：让页面「动」起来的第一步',
    author: '陈数据',
    createdAt: '2026-10-08',
    likes: 154,
    tags: ['React', 'Hooks'],
    content: `普通变量变了页面不会刷新，而 useState 创建的「状态」一变，React 就会重新渲染组件。这是 React 与静态网页最大的区别。

## 基本用法

调用 useState(0) 会返回一个数组：第一项是当前值，第二项是修改它的函数。永远用 setter 函数改状态，直接改变量 React 察觉不到。

## 状态是异步更新的

连续调用两次 setCount(count + 1) 只会加一次，因为两次读到的都是旧值。要用 setCount(c => c + 1) 这种函数式写法，React 会基于最新值计算。

## 一个组件多个状态

点赞数、输入框内容、弹窗开关，各自一个 useState 就好，不必塞进一个大对象。React 会按调用顺序区分它们，所以 Hooks 不能写在 if 里面。`,
  },
  {
    id: 'useeffect-guide',
    title: 'useEffect：处理副作用的正确姿势',
    author: '陈数据',
    createdAt: '2026-10-06',
    likes: 132,
    tags: ['React', 'Hooks'],
    content: `组件里除了渲染界面，还有发请求、操作定时器、读写 localStorage 这些「副作用」，它们统一交给 useEffect 处理。

## 依赖数组决定执行时机

依赖数组传空数组 []， effect 只在组件挂载后执行一次，适合初次请求数据。传了依赖项，依赖变化时重新执行。不传数组则每次渲染都执行，绝大多数情况都不是你想要的。

## 清理函数

useEffect 里返回的那个函数会在组件卸载前执行，用来清除定时器、取消订阅。忘了清理就会造成内存泄漏和重复请求。

## 实战套路

「挂载时请求 + loading 状态 + 错误兜底」是前端最常见的三件套：请求前 loading 为 true，拿到数据后关掉，catch 里设置错误信息。把它封装成自定义 Hook useFetch，整个项目都能复用。`,
  },
  {
    id: 'props-and-callbacks',
    title: '父子组件通信：props 向下，事件向上',
    author: '周组件',
    createdAt: '2026-10-04',
    likes: 87,
    tags: ['React', '组件'],
    content: `React 的数据流是单向的：父组件通过 props 把数据传给子组件，子组件通过调用父组件传下来的回调函数把消息送回去。

## props 是只读的

子组件不能修改 props，想改变数据只能「报告」给父组件：父组件把 setXxx 函数作为 prop 传下去，子组件在事件里调用它，状态提升到父组件统一管理。

## 状态提升

两个兄弟组件要共享数据时，把状态放到它们共同的父组件里，再分别用 props 发下去。这就是 React 经典的「状态提升」模式。

## 更远的关系怎么办

组件层级深了以后层层传 props 会很痛苦，这时轮到 Context 出场：Provider 包住整棵树，任何深度的组件 useContext 一步拿到数据。本站的登录状态就是这么管理的。`,
  },
  {
    id: 'react-roadmap-2026',
    title: '2026 前端学习路线：从零基础到拿到 offer',
    author: '林小流',
    createdAt: '2026-10-01',
    likes: 265,
    tags: ['路线', '求职'],
    content: `给正在自学前端的你一份可执行路线：先打地基，再学框架，最后用项目说话。

## 第一阶段：三件套（3~4 周）

HTML 负责 结构，CSS 负责布局（重点练 Flex），JavaScript 练到 ES6：解构、箭头函数、Promise、async/await。这三样不过关，框架学得再快也是空中楼阁。

## 第二阶段：React 核心（3~4 周）

组件、props、useState、useEffect、useRef、useContext、自定义 Hook，然后是 React Router 路由和 axios 请求封装。每学一个知识点立刻写小 demo 验证，光看不写等于没学。

## 第三阶段：做一个完整项目（4 周）

做一个带登录、发布、列表、详情的博客社区，把所有知识点串起来，配上 Git 提交记录和 README，部署上线拿到一个能写进简历的链接。本站 MiniFlow 就是这个项目的 MVP 版本。

## 求职冲刺

刷一遍 React 面试题库，把项目里用到的每个技术点都能讲出「为什么这么用」，offer 就不远了。`,
  },
]
