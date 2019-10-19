const opcua = require('node-opcua');
//https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/opcua_client.ts
// const endpointUrl = "opc.tcp://" + require("os").hostname() + ":48010";
// const endpointUrl = 'opc.tcp://opcuademo.sterfive.com:26543';

const endpointUrl =
  'opc.tcp://' + require('os').hostname() + ':4334/UA/MyLittleServer';
// const nodeId = 'ns=1;s=Temperature';
const nodeId = 'ns=1;s=free_memory';
async function main() {
  try {
    const client = opcua.OPCUAClient.create({
      endpoint_must_exist: false,
    });
    client.on('backoff', (retry, delay) =>
      console.log(
        'still trying to connect to ',
        endpointUrl,
        ': retry =',
        retry,
        'next attempt in ',
        delay / 1000,
        'seconds',
      ),
    );

    await client.connect(endpointUrl);

    const session = await client.createSession();
    //https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/client_session.ts
    const browseResult = await session.browse('RootFolder');

    //       console.log(browseResult.references.map((r)=>r.browseName.toString()).join("\n"));

    console.log('Browsing rootfolder: ');
    for (let reference of browseResult.references) {
      console.log(reference.browseName.toString(), reference.nodeId.toString());
    }
    debugger;
    const dataValue = await session.read({
      nodeId: nodeId,
      attributeId: opcua.AttributeIds.Value,
    });
    console.log(` free_memory = ${dataValue.value.value.toString()}`);

    const dataValue2 = await session.readVariableValue(nodeId);

    console.log(` free_memory = ${dataValue2.value.value.toString()}`);
//     debugger;
//     // step 5: install a subscription and monitored item
//
//     // https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/client_subscription.ts
    const subscriptionOptions = {
      maxNotificationsPerPublish: 1000,
      publishingEnabled: true,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10,
      requestedPublishingInterval: 1000,
    };

    const subscription = await session.createSubscription2(subscriptionOptions);
    subscription
      .on('started', () =>
        console.log(
          'subscription started - subscriptionId=',
          subscription.subscriptionId,
        ),
      )
      .on('keepalive', () => console.log('keepalive'))
      .on('terminated', () => console.log('subscription terminated'));

    // http://node-opcua.github.io/api_doc/2.0.0/classes/clientsubscription.html#monitor
    const monitoredItem = await subscription.monitor(
      {
        nodeId: nodeId,
        attributeId: opcua.AttributeIds.Value,
        indexRange: null,
        dataEncoding: {namespaceIndex: 0, name: null},
      },
      {
        samplingInterval: 3000,
        filter: null,
        queueSize: 1,
        discardOldest: true,
      },
      opcua.TimestampsToReturn.Neither,
    );

    // http://node-opcua.github.io/api_doc/2.0.0/interfaces/clientmonitoreditembase.html
    monitoredItem.on('changed', dataValue =>
      console.log(` free_memory = ${dataValue.value.value.toString()}`),
    );
    debugger;
    await new Promise(resolve => setTimeout(resolve, 10000));

    await subscription.terminate();

    console.log(' closing session');
    await session.close();

    await client.disconnect();
  } catch (err) {
    console.log('Error !!!', err);
  }
}

main();
