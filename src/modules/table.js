/**
 * Import vendor modules
 */
const AsciiTable = require('ascii-table');

/**
 * Import own modules
 */
const time = require('./time');

/**
 * Generate a table of pods
 *
 * @param pods
 * @return {*}
 */
module.exports = (pods) => {
    const table = new AsciiTable();
    table.setBorder('|', '-', '*', '*');
    table.setHeading('Name', 'Ready', 'Status', 'Restarts', 'Age');
    table.setHeadingAlign(AsciiTable.LEFT);

    pods.items.forEach((pod) => {
        table.addRow(pod.metadata.name, `${pod.status.containerStatuses.filter(e => e.ready).length}/${pod.status.containerStatuses.length}`, pod.status.phase, pod.status.containerStatuses[(pod.status.containerStatuses.length - 1)].restartCount, time(pod.status.startTime));
    });

    return table.toString();
}
