'use strict';

const assert = require('assert');
const Task = require('../lib/task');

describe('任务数据', () => {

    it('总任务数量测试', () => {
        let task = new Task();
        let subTask1 = new Task();
        let subTask2 = new Task();

        assert.equal(task.total, 1);
        task.append(subTask1);
        assert.equal(task.total, 2);
        task.append(subTask2);
        assert.equal(task.total, 3);
    });

    it('执行进度测试', (done) => {
        let task = new Task();
        let subTask1 = new Task();
        let subTask2 = new Task();
        let subTask3 = new Task();

        task.on('finish', () => {
            // task 最先执行，但是 finish 是最后回调的
            assert.equal(task.progress, 1);
            done();
        });

        subTask2.on('finish', () => {
            // subTask2 执行完毕的时候应该只剩下 subTask3 还没有执行，所以进度是 0.75
            assert.equal(task.progress, 0.75);
        });

        assert.equal(task.progress, 0);
        task.append(subTask1);
        assert.equal(task.progress, 0);
        task.append(subTask2);
        assert.equal(task.progress, 0);
        task.append(subTask3);
        assert.equal(task.progress, 0);

        task.start();
    });
});