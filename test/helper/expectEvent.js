const BigNumber = web3.BigNumber;
const should = require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

function inLogs(logs, eventName, eventArgs = {}) {
    const event = logs.find(function (e) {
        if (e.event === eventName) {
            for (const [k, v] of Object.entries(eventArgs)) {
                contains(e.args, k, v);
            }
            return true;
        }
    });
    should.exist(event);
    return event;
}

async function inTransaction(tx, eventName, eventArgs = {}) {
    const { logs } = await tx;
    return inLogs(logs, eventName, eventArgs);
}

function contains(args, key, value) {
    assert.equal(args[key], value);
}

module.exports = {
    inLogs,
    inTransaction,
};
