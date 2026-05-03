export function safePlugin(schema) {
  schema.pre("save", function (next) {
    const allowed = Object.keys(schema.paths);

    Object.keys(this._doc).forEach((key) => {
      if (!allowed.includes(key)) {
        delete this[key];
      }
    });

    next();
  });
}
