import { QueryTypes } from 'sequelize'
import { EnrichmentCache } from '../../services/premium/enrichment/types/memberEnrichmentTypes'
import { IRepositoryOptions } from './IRepositoryOptions'

class MemberEnrichmentCacheRepository {
  /**
   * Inserts enrichment data into cache. If a member
   * already has an enrichment entry, row is updated with the latest given data.
   * Returns null if data is falsy or an empty object.
   * @param memberId enriched member's id
   * @param data enrichment data
   * @param options
   * @returns
   */
  static async upsert(
    memberId: string,
    data: any,
    options: IRepositoryOptions,
  ): Promise<EnrichmentCache> {
    if (data && Object.keys(data).length > 0) {
      await options.database.sequelize.query(
        `INSERT INTO "memberEnrichmentCache" ("createdAt", "updatedAt", "memberId", "data")
          VALUES
              (now(), now(), :memberId, :data)
          ON CONFLICT ("memberId") DO UPDATE
          SET data = :data, "updatedAt" = now()
        `,
        {
          replacements: {
            memberId,
            data: JSON.stringify(data),
          },
          type: QueryTypes.UPSERT,
        },
      )
    }

    const cacheUpserted = await MemberEnrichmentCacheRepository.findByMemberId(memberId, options)
    return cacheUpserted
  }

  /**
   * Finds member enrichment cache given memberId
   * Returns null if not found.
   * @param memberId enriched member's id
   * @param options
   * @returns
   */
  static async findByMemberId(
    memberId: string,
    options: IRepositoryOptions,
  ): Promise<EnrichmentCache> {
    const records = await options.database.sequelize.query(
      `select *
       from "memberEnrichmentCache"
       where "memberId" = :memberId;
    `,
      {
        replacements: {
          memberId,
        },
        type: QueryTypes.SELECT,
      },
    )

    if (records.length === 0) {
      return null
    }

    return records[0]
  }
}

export default MemberEnrichmentCacheRepository
