import { Context } from "hono";
import { prisma } from "../../../../database/prisma";
import { listarTramites } from "../../application/queries/listar-tramites.query";
import { userFrom } from "../../../../common/http/context.helpers";



export class TramitesController {
  async listar(c: Context) {
    const user = userFrom(c);
    const data = await listarTramites(prisma, {
      user,
      pageQuery: c.req.query("page"),
      pageSizeQuery: c.req.query("pageSize"),
      estadoQuery: c.req.query("estado"),
      searchQuery: c.req.query("q"),
      sortKeyQuery: c.req.query("sortKey"),
      sortDirectionQuery: c.req.query("sortDirection"),
    });
    return c.json({ success: true, data });
  }
}
