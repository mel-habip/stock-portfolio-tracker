import cron from "node-cron";
import emailService from '../jobs/emailService.js';
import query from '../utils/db_connection.js';


const log = console.log;

//Note: see @https://crontab-generator.org/ to see how the numbers work


/**
 * Likely plan:
 * 1) Create tables called DailyScheduled, MonthlyScheduled, QuarterlyScheduled, AnnualScheduled, SemiAnnualScheduled
 *   1.1) Or create one table called "ScheduledEvents" and query it separately? This would make it easier to edit Alerts/Scheduled Jobs?
 * 2) When users opt into such Alerts, add to DB an Alert Instance with all the details.
 * 3) User can edit Alert instance,
 * 4) Users can delete Alert instance permanently
 * 5) Users can soft-delete (turn off) Alert instance temporarily
 * 6) FUTURE --> Users can set a temporary 
 * 7) When Cron Job is triggered, query DB for all jobs that are both on that schedule && are active. Then, for each, do the action.
 */

const REGULAR_SCHEDULED_JOBS = {
    monthly: cron.schedule("1 0 1 * *", async function () { //at 0:01am
        log(`Monthly triggered`);
        let monthly_tasks = await query(`Select * FROM alerts WHERE frequency = 'MONTHLY' AND active = TRUE`);
        for await (const task of monthly_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    weekly: cron.schedule("1 1 * * 1", async function () { //at 1:01am
        log(`Weekly triggered`);
        let weekly_tasks = await query(`Select * FROM alerts WHERE frequency = 'WEEKLY' AND active = TRUE`);
        for await (const task of monthly_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    daily: cron.schedule("1 2 * * *", async function () { //at 2:01 am
        log(`Daily triggered`);

        let daily_tasks = await query(`Select * FROM alerts WHERE frequency = 'DAILY' AND active = TRUE`);
        for await (const task of daily_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    quarterly: cron.schedule("1 3 1 1,4,7,10 *", async function () { //at 3:01am
        log(`Quarterly triggered`);
        let quarterly_tasks = await query(`Select * FROM alerts WHERE frequency = 'QUARTERLY' AND active = TRUE`);
        for await (const task of quarterly_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    annual: cron.schedule("1 4 1 1 *", async function () { //at 4:01am
        log(`Quarterly triggered`);
        let quarterly_tasks = await query(`Select * FROM alerts WHERE frequency = 'ANNUAL' AND active = TRUE`);
        for await (const task of quarterly_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    semi_annual: cron.schedule("1 5 1 1,7 *", async function () { //at 5:01am
        log(`Quarterly triggered`);
        let quarterly_tasks = await query(`Select * FROM alerts WHERE frequency = 'SEMI_ANNUAL' AND active = TRUE`);
        for await (const task of quarterly_tasks) {
            job_handler(task);
            //no tasks yet
        }
    }),
    minutely: cron.schedule("* * * * *", async function () { //at 5:01am
        // log(`minutely triggered`);

        // let quarterly_tasks = await query(`Select * FROM alerts WHERE frequency = 'SEMI_ANNUAL' AND active = TRUE`);
        // for await (const task of quarterly_tasks) {
        //     job_handler(task);
        //     //no tasks yet
        // }
    })
};

export default REGULAR_SCHEDULED_JOBS;

const KNOWN_TASKS = {
    future_dividends: async function (time_period) {},
    past_dividends: async function (time_period) {},
    past_performance : async function (time_period) {},
    analyst_recommendations: async function () {}
};

async function job_handler(job, details) {
    //knows how to handle a job.
    if (KNOWN_TASKS.hasOwnProperty(job)) {

        let result_of_job = await KNOWN_TASKS[job];

        emailService({}); //to the owner, if email is known. do LEFT JOIN in query to know the emails.
    }
};