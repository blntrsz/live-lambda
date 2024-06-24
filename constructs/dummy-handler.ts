import iot from "aws-iot-device-sdk";
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot";

const client = new IoTClient({});

const TOPIC = `live-lambda/${process.env.STAGE}/${process.env.ENTRY}`;

export async function handler(event: any) {
  const result = await new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        type: "function.timeout",
      });
    }, 5 * 1000);

    const response = await client.send(
      new DescribeEndpointCommand({ endpointType: "iot:Data-ATS" })
    );
    const endpoint = response.endpointAddress;

    const device = new iot.device({
      protocol: "wss",
      debug: true,
      host: endpoint,
      region: 'eu-central-1'
    });

    device.on("error", console.log);
    device.on("connect", console.log);
    device.subscribe(TOPIC + "/response", {
      qos: 1,
    });

    device.on("message", (_topic, payload) => {
      clearTimeout(timeout)
      return resolve(payload.toString())
    })

    device.publish(TOPIC, JSON.stringify({
      event,
      entry: process.env.ENTRY,
      stage: process.env.STAGE,
    }), { qos: 1 });
  })

  return result
}
