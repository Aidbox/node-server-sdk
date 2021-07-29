import { TCtx, TResource } from "@aidbox/server-sdk";

export type THelpers = {
  findResources<R extends TResource>(
    resourceType: string,
    params: Record<string, string | number>
  ): Promise<{ resources: R[]; total: number }>;
  getResource<R extends TResource>(
    resourceType: string,
    resourceId: string
  ): Promise<R>;
};

export const createHelpers = (ctx: TCtx): THelpers => ({
  findResources: async <R extends TResource>(
    resourceType: string,
    params: Record<string, string | number>
  ) => {
    const {
      data: { entry, total },
    } = await ctx.request<{ entry: { resource: R }[]; total: number }>({
      url: `/${resourceType}`,
      params,
    });
    return { resources: entry.map((e) => e.resource), total };
  },
  getResource: async <R extends TResource>(
    resourceType: string,
    resourceId: string
  ) => {
    const { data: resource } = await ctx.request<R>({
      url: `/${resourceType}/${resourceId}`,
    });
    return resource;
  },
});
