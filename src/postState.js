const DeviceHandler = require("./base/DeviceHandler");

module.exports = async event => {
  try {
    const deviceHandler = new DeviceHandler();
    const thingName = event.pathParameters.id;
    const requestedState = JSON.parse(event.body);
    console.log(
      "DEBUG: requested state " + JSON.stringify(requestedState, null, 2)
    );

    await deviceHandler.publishState(thingName, requestedState);
    // const newState = await deviceHandler.getDeviceState(thingName);
    // console.log(
    //   "DEBUG: request completed. new state: " + JSON.stringify(newState)
    // );
    return {
      statusCode: 200
      // body: JSON.stringify(newState)
    };
  } catch (error) {
    console.log("ERROR: " + error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `Could not post: ${error.stack}` })
    };
  }
};
