'use strict';

const events = require('events');

class Task extends events.EventEmitter {

    constructor (options) {
        super();

        this.tasks = []; // 子任务数组

        this.state = {
            running: false, // 是否正在运行
        };

        this.time = {
            start: NaN,    // 开始时间
            end: NaN,      // 结束时间
        };

        // 任务名字
        this.name = options.name || '';
        // 具体执行的函数
        this.handle = options.handle || function (...args) {args[args.length - 1](null)};
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

            this.emit('before-handle', this);
            this.handle((...args) => {
                this.emit('after-handle', this);
                
                // 执行子任务
                let index = 0;
                let nextSon = () => {
                    if (!this.state.running) {
                        return;
                    }
    
                    let son = this.tasks[index++];
                    if (!son) {
                        return this.emit('finish', ...args);
                    }
                    son.once('finish', () => {
                        nextSon();
                    });
                    son.start();
                };
                nextSon();
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
        this.tasks.push(task);
    }
}

module.exports = Task;