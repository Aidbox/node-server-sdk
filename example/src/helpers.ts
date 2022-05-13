import {
  Ctx,
  ManifestOperation,
  ManifestSubscription,
  OperationRequestType,
  Resource,
} from "@aidbox/node-server-sdk";

export type THelpers = {
  findResources<R extends Resource>(
    resourceType: string,
    params: Record<string, string | number>
  ): Promise<{ resources: R[]; total: number }>;
  getResource<R extends Resource>(
    resourceType: string,
    resourceId: string
  ): Promise<R>;
};

export const createHelpers = (ctx: Ctx): THelpers => ({
  findResources: async <R extends Resource>(
    resourceType: string,
    params: Record<string, string | number>
  ) => {
    const {
      data: { entry, total },
    } = await ctx.request<{ entry: { resource: R }[]; total: number }>({
      url: `/${resourceType}`,
      params,
    });
    return { resources: entry.map((e: any) => e.resource), total };
  },
  getResource: async <R extends Resource>(
    resourceType: string,
    resourceId: string
  ) => {
    const { data: resource } = await ctx.request<R>({
      url: `/${resourceType}/${resourceId}`,
    });
    return resource;
  },
});

//

export type TOperation<T extends OperationRequestType = any> =
  ManifestOperation<T, THelpers>;

export type TSubscription<T extends Resource = any> = ManifestSubscription<
  T,
  THelpers
>;
