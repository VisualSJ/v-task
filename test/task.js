'use strict';

const assert = require('assert');
const Task = require('../lib/task');

describe('任务流程', () => {

    it('单任务事件触发顺序测试', (done) => {
        let messages = [];

        setTimeout(() => {
            assert.deepEqual(messages, [
                'event - start',
                'event - before-handle',
                'handle',
                'event - after-handle',
                'event - finish',
            ]);

            done();
        }, 500);

        let task = new Task({
            name: 'single-task',
            handle (next) {
                messages.push(`handle`);
                next(null, 'args');
            },
        });
    
        task.on('start', () => {
            messages.push(`event - start`);
        });
    
        task.on('before-handle', () => {
            messages.push(`event - before-handle`);
        });
    
        task.on('after-handle', () => {
            messages.push(`event - after-handle`);
        });
    
        task.on('finish', () => {
            messages.push(`event - finish`);
        });
    
        task.start();
    });

    it('多任务事件触发顺序测试', (done) => {
        let messages = [];

        setTimeout(() => {
            assert.deepEqual(messages, [
                '[parent]start',
                '[parent]before-handle',
                '[parent]handle',
                '[parent]after-handle',
                '[son1]handle',
                '[son2]handle',
                '[parent]finish',
            ]);

            done();
        }, 500);

        let parent = new Task({
            name: 'parent-task',
            handle (next) {
                messages.push(`[parent]handle`);
                next(null, 'args');
            },
        });

        let son1 = new Task({
            name: 'son1-task',
            handle (next) {
                setTimeout(() => {
                    messages.push(`[son1]handle`);
                    next(null, 'args');
                }, 100);
            },
        });

        let son2 = new Task({
            name: 'son2-task',
            handle (next) {
                messages.push(`[son2]handle`);
                next(null, 'args');
            },
        });

        parent.append(son1);
        parent.append(son2);
    
        parent.on('start', () => {
            messages.push(`[parent]start`);
        });
    
        parent.on('before-handle', () => {
            messages.push(`[parent]before-handle`);
        });
    
        parent.on('after-handle', () => {
            messages.push(`[parent]after-handle`);
        });
    
        parent.on('finish', () => {
            messages.push(`[parent]finish`);
        });
    
        parent.start();
    });

    it('暂停任务测试', (done) => {
        let messages = [];

        setTimeout(() => {
            assert.deepEqual(messages, [
                '[single]start',
                '[single]pause',
            ]);

            done();
        }, 500);

        let parent = new Task({
            name: 'single-task',
            handle (next) {
                messages.push(`[single]handle`);
                next(null, 'args');
            },
        });
    
        parent.on('pause', () => {
            messages.push(`[single]pause`);
        });
    
        parent.on('start', () => {
            messages.push(`[single]start`);
        });
    
        parent.on('before-handle', () => {
            messages.push(`[single]before-handle`);
        });
    
        parent.on('after-handle', () => {
            messages.push(`[single]after-handle`);
        });
    
        parent.on('finish', () => {
            messages.push(`[single]finish`);
        });
    
        parent.start();
        parent.pause();
    });

    it('多任务中途暂停测试', (done) => {
        let messages = [];

        setTimeout(() => {
            assert.deepEqual(messages, [
                '[parent]start',
                '[parent]before-handle',
                '[parent]handle',
                '[parent]after-handle',
                '[son1]handle',
            ]);

            done();
        }, 500);

        let parent = new Task({
            name: 'parent-task',
            handle (next) {
                messages.push(`[parent]handle`);
                next(null, 'args');
            },
        });

        let son1 = new Task({
            name: 'son1-task',
            handle (next) {
                setTimeout(() => {
                    messages.push(`[son1]handle`);
                    parent.pause();
                    next(null, 'args');
                }, 100);
            },
        });

        let son2 = new Task({
            name: 'son2-task',
            handle (next) {
                messages.push(`[son2]handle`);
                next(null, 'args');
            },
        });

        parent.append(son1);
        parent.append(son2);
    
        parent.on('start', () => {
            messages.push(`[parent]start`);
        });
    
        parent.on('before-handle', () => {
            messages.push(`[parent]before-handle`);
        });
    
        parent.on('after-handle', () => {
            messages.push(`[parent]after-handle`);
        });
    
        parent.on('finish', () => {
            messages.push(`[parent]finish`);
        });
    
        parent.start();
    });
});