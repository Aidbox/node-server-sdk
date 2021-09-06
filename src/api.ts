import { TClient } from "./client";

export type TApi = {
  createResource<T>(resourceType: string, data: Partial<T>): Promise<T>;
  patchResource<T>(resourceType: string, resourceId: string, data: Partial<T>): Promise<T>;
  getResource<T>(resourceType: string, resourceId: string): Promise<T>;
  findResources<T>(
    resourceType: string,
    params?: any
  ): Promise<{ resources: T[]; total: number }>;
};

export const createApi = (client: TClient): TApi => ({
  createResource: async (resourceType, data) => {
    const { data: resource } = await client.request({
      url: `/${resourceType}`,
      method: "POST",
      data,
    });
    return resource;
  },
  patchResource: async (resourceType, resourceId,  data) => {
    const { data: resource } = await client.request({
      url: `/${resourceType}/${resourceId}`,
      method: "PATCH",
      data,
    });
    return resource;
  },
  getResource: async (resourceType, resourceId) => {
    const { data: resource } = await client.request({
      url: `/${resourceType}/${resourceId}`,
    });
    return resource;
  },
  findResources: async (resourceType, params) => {
    const {
      data: { entry, total },
    } = await client.request<{ entry: { resource: any }[]; total: number }>({
      url: `/${resourceType}`,
      params,
    });
    return { resources: entry.map((e) => e.resource), total };
  },
});
