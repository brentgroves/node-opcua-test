const opcua = require('node-opcua');
const mqtt = require('mqtt');

//https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/opcua_client.ts
const endpointUrl = 'opc.tcp://10.1.2.37:49321';
// 'opc.tcp://BUSCHE-ALB-KORS.BUSCHE-CNC.com:49321';
// 'opc.tcp://BUSCHE-ALB-KORS.BUSCHE-CNC.com:49320';
// 'opc.tcp://bgroves-desk:49320'; // very slow on home wifi
// 'opc.tcp://bgroves_desk.busche-cnc.com:49320'; // from work put in /etc/hosts
// 'opc.tcp://192.168.254.15:49320';
// 'opc.tcp://10.1.1.193:49320';
// const endpointUrl = "opc.tcp://" + require("os").hostname() + ":48010";

const nid = [
  // 'ns=2;s=CNC360.CNC360.Cycle_Counter_Shift_SL',
  // 'ns=2;s=CNC362.CNC362.Cycle_Counter_Shift_SL',
  'ns=2;s=CNC422.CNC422.Cycle_Counter_Shift_SL',
  // "ns=2;s=CNC289.CNC289.Axes(Maxes1).Linear(Mx1).X1actm",
  // "ns=2;s=CNC289.CNC289.Axes(Maxes1).Rotary(Mc1).S1load"
];
async function main() {
  try {
    const mqttClient = mqtt.connect(
      'mqtt://ec2-18-218-2-29.us-east-2.compute.amazonaws.com',
    );
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

    //github.com/node-opcua/node-opcua/blob/db4953536772a4b3fa501ce7961fdc400c0b5e82/test/test_opcua_ClientServer_UserNameIdentityToken.js#L39onst userIdentityToken = new s.UserNameIdentityToken({
    //https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/client_session.ts
    // const browseResult = await session.browse('ns=2;s=CNC103.CNC103.CNC103');
    // console.log('Browsing rootfolder: ');
    // for (let reference of browseResult.references) {
    //   console.log(reference.browseName.toString(), reference.nodeId.toString());
    // }
    debugger;
    // const dataValue = await session.read({
    //   nodeId: nid[0],
    //   attributeId: opcua.AttributeIds.Value,
    // });
    // console.log(` Part Counter CNC 103 = ${dataValue.value.value.toString()}`);

    //const dataValue2 = await session.readVariableValue(nid[1]);
    // for (let i=0;i<nid.length;i++) {
    //     console.log(nid[i])
    //   let dataValue3 = await session.readVariableValue(nid[i]);
    //   console.log(` part_count = ${dataValue3.value.value.toString()}`);
    // }

    //     debugger;
    // step 5: install a subscription and monitored item

    //    https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/client_subscription.ts
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
      // .on('keepalive', () => console.log('keepalive'))
      .on('terminated', () => console.log('subscription terminated'));

    // http://node-opcua.github.io/api_doc/2.0.0/classes/clientsubscription.html#monitor
    var monitoredItem = [];
    for (let i = 0; i < nid.length; i++) {
      let mi = await subscription.monitor(
        {
          nodeId: nid[i],
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
        opcua.TimestampsToReturn.Both,
      );
      monitoredItem.push(mi);
      monitoredItem[i].on('changed', dataValue => {
        let Cycle_Counter_Shift_SL=`${dataValue.value.value.toString()}`;
        console.log(`${nid[i]} = ${dataValue.value.value.toString()}`);
        // mqttClient.publish('house/bulb1', part_counter);
        mqttClient.publish('CNC422/Cycle_Counter_Shift_SL',Cycle_Counter_Shift_SL);
      });
    }
    // http://node-opcua.github.io/api_doc/2.0.0/interfaces/clientmonitoreditembase.html
    // monitoredItem[0].on('changed', dataValue =>
    //   console.log(` part_counter 1 = ${dataValue.value.value.toString()}`),
    // );
    // monitoredItem[1].on('changed', dataValue =>
    //   console.log(` part_counter 2 = ${dataValue.value.value.toString()}`),
    // );
    debugger;
    // await new Promise(resolve => setTimeout(resolve, 200000));
    //
    // await subscription.terminate();
    //
    // console.log(' closing session');
    // await session.close();
    //
    // await client.disconnect();
  } catch (err) {
    console.log('Error !!!', err);
  }
}

main();
