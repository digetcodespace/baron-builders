import { z } from "zod";
import { pageInput, uuid } from "./common";

export const listHousesInput = pageInput.extend({
  projectId: uuid.optional(),
});
export type ListHousesInput = z.infer<typeof listHousesInput>;

export const houseIdInput = z.object({ houseId: uuid });
