import Counter from "@/models/Counter";

function getDatePart() {
  const date = new Date();
  return (
    String(date.getFullYear()).slice(2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0")
  );
}

function getRandom() {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

export async function generateOrderId() {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(6, "0");
  const date = getDatePart();
  const random = getRandom();

  return `NA-${date}-${seq}-${random}`;
}
