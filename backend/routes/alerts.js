"use strict"
import express from 'express';
const alertsRouter = express.Router();
import emailService from '../jobs/emailService.js'; //won't need here
import authenticateToken from '../jobs/authenticateToken.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import query from '../utils/db_connection.js';

const log = console.log;

alertsRouter.use(authenticateToken);

//test api
alertsRouter.get('/', async (req, res) => {
    res.status(200).send('Hello World from the Alerts section!');
});

//Create a new Alert
alertsRouter.post('/', async (req, res) => {
    let {user_id, type, frequency, active, notes=[]} = req.body;

    if (!user_id || !type || !frequency) {
        return res.status(400).send(`Params user_id, type, frequency are required`);
    }

    frequency = frequency.toUppercase().trim();
    type = type.toUppercase().trim();

    const FREQUENCIES = ['DAILY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'SEMI_ANNUAL'];
    const TYPES = ['PAST_DIVIDENDS', 'FUTURE_DIVIDENDS', 'ANALYST_RATINGS', 'PERFORMANCE'];

    if (!FREQUENCIES.includes(frequency)) {
        return res.status(400).send(`frequency ${frequency} not recognized. Supported values are: ${FREQUENCIES}`);
    }

    if (!TYPES.includes(type)) {
        return res.status(400).send(`type ${type} not recognized. Supported values are: ${TYPES}`);
    }

    try {
        notes = JSON.stringify(notes);
    } catch {
        return res.status(400).send(`Params notes is invalid JSON`);
    }

    user_id = parseInt(user_id);

    if (parseInt(user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let SQL = `INSERT INTO alerts (user_id, type, frequency, active, notes) VALUES (?, ?, ?, ?, ?);`;

    let result = await query(SQL, user_id, type, frequency, active, notes);

    if (!result) return res.status(422).send(`Something went wrong while creating Alert.`);

    SQL = `SELECT * FROM alerts WHERE alert_id = LAST_INSERT_ID();`;

    [result] = await query(SQL);

    if (!result) return res.status(422).send(`Something went wrong while creating Alert.`);

    return res.status(200).json(result);

});

//See alerts of a single user
alertsRouter.get('/:user_id', async (req, res) => {

    if (parseInt(req.params.user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let matches = await query(`SELECT * FROM alerts WHERE user_id = ?`, req.params.user_id);

    return res.status(200).json(matches);

});

//See details of a single user
alertsRouter.get('/:alert_id', async (req, res) => {
    if (match.user_id !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let [match] = await query(`SELECT * FROM alerts WHERE alert_id = ?`, req.params.alert_id);
    
    return res.status(200).json(match);
});

//Update a single Alert
alertsRouter.put('/:alert_id', async (req, res) => {
    if (parseInt(match.user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let [match] = await query(`SELECT * FROM alerts WHERE alert_id = ?`, req.params.alert_id);

    if (!match) return res.status(404).send('Requested resource not found.');

    let result = await query(`UPDATE alerts WHERE alert_id = ? SET frequency = ? , notes = ?, active = ?, type = ?;`, [req.params.alert_id, req.body.frequency ?? match.frequency, req.body.notes ?? match.notes, req.body.active, req.body.type ?? match.type]);

    if (!result) return res.status(422).send(`Something went wrong while updating Alert.`);
});

//turn off a single Alert (just a quicker way)
alertsRouter.put('/:alert_id/turn_off', async (req, res) => {
    if (parseInt(match.user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let [match] = await query(`SELECT * FROM alerts WHERE alert_id = ?`, req.params.alert_id);

    if (!match) return res.status(404).send('Requested resource not found.');

    let result = await query(`UPDATE alerts WHERE alert_id = ? SET active = FALSE;`);

    if (!result) return res.status(422).send(`Something went wrong while updating Alert.`);
});

//turn on a single Alert (just a quicker way)
alertsRouter.put('/:alert_id/turn_on', async (req, res) => {
    if (parseInt(match.user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let [match] = await query(`SELECT * FROM alerts WHERE alert_id = ?`, req.params.alert_id);

    if (!match) return res.status(404).send('Requested resource not found.');

    let result = await query(`UPDATE alerts WHERE alert_id = ? SET active = TRUE;`);

    if (!result) return res.status(422).send(`Something went wrong while updating Alert.`);
});

//delete a single Alert
alertsRouter.delete('/:alert_id', async (req, res) => {

    if (parseInt(req.params.user_id) !== req.user.id && !defaultPermissions.actions.edit_other_alerts.includes(req.user.permissions)) return res.status(403).send('Forbidden: You do not have access to this.');

    let result = await query(`DELETE FROM alerts WHERE alert_id = ?;`, req.params.alert_id);

    if (!result.status) return res.status(422).send('Something went wrong.');

    return res.status(204).json(result);

});

export default alertsRouter;