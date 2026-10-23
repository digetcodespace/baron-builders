/** Gated services barrel: every write behind it resolves the caller from the request context. */
export { RateLimitError } from "@/lib/rate-limit";
export {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  PaymentRequiredError,
  ServiceError,
  UnauthorizedError,
} from "./_errors";
export { contextLogError, type PublicContext, type RequestContext } from "./_context";
export { assertHouseAccess, assertStaff } from "./access";
export { recordAudit } from "./audit";
export { sendHouseEmail } from "./email";
export { getHouseById, listHouses } from "./houses";
export { inviteUser } from "./invites";
export type { InviteResult } from "./invites";
export { getMyProfile, listPeople } from "./people";
export { createProject, listProjects } from "./projects";
export { requestSignInCode, signOut, verifySignInCodeForSession } from "./signIn";
export { listVendors } from "./vendors";
