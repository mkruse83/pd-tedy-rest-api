const uuidv1 = require("uuid/v1");
let awsIot = null;
try {
  awsIot = require("aws-iot-device-sdk");
} catch (e) {
  console.log("ERROR: init awsIot", e);
}

class DeviceHandler {
  constructor() {}

  publishState(thingName, desiredState, disconnect = true) {
    const that = this;
    return that.getDevice().then(device => {
      device.subscribe(`$aws/things/${thingName}/shadow/update/accepted`);
      device.subscribe(`$aws/things/${thingName}/shadow/update/rejected`);
      device.on("message", (topic, payload) => {
        console.log("DEBUG: message " + topic);
        if (
          disconnect &&
          (topic.indexOf("accepted") > -1 || topic.indexOf("rejected") > -1)
        ) {
          device.end();
        }
      });
      console.log("DEBUG: publishing update");
      device.publish(
        `$aws/things/${thingName}/shadow/update`,
        JSON.stringify({
          state: {
            desired: desiredState
          }
        })
      );
    });
  }

  getDevice() {
    if (!this.promise) {
      this.promise = new Promise(resolve => {
        const device = awsIot.device({
          clientId: "tedy-rest-api-" + uuidv1(),
          host: "a1idkifp80vw18-ats.iot.eu-west-1.amazonaws.com",
          region: "eu-west-1",
          protocol: "wss",
          debug: true
        });
        device.on("connect", () => {
          console.log("DEBUG: connected");
          resolve(device);
        });
      });
    }
    return this.promise;
  }

  getThingName(request) {
    return request.directive.endpoint.cookie.thingName;
  }

  async getDeviceState(thingName, disconnect = true) {
    const device = await this.getDevice();
    device.subscribe("$aws/things/" + thingName + "/shadow/get/accepted");
    const promise = new Promise(resolve => {
      device.on("message", (topic, payload) => {
        console.log(
          "DEBUG: message " + topic + " payload " + payload.toString()
        );
        const state = JSON.parse(payload.toString());
        if (disconnect) {
          device.end();
        }
        resolve(state.state);
      });
    });
    device.publish("$aws/things/" + thingName + "/shadow/get");
    return promise;
  }
}

module.exports = DeviceHandler;
