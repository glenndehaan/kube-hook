/**
 * Import own modules
 */
const kubernetes = require('./kubernetes');

/**
 * Check if replica sets are ready within a namespace
 *
 * @param namespace
 * @return {Promise<unknown>}
 */
const checkReplicaSets = (namespace) => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            let ready = true;

            const replicaSets = await kubernetes.getReplicaSets(namespace);
            replicaSets.items.filter(e => e.spec.replicas > 0).forEach((e) => {
                if(e.spec.replicas !== e.status.readyReplicas) {
                    ready = false;
                }
            });

            resolve(ready);
        }, 1000);
    });
}

/**
 * Check if all replica sets within a namespace are ready
 *
 * @param namespace
 * @return {Promise<unknown>}
 */
module.exports = (namespace) => {
    return new Promise(async (resolve) => {
        for(let i = 0; i < 25; i++) {
            const test = await checkReplicaSets(namespace);

            if(test) {
               resolve(true)
               return;
            }
        }

        resolve(false)
    });
}
