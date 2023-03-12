"use strict"
import express from 'express';
const userRouter = express.Router();
const log = console.log;
const list = (arr) => new Intl.ListFormat().format(arr.map(x => JSON.stringify(x)));

import authenticateToken from '../jobs/authenticateToken.js';
import fetchUserDetails from '../jobs/fetchUserDetails.js';
import fetchWorkspaceIDs from '../jobs/fetchWorkspaceIDs.js';
import defaultPermissions from '../constants/defaultPermissions.js';
import isAvailableUsername from '../jobs/isAvailableUsername.js';
import db_keys from '../constants/db_keys.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import query from '../utils/db_connection.js';
import sql_wrap from '../utils/sql_wrap.js';
import is_valid_email from '../utils/is_valid_email.js';
import emailService from '../jobs/emailService.js';
import validatePassword from '../../frontend/src/utils/validatePassword.mjs';

userRouter.get('/', authenticateToken, async (req, res) => {

    const include_deactivated = Boolean(req.query.include_deactivated);

    let sql = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on FROM users`;

    if (!include_deactivated) sql += ` WHERE active = 1;`;

    await query(sql).then(async response => {
        if (!response) {
            log('User Details Fetch Error');
            return res.status(422).send('User Details Fetch Error');
        };
        if (defaultPermissions.access.view_all_user_profiles.includes(req.user.permissions)) {
            return res.json(response);
        } else if (defaultPermissions.access.view_other_users_bulk.includes(req.user.permissions)) {
            let logged_in_user_workspace_ids = await fetchWorkspaceIDs(req.user.id);
            return res.json(response.filter(user => user.id === req.user.id || logged_in_user_workspace_ids.some(id => user.workspace_ids.includes(id))));
        } else {
            return res.json(response.filter(user => user.user_id === req.user.id));
        }
    });
});

userRouter.get('/session', authenticateToken, (req, res) => {
    return res.status(200).json({
        ...req.user
    });
})


userRouter.post('/create_new_user', async (req, res) => {
    log('received: ', req.body || {});

    if (!req.body.username) {
        return res.status(401).json({
            message: `Username required.`,
            error_part: 'username'
        });
    }

    if (!req.body.password) {
        return res.status(401).json({
            message: `Password required.`,
            error_part: 'password'
        });
    }

    if (!validatePassword(req.body.password)) {
        return res.status(401).json({
            message: `Password not strong enough.`,
            error_part: 'password'
        });
    }

    if (!await isAvailableUsername(req.body.username)) {
        return res.status(401).json({
            message: `Username ${req.body.username} already in use`,
            error_part: 'username'
        });
    }

    let is_secured = !!req.body.email; //if email is provided, we will set the account as inactive and await activation

    if (is_secured && !is_valid_email(req.body.email)) {
        return res.status(401).json({
            message: `Invalid email address.`,
            error_part: 'email'
        });
    }

    //hashed = encrypted
    //encryption uses a "Salt" that is generated uniquely for each password. The salt is prepended to the hashed password and functions as the key to decrypt it later on.

    const hashedPassword = await bcrypt.hash(req.body.password, 10); //default strength for salt creation is 10


    let sql = `INSERT INTO users (username, password, first_name, last_name, permissions, email, active) VALUES ('${req.body.username}', '${hashedPassword}', ${sql_wrap(req.body.first_name)}, ${sql_wrap(req.body.last_name)}, 'basic_client', ${sql_wrap(req.body.email)}, ${!is_secured});`;


    let creation = await query(sql);

    if (!creation) {
        return res.status(422).json({
            message: 'New User Creation Error',
            error_part: 'other'
        });
    };

    sql = `SELECT ${db_keys.all_except_pass.join(', ')} FROM users WHERE user_id = LAST_INSERT_ID();`


    let [created_user_details] = await query(sql);

    log("1 record inserted", created_user_details);

    if (is_secured) {
        const user = {
            id: created_user_details.user_id
        };
        const ActivationToken = jwt.sign(user, process.env.ACTIVATION_TOKEN_SECRET_KEY); //any reason to use this over bcrypt? 

        await emailService({
            to: req.body.email,
            message: `Welcome on board! \n\t Your activation token: ${ActivationToken}`
        });
    }

    //Do we want to then create a table specifically for that user and their data?

    res.status(201).json({
        ...created_user_details,
        message: 'Successfully created',
        is_secured
    });
});

userRouter.post('/pre_signed_create_new_user', authenticateToken, async (req, res) => {

    if (!defaultPermissions.can_create_new_user.includes(req.user.permissions)) {
        return res.status(403).send('Forbidden:You do not have access to this.');
    }

    if (!defaultPermissions.permission_access_framework.includes(req.body.permissions)) {
        return res.status(403).send(`Forbidden: As a ${req.user.permissions} you do not have access creating ${req.body.permissions}.'`);
    }

    const required_but_missing = ['username', 'email', 'permissions'].filter(prop => !req.body[prop]);

    if (required_but_missing.length) {
        return res.status(401).json(`Required params missing: ${required_but_missing.join(', ')}`);
    }

    if (!await isAvailableUsername(req.body.username)) {
        return res.status(401).json(`Username ${req.body.username} already in use`);
    }

    if (!is_valid_email(req.body.email)) {
        return res.status(401).send(`Invalid email address.`);
    }

    const temp_password = generateTemporaryPassword(); //send an email now with this to the provided email
    const hashedPassword = await bcyprt.hash(temp_password, 10); //default strength for salt creation is 10

    let sql = `INSERT INTO users (username, password, first_name, last_name, permissions, email) VALUES ('${req.body.username}', '${hashedPassword}', ${sql_wrap(req.body.first_name)}, ${sql_wrap(req.body.last_name)}, '${req.body.permissions}', ${sql_wrap(req.body.email)});`;

    const user_creation = await query(sql);

    if (!user_creation) {
        log('New User Creation Error');
        return res.status(422).send('New User Creation Error');
    };

    sql = `SELECT ${db_keys.all_except_pass.join(', ')} FROM users WHERE user_id = LAST_INSERT_ID();`;

    const [created_user_details] = await query(sql);

    log("1 record inserted", created_user_details);

    const user = {
        id: created_user_details.user_id
    };

    const ActivationToken = jwt.sign(user, process.env.ACTIVATION_TOKEN_SECRET_KEY);

    await emailService({
        to: req.body.email,
        message: `Welcome onboard! \n\n\tYour temp password: ${temp_password}\n\n\t Your activation token: ${ActivationToken}`, //TODO: embed this into a button in HTML or at least a hyperlink
    });
    //Do we want to then create a table specifically for that user and their data?

    return res.status(201).json({
        ...created_user_details,
        message: `Successfully created, User will receive email to activate account`,
    });
});

userRouter.post('/login', async (req, res) => {
    console.log('received', req.body);
    if (!req.body?.username) {
        return res.status(401).json({
            message: `Username required.`,
            error_part: 'username'
        });
    } else if (!req.body?.password) {
        return res.status(401).json({
            message: `Password required.`,
            error_part: 'password'
        });
    }

    let sql = `SELECT * FROM users WHERE username = ?`;

    await query(sql, req.body.username).then(async ([result]) => {
        if (!result || result?.deleted) {
            return res.status(401).json({
                message: `Username not recognized`,
                error_part: 'username'
            });
        };
        if (!result.active) {
            return res.status(401).json({
                message: `Cannot Login to Inactive Account. Must Activate first.`,
                error_part: 'inactive'
            });
        }
        if (await bcrypt.compare(req.body.password, result.password)) {
            const user = {
                id: result.user_id
            };
            const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET_KEY);
            return res.status(200).json({
                user_id: result.user_id,
                first_name: result.first_name,
                last_name: result.last_name,
                created_on: result.created_on,
                message: `Successful`,
                access_token,
            });
        } else {
            return res.status(401).json({
                message: `Incorrect Password`,
                error_part: 'password'
            });
        }
    });
});

userRouter.put('/activate/:user_id', async (req, res) => {

    if (!req?.query?.activation_token) {
        return res.status(401).json({
            message: `Activation Token not received`
        });
    }
    let decoded = jwt.decode(req.query.activation_token);

    if (decoded.id !== req.params.user_id) {
        return res.status(422).json({
            message: `Invalid Activation Token.`
        });
    }

    let current_status = await query(`SELECT active FROM users WHERE user_id = ? LIMIT 1;`, req.params.user_id);

    if (!current_status) {
        return res.status(422).json({
            message: `Something went wrong`
        });
    };
    if (!current_status.length) {
        return res.status(404).json({
            message: `Resource Does Not Exist`
        });
    };

    if (current_status[0]?.active) {
        return res.status(401).json({
            message: `User already active`
        });
    };



    let updated = await query(`UPDATE users SET active = TRUE WHERE user_id = ?;`, req.params.user_id);

    return res.status(200).json(updated);
});

userRouter.delete('/:user_id', authenticateToken, async (req, res) => {

    if (!defaultPermissions.actions.delete_other_user.includes(req.user.permissions) && req.user.id !== parseInt(req.params.user_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    if (!defaultPermissions.actions.delete_self_user.includes(req.user.permissions) && req.user.id === parseInt(req.params.user_id)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }

    let sql = `UPDATE users SET deleted = TRUE WHERE user_id = ?`;

    let result = await query(sql, req.params.user_id);

    return res.status(200).json(result);
});

userRouter.get('/:user_id', authenticateToken, async (req, res) => {
    if (req.user.id === Number(req.params.user_id) || req.user.permissions === 'total') {
        let sql = `SELECT user_id, username, last_name, first_name, email, permissions, active, created_on, updated_on FROM users WHERE user_id = ? LIMIT 1`;
        await query(sql, req.params.user_id).then(response => {
            if (!response) {
                return res.status(422).json({
                    message: `Something went wrong`
                });
            };
            if (!response.length) {
                return res.status(422).json({
                    message: `Resource Does Not Exist`
                });
            };
            return res.status(422).json(response);
        });
    } else {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }
});

userRouter.put('/:user_id', authenticateToken, async (req, res) => {

    let selected_user_details = await fetchUserDetails(req.params.user_id);

    if (!selected_user_details) {
        return res.status(422).json({
            message: `Something went wrong`
        });
    };

    const changes = {};

    Object.entries(selected_user_details).forEach(([key, og_value]) => {
        let changed_value = req.body[key];
        if (changed_value != null && changed_value !== og_value) {
            changes[key] = changed_value;
        }
    });

    if (changes.username) {
        if (!await isAvailableUsername(req.body.username)) {
            return res.status(401).send(`Username ${req.body.username} already in use`);
        }
    }

    if (changes.email && !is_valid_email(changes.email)) {
        return res.status(401).send(`Invalid email address.`);
    }

    if (changes.permissions) {
        if (!defaultPermissions.permission_access_framework[req.user.permissions].includes(changes.permissions)) {
            return res.status(403).send(`Forbidden: ${req.user.permissions} cannot change permission level to ${changes.permissions}.`);
        }
    }

    if (!Object.values(changes).length) { //this is concerning as it might be giving away the current status
        return res.status(422).json({
            message: `No Changes Detected`
        });
    }

    if (req.user.id === parseInt(req.params.user_id)) { //self-edit pathway, anyone can do it

        let props_allowed_to_be_changed = defaultPermissions.actions.edit_user_details_framework[req.user.permissions];

        for (const key of Object.keys(changes)) {
            if (!props_allowed_to_be_changed.includes(key)) {
                return res.status(403).send(`Forbidden: ${req.user.permissions} cannot edit ${key}.`);
            }
        };
    } else {
        if (!defaultPermissions.actions.edit_others_details.includes(req.user.permissions)) {
            return res.status(403).send('Forbidden: You do not have access to this.');
        };
    }

    let sql = `UPDATE users SET ${Object.keys(changes).map(key => `${key} = ?`).join(', ')} WHERE user_id = ?;`;

    await query(sql, [...Object.values(changes), req.params.user_id]).then(response => {
        if (!response) {
            return res.status(422).json({
                message: `Something went wrong`
            });
        };
        res.status(200).json({
            message: `${list(Object.keys(changes))} updated.`,
            response,
        });
    }).catch(error => {
        return res.status(422).send({
            message: `Something went wrong`,
            error
        });
    });
});


userRouter.get('/:user_id/positions', authenticateToken, async (req, res) => {
    let sql = `SELECT * FROM positions WHERE user_id = ? OR secondary_user_id = ? OR tertiary_user_id = ?`; //TODO: handle joint_confirmed prop
    //GET positions belonging to said user, based on perms

    if (req.params.user_id === req.user.id) {} //everyone can see their own positions
    else if (!defaultPermissions.access.view_other_users_positions.includes(req.user.permissions)) {
        return res.status(403).send('Forbidden: You do not have access to this.');
    }


    let results = await query(sql, Array(3).fill(req.params.user_id));

    if (!results) {
        return res.status(422).json({
            message: `Something went wrong`
        });
    }

    return res.status(422).json(results);
});

export default userRouter;