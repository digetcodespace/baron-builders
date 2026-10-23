import { z } from "zod";
import { pageInput, uuid } from "./common";

const name = z.string().trim().min(1, "Give the house type a name").max(80, "Keep the name under 80 characters");

export const listHouseTypesInput = pageInput.extend({ projectId: uuid });
export const createHouseTypeInput = z.object({ projectId: uuid, name });
export const renameHouseTypeInput = z.object({ houseTypeId: uuid, name });
export const houseTypeIdInput = z.object({ houseTypeId: uuid });
