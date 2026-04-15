const getUserId = (req) => {
  return (
    req.headers['x-user-id'] ||
    req.query.userId ||
    req.body.userId ||
    'demo-user'
  );
};

module.exports = { getUserId };
