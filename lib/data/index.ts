/** Server barrel. The browser barrel is `@/lib/data/client`. */
export { DataError, toDataError } from "./_errors";
export type { DataErrorCode } from "./_errors";
export {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  capLimit,
  decodeCursor,
  descCursorOrPredicate,
  encodeCursor,
  toPage,
} from "./_pagination";
export type { Cursor, Page, PageParams } from "./_pagination";
export { createAdminClient, createUserClient } from "./_supabase";
export type { CookieAdapter, Db } from "./_supabase";
export { createAuthUser, endSession, sendSignInCode, verifySignInCode } from "./auth";
export { insertAuditEntry } from "./audit";
export { addHouseBuyer, getHouse, isHouseBuyer, listHouses } from "./houses";
export type { ListHousesParams } from "./houses";
export { countHouseTypeUsage, deleteHouseType, getHouseType, insertHouseType, listHouseTypes, renameHouseType } from "./houseTypes";
export type { ListHouseTypesParams } from "./houseTypes";
export { getProjectDetail, listProjects, saveProject } from "./projects";
export type { SaveProjectInput } from "./projects";
export { listProjectStatuses } from "./projectStatuses";
export { getProfile, getProfileByEmail, listProfiles } from "./profiles";
export { addVendorUser, getVendor, listVendors } from "./vendors";
export type {
  AuditEntryInput,
  HouseRow,
  HouseStage,
  HouseTypeRow,
  HouseWithStage,
  ItemKind,
  ProfileRow,
  ProjectRow,
  ProjectDetail,
  ProjectStageRow,
  ProjectStatusRow,
  UserRole,
  VendorRow,
  VendorStage,
} from "./types";
