/**
 * Import vendor modules
 */
const kubernetes = require('@kubernetes/client-node');

/**
 * Create kubernetes connection
 */
const kubernetesConnection = new kubernetes.KubeConfig();
kubernetesConnection.loadFromDefault();

/**
 * Create kubernetes apis
 */
const kubernetesCoreApi = kubernetesConnection.makeApiClient(kubernetes.CoreV1Api);
const kubernetesDeploymentApi = kubernetesConnection.makeApiClient(kubernetes.AppsV1Api);

/**
 * Kubernetes module functions
 */
const kubernetesModule = {
    /**
     * Return kubernetes info
     *
     * @returns {Promise<*>}
     */
    info: () => {
        return new Promise(async (resolve) => {
            const nodes = await kubernetesCoreApi.listNode().catch((e) => {
                console.error(e);
                process.exit(1);
            });

            resolve(nodes.body);
        });
    },

    /**
     * Get all deployments within a namespace
     *
     * @param namespace
     * @returns {Promise<unknown>}
     */
    getDeployments: (namespace) => {
        return new Promise(async (resolve) => {
            const deployments = await kubernetesDeploymentApi.listNamespacedDeployment(namespace).catch((e) => {
                console.error(e);
                process.exit(1);
            });

            if(typeof deployments !== "undefined") {
                resolve(deployments.body);
            }

            resolve([]);
        });
    },

    /**
     * Get all replica sets within a namespace
     *
     * @param namespace
     * @returns {Promise<unknown>}
     */
    getReplicaSets: (namespace) => {
        return new Promise(async (resolve) => {
            const replicaSets = await kubernetesDeploymentApi.listNamespacedReplicaSet(namespace).catch((e) => {
                console.error(e);
                process.exit(1);
            });

            if(typeof replicaSets !== "undefined") {
                resolve(replicaSets.body);
            }

            resolve([]);
        });
    },

    /**
     * Get all pods within a namespace
     *
     * @param namespace
     * @return {Promise<unknown>}
     */
    getPods: (namespace) => {
        return new Promise(async (resolve) => {
            const pods = await kubernetesCoreApi.listNamespacedPod(namespace).catch((e) => {
                console.error(e);
                process.exit(1);
            });

            if(typeof pods !== "undefined") {
                resolve(pods.body);
            }

            resolve([]);
        });
    },

    /**
     * Rollout restart a deployment
     *
     * @param namespace
     * @param name
     * @returns {Promise<unknown>}
     */
    rolloutRestartDeployment: (namespace, name) => {
        return new Promise(async (resolve, reject) => {
            const opts = {
                spec: {
                    template: {
                        metadata: {
                            annotations: {
                                'kube-hook.glenndehaan.com/restartedAt': `${new Date().toISOString()}`
                            }
                        }
                    }
                }
            };

            const result = await kubernetesDeploymentApi.patchNamespacedDeployment(name, namespace, opts, undefined, undefined, undefined, undefined, undefined, {
                headers: {
                    'Content-type': kubernetes.PatchUtils.PATCH_FORMAT_JSON_MERGE_PATCH
                }
            }).catch((e) => {
                reject(e);
            });

            resolve(result);
        });
    }
};

/**
 * Exports the kubernetes module functions
 */
module.exports = kubernetesModule;
