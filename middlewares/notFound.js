const notFound = (req, res) => {
  res.json({
    message: "Route not Found",
  });
};

export { notFound };
