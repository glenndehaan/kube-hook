/**
 * Import own modules
 */
const log = require('../modules/logger');
const tokens = require('../modules/tokens');
const table = require('../modules/table');
const replica = require('../modules/replica');
const kubernetes = require('../modules/kubernetes');

/**
 * Exports all deployment controller endpoints
 *
 * @param app
 */
module.exports = (app) => {
    /**
     * GET /deployment/:namespace - Deployment Namespace Restart
     */
    app.get('/deployment/:namespace', async (req, res) => {
        const start = new Date();
        const tokensObject = tokens();
        const skip = req.query.skip ? req.query.skip.split(',') : [];

        log.info(`[/deployment/:namespace] Authorization: ${req.headers.authorization}`);
        log.info(`[/deployment/:namespace] Params: ${JSON.stringify(req.params)}`);
        log.info(`[/deployment/:namespace] Query: ${JSON.stringify(req.query)}`);

        if(typeof req.headers.authorization === "undefined") {
            log.warn(`[/deployment/:namespace] No authorization token provided`);
            res.status(401);
            res.set('Content-Type', 'text/plain');
            res.send('Unauthorized');
            return;
        }

        if(req.headers.authorization !== tokensObject[req.params.namespace]) {
            log.warn(`[/deployment/:namespace] Invalid authorization token provided`);
            res.status(403);
            res.set('Content-Type', 'text/plain');
            res.send('Forbidden');
            return;
        }

        const status = [];
        const deployments = await kubernetes.getDeployments(req.params.namespace);

        if(typeof deployments.items === "undefined" || deployments.items.length < 1) {
            log.warn(`[/deployment/:namespace] Invalid namespace provided: ${req.params.namespace}`);
            res.status(404);
            res.set('Content-Type', 'text/plain');
            res.send('Not Found');
            return;
        }

        log.info(`[/deployment/:namespace] Found ${deployments.items.length} deployment(s)!`);

        for(let item = 0; item < deployments.items.length; item++) {
            if(!skip.includes(deployments.items[item].metadata.name)) {
                const state = await kubernetes.rolloutRestartDeployment(req.params.namespace, deployments.items[item].metadata.name).catch((e) => {
                    log.error(`[/deployment/:namespace] Error while updating deployment (deployments.items[item].metadata.name): ${e}, ${e.body.message}`);
                    status.push(`> Deployment: ${deployments.items[item].metadata.name} ... error: ${e}, ${e.body.message}`);
                });

                if (typeof state !== "undefined") {
                    log.log(`[/deployment/:namespace] Deployment updated: ${deployments.items[item].metadata.name}`);
                    status.push(`> Deployment: ${deployments.items[item].metadata.name} ... ok`);
                }
            } else {
                log.log(`[/deployment/:namespace] Deployment skipped: ${deployments.items[item].metadata.name}`);
                status.push(`> Deployment: ${deployments.items[item].metadata.name} ... skipped`);
            }
        }

        const replicasReady = await replica(req.params.namespace);

        const pods = await kubernetes.getPods(req.params.namespace);
        const podTable = table(pods);

        res.status(replicasReady ? 200 : 500);
        res.set('Content-Type', 'text/plain');
        res.send(`>> Run started: ${start}\n>> Starting roll-out restart (Namespace: ${req.params.namespace}) ...\n\n${status.join('\n')}\n\n>> Completed roll-out restart (Namespace: ${req.params.namespace})!\n>> Run completed: ${new Date()}${replicasReady ? '' : '\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n!! Warning: Pods are not in expected state before timeout !!\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n'}\n\nPod State (${new Date()}):\n${podTable}`);
    });
}
