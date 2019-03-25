const uuidv1 = require("uuid/v1");
let awsIot = require("aws-iot-device-sdk");

class DeviceHandler {
  constructor(thingName) {
    this.thingName = thingName;
    this.messageCount = 0;
  }

  publishState(desiredState) {
    const that = this;
    return that.getDevice().then(device => {
      device.subscribe(`$aws/things/${that.thingName}/shadow/update/accepted`);
      device.subscribe(`$aws/things/${that.thingName}/shadow/update/rejected`);
      console.log("DEBUG: publishing update: ", desiredState);
      that.messageCount++;
      device.publish(
        `$aws/things/${that.thingName}/shadow/update`,
        JSON.stringify({
          state: {
            desired: desiredState
          }
        })
      );
    });
  }

  getDevice() {
    const that = this;
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
        device.on("message", (topic, payload) => {
          console.log(
            "DEBUG: message " + topic + " payload " + payload.toString()
          );
          that.messageCount--;
          if ("$aws/things/" + that.thingName + "/shadow/get/accepted") {
            const state = JSON.parse(payload.toString());
            this.state = state.state;
          }
        });
      });
    }
    return this.promise;
  }

  getThingName(request) {
    return request.directive.endpoint.cookie.thingName;
  }

  getPendingMessageCount() {
    // console.log("DEBUG: messageCount: ", this.messageCount);
    return this.messageCount;
  }

  awaitMessages() {
    const that = this;
    return this.getDevice().then(() => {
      return new Promise((resolve, reject) => {
        let tries = 0;
        const interval = setInterval(() => {
          const messageCount = that.getPendingMessageCount();
          if (messageCount === 0) {
            clearInterval(interval);
            resolve();
          } else if (tries >= 100) {
            clearInterval(interval);
            reject("timeout");
          }
          tries++;
        }, 10);
      });
    });
  }

  disconnect() {
    return this.getDevice().then(device => {
      device.end();
    });
  }

  getDeviceState() {
    const that = this;
    this.getDevice().then(device => {
      device.subscribe(
        "$aws/things/" + that.thingName + "/shadow/get/accepted"
      );
      console.log("DEBUG: publishing get");
      that.messageCount++;
      device.publish("$aws/things/" + that.thingName + "/shadow/get");
    });
  }
}

module.exports = DeviceHandler;
