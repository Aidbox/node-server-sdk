import { Api, Client } from "./types";

export const createApi = (client: Client): Api => ({
  createResource: async (resourceType, data) => {
    const { data: resource } = await client.request({
      url: `/${resourceType}`,
      method: "POST",
      data,
    });
    return resource;
  },
  patchResource: async (resourceType, resourceId, data) => {
    const { data: resource } = await client.request({
      url: `/${resourceType}/${resourceId}`,
      method: "PATCH",
      data,
    });
    return resource;
  },
  deleteResource: async (resourceType, resourceId) => {
    const { data: resource } = await client.request({
      url: `/${resourceType}/${resourceId}`,
      method: "DELETE",
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
    return { resources: entry?.map((e) => e.resource) || [], total };
  },
  createBundle: async (type, data) => {
    const { data: result } = await client.request({
      method: "POST",
      url: "/",
      data: {
        type,
        entry: data,
      },
    });
    return result;
  },
});

export const createFHIRApi = (client: Client): Api => ({
  createResource: async (resourceType, data) => {
    const { data: resource } = await client.request({
      url: `/fhir/${resourceType}`,
      method: "POST",
      data,
    });
    return resource;
  },
  patchResource: async (resourceType, resourceId, data) => {
    const { data: resource } = await client.request({
      url: `/fhir/${resourceType}/${resourceId}`,
      method: "PATCH",
      data,
    });
    return resource;
  },
  deleteResource: async (resourceType, resourceId) => {
    const { data: resource } = await client.request({
      url: `/fhir/${resourceType}/${resourceId}`,
      method: "DELETE",
    });
    return resource;
  },
  getResource: async (resourceType, resourceId) => {
    const { data: resource } = await client.request({
      url: `/fhir/${resourceType}/${resourceId}`,
    });
    return resource;
  },
  findResources: async (resourceType, params) => {
    const {
      data: { entry, total },
    } = await client.request<{ entry: { resource: any }[]; total: number }>({
      url: `/fhir/${resourceType}`,
      params,
    });
    return { resources: entry?.map((e) => e.resource) || [], total };
  },
  createBundle: async (type, data) => {
    const { data: result } = await client.request({
      method: "POST",
      url: "/fhir/",
      data: {
        type,
        entry: data,
      },
    });
    return result;
  },
});
