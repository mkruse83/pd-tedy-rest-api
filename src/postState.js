const DeviceHandler = require("./base/DeviceHandler");

module.exports = async event => {
  try {
    const thingName = event.pathParameters.id;
    const deviceHandler = new DeviceHandler(thingName);
    const requestedState = JSON.parse(event.body);
    console.log(
      "DEBUG: requested state " + JSON.stringify(requestedState, null, 2)
    );

    return deviceHandler
      .publishState(requestedState, false)
      .then(() => {
        return deviceHandler.getDeviceState();
      })
      .then(() => {
        return deviceHandler.awaitMessages();
      })
      .then(() => {
        return deviceHandler.disconnect();
      })
      .then(() => {
        console.log(
          "DEBUG: request completed. new state: " +
            JSON.stringify(deviceHandler.state.reported)
        );
        return {
          statusCode: 200,
          body: JSON.stringify(deviceHandler.state.reported)
        };
      })
      .catch(reason => {
        deviceHandler.disconnect();
        console.log("ERROR: in promisechain", reason);
        return Promise.resolve({
          statusCode: 400,
          body: JSON.stringify({ message: `error in promise chain: ${reason}` })
        });
      });
  } catch (error) {
    console.log("ERROR: " + error);
    return Promise.resolve({
      statusCode: 400,
      body: JSON.stringify({ message: `Could not post: ${error.stack}` })
    });
  }
};
