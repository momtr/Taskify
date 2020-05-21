const express = require('express');
const Joi = require('joi');
const striptags = require('striptags');

const FirebaseRealTime = require('../libs/firebase/database');
const db = new FirebaseRealTime();

const router = express.Router();

const schemas = {
    workspace: Joi.object().keys({
        uuid: Joi.string().regex(/(^[a-zA-Z0-9_]*$)/).min(2).max(100).required()
    }),
    task: {
        title: Joi.string().min(2).max(30).required(),
        description: Joi.optional(),
        untilDay: Joi.optional(),
        untilTime: Joi.optional(),
        priority: Joi.optional()
    }
}

router.get('/', (req, res, next) => {
    res.json({ 
        message: '🍭 Please use the enpoints /api/v1/{workspaceUUID} in order to retrieve data from a workspace. Use POST /api/v1/{workspaceUUID} in order to create a workspace' 
    });
    next();
});

router.get('/workspaces/:workspaceUUID', async (req, res, next) => {
    const uuid = req.params.workspaceUUID;
    /** validate the uuid */
    let validate = Joi.validate({ uuid }, schemas.workspace);
    console.log(validate);
    if(validate.error) {
        next(new Error(validate.error));
        return;
    }
    /** retrieve data from DB */
    let tasks = await db.getData(`workspaces/${uuid}/tasks`);
    if(tasks) {
        res.json({ 
            message: 'data given',
            data: { tasks, reqMillis: Date.now() }
        });
    } else next(new Error(0));
});

router.post('/workspaces/:workspaceUUID', async (req, res, next) => {
    const uuid = req.params.workspaceUUID;
    /** validate the uuid */
    let validate = Joi.validate({ uuid }, schemas.workspace);
    if(validate.error) {
        next(new Error(validate.error));
        return;
    }
    let exits = await db.getData(`workspaces/${uuid}`);
    if(!exits) {
        db.insertData('workspaces', `${uuid}/tasks/${Date.now()}`, { title: '🍭 You have successully set up your workspace :) If you have finished a task, just click on it' });
        res.json({
            message: '🍭 You have successully set up your workspace :)',
            data: { workspaceUUID: uuid, reqMillis: Date.now() }
        })
    }
    else next(new Error(1));
});

router.post('/tasks/:workspaceUUID', async (req, res, next) => {
    const uuid = req.params.workspaceUUID;
    /** validate uuid */
    const validateUUID = Joi.validate({ uuid }, schemas.workspace);
    if(validateUUID.error) {
        next(new Error(validateUUID.error));
        return;
    }
    /** check if workspace exists */
    let workspaceObj = await db.getData(`workspaces/${uuid}`);
    if(!workspaceObj) {
        next(new Error(0));
        return;
    }
    /** validate the task */
    const validate = Joi.validate(req.query, schemas.task);
    if(validate.error) {
        next(new Error(validate.error));
        return;
    }
    /** insert into db */
    req.query.done = false;
    req.query.title = striptags(req.query.title);
    db.insertData('workspaces', `${uuid}/tasks/${Date.now()}`, req.query);
    res.json({
        message: '🍭 successfully created task',
        data: { task: req.query }
    });
});

router.put('/tasks/done/:workspaceUUID/:taskUUID', async (req, res, next) => {
    const uuid = req.params.workspaceUUID;
    /** validate uuid */
    const validateUUID = Joi.validate({ uuid }, schemas.workspace);
    if(validateUUID.error) {
        next(new Error(validateUUID.error));
        return;
    }
    const taskUUID = req.params.taskUUID;
    /** update in db */
    db.insertData('workspaces', `${uuid}/tasks/${taskUUID}/done`, Date.now());
    res.json({
        message: '✅ task done!',
        data: {
            workspace: uuid,
            task: taskUUID
        }
    })
});

router.put('/tasks/remove/:workspaceUUID/:taskUUID', async (req, res, next) => {
    const uuid = req.params.workspaceUUID;
    /** validate uuid */
    const validateUUID = Joi.validate({ uuid }, schemas.workspace);
    if(validateUUID.error) {
        next(new Error(validateUUID.error));
        return;
    }
    const taskUUID = req.params.taskUUID;
    /** update in db */
    db.insertData('workspaces', `${uuid}/tasks/${taskUUID}/removed`, Date.now());
    res.json({
        message: '🔴 task removed!',
        data: {
            workspace: uuid,
            task: taskUUID
        }
    })
});

module.exports = router;

/**
 * errors #CODES
 * 0 - does not exist
 * 1 - does alredy exist
 */