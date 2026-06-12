import { prisma } from "./prisma";
import { DEMO_USER_ID } from "./constants";

export async function getDemoUser() {
  return prisma.user.findUniqueOrThrow({
    where: { id: DEMO_USER_ID },
  });
}
