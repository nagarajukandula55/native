export function mongoSafePlugin(schema) {
  schema.pre("save", function (next) {
    const allowed = Object.keys(schema.paths);

    for (const key of Object.keys(this._doc)) {
      if (!allowed.includes(key)) {
        delete this._doc[key];
      }
    }

    next();
  });
}
