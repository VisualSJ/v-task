# 任务管理器

用于任务流程队列管理

## 创建一个新任务

```javascript
let task = new Task({
    name: 'test-task',
    handle () {
        console.log('task handle...');
    },
});

// 启动任务
task.start();
// 暂停任务
task.pause();
```

## 创建一个子任务

```javascript
let task = new Task({
    name: 'test-task',
    handle () {
        console.log('task handle...');
    },
});

let subtask = new Task({
    name: 'sub-task',
    handle () {
        console.log('subtask handle...');
    },
});

task.append(subtask);

// 启动任务
task.start();
// 暂停任务
task.pause();
```

## 任务流程事件

```javascript
task.on('start', () => {
    console.log('任务开始执行');
});
task.on('pause', () => {
    console.log('任务暂停执行');
});
task.on('before-handle', () => {
    console.log('任务准备开始执行 handle');
});
task.on('after-handle', () => {
    console.log('任务 handle 执行完毕');
});
task.on('finish', () => {
    console.log('任务完成');
});
```

## 任务进度

```javascript
task.total; // 任务总数据，包含了子任务
task.progress; // 任务进度，当前执行的任务和总任务的数量比例
```