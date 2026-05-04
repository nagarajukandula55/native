export function safePlugin(schema) {
  schema.pre(["findOneAndUpdate", "updateOne"], function (next) {
    const update = this.getUpdate();

    if (!update) return next();

    // ✅ REMOVE unknown dangerous fields
    if (update.name) delete update.name;

    if (update.$set && update.$set.name) {
      delete update.$set.name;
    }

    this.setUpdate(update);

    next();
  });
}
