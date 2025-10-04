import { PrismaClient } from "../../../generated/prisma";

export abstract class BaseRepository {
  constructor(protected readonly prisma: PrismaClient) {}
}
