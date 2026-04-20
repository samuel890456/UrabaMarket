import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function validate({ body: bodySchema, query: querySchema, params: paramsSchema } = {}) {
  return (req, _res, next) => {
    try {
      if (bodySchema) req.body = bodySchema.parse(req.body ?? {});
      if (querySchema) req.query = querySchema.parse(req.query ?? {});
      if (paramsSchema) req.params = paramsSchema.parse(req.params ?? {});
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const msg = e.errors.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ");
        return next(new ApiError.BadRequest(msg));
      }
      next(e);
    }
  };
}
