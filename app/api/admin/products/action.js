await Product.updateOne(
  { productKey },
  {
    $set: updateFields,
    $push: {
      activity: {
        action,
        by: "admin",
        note: reason || "",
        time: new Date(),
      }
    }
  }
);
