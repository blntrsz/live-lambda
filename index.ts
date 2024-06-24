import iot from "aws-iot-device-sdk";
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot";

const client = new IoTClient({});
const response = await client.send(
  new DescribeEndpointCommand({ endpointType: "iot:Data-ATS" })
);
const endpoint = response.endpointAddress;

const TOPIC = `live-lambda/${"balint"}/${'./lib/handler.ts'}`;

const device = new iot.device({
  protocol: "wss",
  debug: true,
  host: endpoint,
  region: 'eu-central-1',
  reconnectPeriod: 1,
  keepalive: 60,
});

device.on("error", console.log);
device.on("connect", console.log);
device.subscribe("*", {
  qos: 1,
});
device.subscribe(TOPIC, {
  qos: 1,
});

device.on("message", async (topic, payload) => {
  console.log({ topic })
  const fragment = JSON.parse(payload.toString());

  const fn = await import(fragment.entry + `?cacheBust=${Date.now()}`)

  const response = fn.handler(fragment.event)
  console.log(
    { response }
  )

  device.publish(TOPIC + "/response", JSON.stringify(response), { qos: 1 });
})

