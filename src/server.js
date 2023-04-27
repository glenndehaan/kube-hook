/**
 * Import base packages
 */
const express = require('express');

/**
 * Import own modules
 */
const shutdown = require('./modules/shutdown');
const log = require('./modules/logger');
const kubernetes = require('./modules/kubernetes');

/**
 * Import controllers
 */
const HealthController = require('./controllers/HealthController');
const DeploymentController = require('./controllers/DeploymentController');

/**
 * Create express app
 *
 * @type {*|Express}
 */
const app = express();

/**
 * Trust proxy
 */
app.enable('trust proxy');

/**
 * Implement health check before other modules
 */
HealthController(app);

/**
 * Enable additional body parsers
 */
app.use(express.urlencoded({extended: false}));
app.use(express.json());

/**
 * Request logger
 */
app.use((req, res, next) => {
    log.debug(`[WEB REQUEST]: ${req.originalUrl}`);
    next();
});

/**
 * Configure routers/controllers
 */
DeploymentController(app);

/**
 * Setup default 404 message
 */
app.use(async (req, res) => {
    res.status(404);
    res.set('Content-Type', 'text/plain');
    res.send('Not Found');
});

/**
 * Disable powered by header for security reasons
 */
app.disable('x-powered-by');

/**
 * Start listening on port
 */
const server = app.listen(3000, '0.0.0.0', async () => {
    log.info('                kube-hook               ');
    log.info('            By: Glenn de Haan           ');
    log.info('https://github.com/glenndehaan/kube-hook');
    log.info('');

    log.info(`[WEB] App is running on: 0.0.0.0:3000`);

    const kubernetesInfo = await kubernetes.info();
    log.info(`[KUBERNETES] Connected! Node(s): ${kubernetesInfo.items.length}, Hostname(s): ${kubernetesInfo.items.map((e) => e.metadata.name).join(',')}`);
});

/**
 * Handle shutdown events
 */
shutdown(() => {
    server.close(() => {
        console.log('HTTP server closed!');
        process.exit(0);
    });
});
