import { autonomousBrain } from "./autonomousBrain";

export function autonomousEngine(product) {
  const result = autonomousBrain(product);

  const actionMap = {
    auto_approve: "approve",
    review: "review",
    reject: "reject",
  };

  return {
    ...result,
    action: actionMap[result.decision],
    confidence: result.score,
  };
}
