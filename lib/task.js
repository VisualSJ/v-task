'use strict';

const events = require('events');

class Task extends events.EventEmitter {

    constructor (options) {
        super();

        options = options || {};

        this.tasks = []; // 子任务数组

        this.state = {
            handle: false, // 是否执行过 handle 函数
            running: false, // 是否正在运行
            finish: false, // 是否执行完毕
        };

        this.time = {
            start: NaN,    // 开始时间
            end: NaN,      // 结束时间
        };

        // 任务名字
        this.name = options.name || '';
        // 具体执行的函数
        this.handle = options.handle || function (done) { done(null); };
    }

    // 任务总数，包含子任务的数量
    get total () {
        let num = 1;
        this.tasks.forEach((task) => {
            num += task.total;
        });
        return num;
    }

    // 任务进度，包含子任务
    get progress () {
        let total = 0;
        let finish = 0;

        let step = function (task) {
            total += 1;
            if (task.state.handle) {
                finish += 1;
            }
            task.tasks.forEach(step);
        };

        step(this);
        return finish / total;
    }

    /**
     * 开始执行任务
     * @param {function} callback 
     */
    start () {
        this.state.running = true;

        this.time.start = new Date();
        this.emit('start');

        // 不立即执行，推到队列末端最后执行
        process.nextTick(() => {
            // 执行自身挂载的 handle
            if (!this.state.running) {
                return;
            }

            let startSubTask = () => {
                // 执行子任务
                let index = 0;
                let nextSon = (...args) => {
                    if (!this.state.running) {
                        return;
                    }
    
                    let son = this.tasks[index++];
                    if (!son) {
                        this.state.finish = true;
                        return this.emit('finish', ...args);
                    }

                    if (son.state.finish) {
                        return nextSon(...args);
                    }

                    son.once('finish', () => {
                        nextSon(...args);
                    });
                    son.start();
                };
                nextSon();
            };

            if (this.state.handle) {
                return startSubTask();
            }

            this.emit('before-handle', this);
            this.handle((...args) => {
                this.state.handle = true;
                this.emit('after-handle', this);
                startSubTask(...args);
            });
        });

    }

    /**
     * 执行完当前任务后，暂停后续任务
     */
    pause () {
        this.emit('pause');
        this.state.running = false;
        this.tasks.forEach((task) => {
            task.pause();
        });
    }

    /**
     * 插入子任务
     * @param {Task} task 
     */
    append (task) {
        this.state.finish = false;
        this.tasks.push(task);
        if (this.state.running) {
            this.start();
        }
    }

    /**
     * 重置任务状态
     */
    reset () {
        this.state.handle = false;
        this.state.funning = false;
        this.state.finish = false;
        this.tasks.forEach((task) => {
            task.reset();
        });
    }
}

module.exports = Task;