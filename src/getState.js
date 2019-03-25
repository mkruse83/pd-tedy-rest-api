const postLight = event => {
  return {
    statusCode: 200,
    body: JSON.stringify("Hello from get Light!")
  };
};

module.exports = postLight;
