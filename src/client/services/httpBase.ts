import axios, { AxiosRequestConfig, Method } from "axios";
import _ from "lodash";

interface HttpRequestParams {
  method: Method;
  entity?: string;
  data?: Record<string, any>;
  config?: AxiosRequestConfig;
  params?: Record<string, any>;
  url?: string;
}

export const httpRequest = ({
  method,
  entity,
  data,
  config,
  params,
  url,
}: HttpRequestParams) => {
  const urlParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : String(value)
        );
      }
    });
  }

  return axios.request({
    method,
    url: url ?? `/api/entity/${entity}`,
    data,
    params: urlParams,
    ...config,
  });
};

export const getSingleRecord = ({
  entity,
  guid,
  fields,
  filter,
}: {
  entity: string;
  guid: string;
  fields?: string;
  filter?: Record<string, any>;
}) =>
  httpRequest({
    method: "GET",
    entity,
    params: {
      guid,
      __fields: fields ?? "*",
      ...filter,
    },
  });

export const updateOrCreateRecord = ({
  entity,
  data,
}: {
  entity: string;
  data: any;
}) => {
  const { guid, id, ...cleanData } = data;

  if (guid) {
    return httpRequest({
      entity,
      method: "PUT",
      data: { where: { guid }, data: cleanData },
    });
  }

  return httpRequest({
    entity,
    method: "POST",
    data: cleanData,
  });
};

export const deleteByGuid = ({
  entity,
  guid,
}: {
  entity: string;
  guid: string;
}) =>
  httpRequest({
    entity,
    method: "DELETE",
    data: { where: { guid } },
  });

export function idsValueInside(
  paramsFetch: Record<string, number[] | number>,
  params: Record<string, number[]>,
  MAIN_ID: string
): boolean {
  if (!paramsFetch || !params) return true;

  const fetchIds = paramsFetch[MAIN_ID];
  const allIds = params[MAIN_ID];

  if (!fetchIds || !allIds) return true;

  const fetchIdsArr = Array.isArray(fetchIds) ? fetchIds : [fetchIds];
  const intersection = fetchIdsArr.filter((id) => allIds.includes(id));

  return intersection.length === fetchIdsArr.length;
}
