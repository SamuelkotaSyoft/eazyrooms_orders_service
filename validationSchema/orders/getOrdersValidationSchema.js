import { query } from "express-validator";

const commonGetOrdersValidationSchema = [
  query("orderStatus").optional(),
  query("sortBy").optional().isString(),
];

export { commonGetOrdersValidationSchema };
