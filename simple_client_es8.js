const opcua = require("node-opcua");
//https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/opcua_client.ts
//xx const endpointUrl = "opc.tcp://" + require("os").hostname() + ":48010";
const endpointUrl = "opc.tcp://opcuademo.sterfive.com:26543";
const nodeId = "ns=1;s=Temperature";
async function main() {

    try {

// const endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/MyLittleServer";
const client = opcua.OPCUAClient.create({
    endpoint_must_exist: false
});
client.on("backoff", (retry, delay) => 
    console.log("still trying to connect to ", endpointUrl ,": retry =", retry, "next attempt in ", delay/1000, "seconds" )
);
        // const client = new opcua.OPCUAClient({
        //     connectionStrategy: {
        //         maxRetry: 2,
        //         initialDelay: 2000,
        //         maxDelay: 10 * 1000
        //     }
        // });

        
//        await new Promise((resolve) => setTimeout(resolve, 10000));
//        debugger;
        // client.on("backoff", () => console.log("retrying connection"));

        await client.connect(endpointUrl);

        const session = await client.createSession();
//https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/client_session.ts
        const browseResult = await session.browse("RootFolder");

 //       console.log(browseResult.references.map((r)=>r.browseName.toString()).join("\n"));

               console.log("Browsing rootfolder: ");
               for(let reference of browseResult.references) {
                   console.log( reference.browseName.toString(), reference.nodeId.toString());
               }
debugger;
        const dataValue = await session.read({nodeId: nodeId, attributeId: opcua.AttributeIds.Value});
        console.log(` temperature = ${dataValue.value.value.toString()}`);

        const dataValue2 = await session.readVariableValue(nodeId);

        console.log(` temperature2 = ${dataValue2.value.value.toString()}`);
debugger;
        // step 5: install a subscription and monitored item

       const subscriptionOptions = {
           maxNotificationsPerPublish: 1000,
           publishingEnabled: true,
           requestedLifetimeCount: 100,
           requestedMaxKeepAliveCount: 10,
           requestedPublishingInterval: 1000
       };

        const subscription = await session.createSubscription2(subscriptionOptions);
        // const subscription = new opcua.ClientSubscription(session, {
        //     requestedPublishingInterval: 1000,
        //     requestedLifetimeCount: 10,
        //     requestedMaxKeepAliveCount: 2,
        //     maxNotificationsPerPublish: 10,
        //     publishingEnabled: true,
        //     priority: 10
        // });

        subscription
            .on("started", () => console.log("subscription started - subscriptionId=", subscription.subscriptionId))
            .on("keepalive",() => console.log("keepalive"))
            .on("terminated", () => console.log("subscription terminated"));

debugger;
// https://github.com/node-opcua/node-opcua/blob/master/packages/node-opcua-client/source/client_subscription.ts

        const monitoredItem = subscription.monitor({
                nodeId: nodeId,
                attributeId: opcua.AttributeIds.Value
            },
            {
                samplingInterval: 1000,
                discardOldest: true,
                queueSize: 10
            },
            opcua.TimestampsToReturn.Both
        );
/*
     *   clientSubscription.monitor(
     *     // itemToMonitor:
     *     {
     *       nodeId: "ns=0;i=2258",
     *       attributeId: AttributeIds.Value,
     *       indexRange: null,
     *       dataEncoding: { namespaceIndex: 0, name: null }
     *     },
     *     // requestedParameters:
     *     {
     *        samplingInterval: 3000,
     *        filter: null,
     *        queueSize: 1,
     *        discardOldest: true
     *     },
     *     TimestampsToReturn.Neither
     *   );
*/

debugger;

        monitoredItem.on("changed", (dataValue) => console.log(` Temperature = ${dataValue.value.value.toString()}`));

        await new Promise((resolve) => setTimeout(resolve, 10000));

        await subscription.terminate();

        console.log(" closing session");
        await session.close();

        await client.disconnect();
    }
    catch (err) {
        console.log("Error !!!", err);
    }
}

main();
