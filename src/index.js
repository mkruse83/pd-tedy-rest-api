const postState = require("./postState");
const getState = require("./getState");

exports.handler = async event => {
  try {
    console.log("==================================");
    console.log("event", event);
    console.log("==================================");
    if (event.resource === "/light/{id}" && event.httpMethod === "GET") {
      return await getState(event);
    } else if (
      event.resource === "/light/{id}" &&
      event.httpMethod === "POST"
    ) {
      return await postState(event);
    } else {
      return { statusCode: 404 };
    }
  } catch (e) {
    console.log("ERROR: ", e);
    return { statusCode: 400 };
  }
};
