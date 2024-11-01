import { MAIN_ID, MAIN_GUID } from "../knex";
import _ from "lodash";
import { EntitySchema } from "./types";
import { Knex } from "knex";
import { dbType } from "./sql";

type SelectEntityType = {
  entity: string;
  fieldsArr: (string | undefined)[];
  where?: Record<string, string | string[] | number | number[] | undefined>;
  queries?: Record<string, SelectEntityType>;
  nJoin?: string;
  onlyIds?: boolean;
  orderBy?: string[];
};

export const whereQueries = ({
  schema,
  entity,
  where,
}: SelectEntityType & { schema: EntitySchema }) => {
  const modelFields = schema[entity];
  if (!modelFields) {
    throw new Error(`Entity ${entity} not found in Metamodel`);
  }
  const queries: Record<string, SelectEntityType> = {};

  const fieldsArr = Object.keys(where || {});
  let fieldsArrSel = fieldsArr
    .map((f) => {
      let onlyIds = false;

      const isNlink =
        f &&
        modelFields.fields &&
        modelFields.fields[f] &&
        modelFields.fields[f].type &&
        modelFields.fields[f].type.indexOf("nlink(") > -1;
      // pokud to je Nlink a nema tecku budu posilat id
      if (!onlyIds) {
        if (f && f.indexOf(".") == -1 && isNlink) {
          const exitsOthers = fieldsArr.reduce((acc, word) => {
            return acc + (word && word?.indexOf(f || "-1") > -1 ? 1 : 0);
          }, 0);

          f = f + ".id";
          if (exitsOthers == 1) {
            onlyIds = true;
          }
        }
      }
      if (f && f.indexOf(".") > -1) {
        const fSplit = f.split(".");
        const field = fSplit[0];
        const fieldNext = fSplit.shift();
        if (
          fieldNext &&
          modelFields.fields &&
          modelFields.fields[field].type.indexOf("link(") > -1
        ) {
          //
          const isNlink = modelFields.fields[field].type.indexOf("nlink(") > -1;
          const relTable = modelFields.fields[field].type.replace(
            /.*link\((\w+)\)/,
            "$1"
          );

          var qs = whereQueries({
            schema,
            entity: relTable,
            fieldsArr: ["id"],
            where: { [fSplit.join(".")]: where ? where[f] : undefined },
          });
          //
          if (queries[field]) {
            // queries[field].fieldsArr = queries[field].fieldsArr.concat(
            //   qs.fieldsArr
            // );
            queries[field].fieldsArr = ["id"];

            const qsTmp = queries[field].queries;
            if (qsTmp && Object.keys(qsTmp).length == 0) {
              queries[field].queries = qs.queries;
            } else {
              //TODO: dodelat
              _.mergeWith(
                queries[field].queries,
                qs.queries,
                (objValue, srcValue) => {
                  if (_.isArray(objValue)) {
                    // Pokud jde o pole, spojíme ho místo nahrazení
                    return objValue.concat(srcValue);
                  }
                }
              );
            }
          } else {
            if (isNlink) {
              const nJoin = entity + "2" + relTable + "4" + field;
              queries[field] = { ...qs, nJoin, onlyIds };
            } else {
              queries[field] = { ...qs };
            }
          }

          if (!isNlink) {
            return field;
          }
        } else {
          throw new Error(`Field ${field} is not relation`);
        }
      } else {
        if (f && modelFields.fields[f]) {
          return f;
        } else {
          throw new Error(`Field ${f} not exits in ${entity} not exists`);
        }
      }
    })
    .filter((f) => f);
  // odfiltruju nlinky
  // fieldsArrSel = _.uniq(fieldsArrSel);
  return { entity, fieldsArr: ["id"], where, queries };
};

export const getQueries = ({
  schema,
  entity,
  fieldsArr,
  where,
}: SelectEntityType & { schema: EntitySchema }) => {
  if (fieldsArr && fieldsArr[0] !== "*") {
    const modelFields = schema[entity];
    if (!modelFields) {
      throw new Error(`Entity ${entity} not found in Metamodel`);
    }
    const queries: Record<string, SelectEntityType> = {};

    let fieldsArrSel = fieldsArr
      .map((f) => {
        let onlyIds = false;
        const isNlink =
          f &&
          modelFields.fields &&
          modelFields.fields[f] &&
          modelFields.fields[f].type.indexOf("nlink(") > -1;
        // pokud to je Nlink a nema tecku budu posilat id
        if (!onlyIds) {
          if (f && f.indexOf(".") == -1 && isNlink) {
            const exitsOthers = fieldsArr.reduce((acc, word) => {
              return acc + (word && word?.indexOf(f || "-1") > -1 ? 1 : 0);
            }, 0);

            f = f + ".id";
            if (exitsOthers == 1) {
              onlyIds = true;
            }
          }
        }
        if (f && f.indexOf(".") > -1) {
          const fSplit = f.split(".");
          const field = fSplit[0];
          const fieldNext = fSplit.shift();
          if (
            fieldNext &&
            modelFields.fields &&
            modelFields.fields[field].type.indexOf("link(") > -1
          ) {
            //
            const isNlink =
              modelFields.fields[field].type.indexOf("nlink(") > -1;
            const relTable = modelFields.fields[field].type.replace(
              /.*link\((\w+)\)/,
              "$1"
            );

            var qs = getQueries({
              schema,
              entity: relTable,
              fieldsArr: [fSplit.join(".")],
            });
            //
            if (queries[field]) {
              queries[field].fieldsArr = queries[field].fieldsArr.concat(
                qs.fieldsArr
              );
              const qsTmp = queries[field].queries;
              if (qsTmp && Object.keys(qsTmp).length == 0) {
                queries[field].queries = qs.queries;
              } else {
                //TODO: dodelat
                _.mergeWith(
                  queries[field].queries,
                  qs.queries,
                  (objValue, srcValue) => {
                    if (_.isArray(objValue)) {
                      // Pokud jde o pole, spojíme ho místo nahrazení
                      return objValue.concat(srcValue);
                    }
                  }
                );
              }
            } else {
              if (isNlink) {
                const nJoin = entity + "2" + relTable + "4" + field;
                queries[field] = { ...qs, nJoin, onlyIds };
              } else {
                queries[field] = { ...qs };
              }
            }

            if (!isNlink) {
              return field;
            }
          } else {
            throw new Error(`Field ${field} is not relation`);
          }
        } else {
          if (f && modelFields.fields[f]) {
            return f;
          } else {
            throw new Error(`Field ${f} not exits in ${entity} not exists`);
          }
        }
      })
      .filter((f) => f);
    // odfiltruju nlinky
    fieldsArrSel = _.uniq(fieldsArrSel);
    return { entity, fieldsArr: fieldsArrSel, where, queries };
  } else {
    return { entity, fieldsArr, where };
  }
};

export const addWhere = async ({
  db,
  query,
  entity,
  schema,
  where,
}: {
  db: dbType;
  query: Knex.QueryBuilder;
  entity: string;
  schema: EntitySchema;
  where:
    | Record<string, string | number | string[] | number[] | undefined>
    | undefined;
}) => {
  if (where && Object.keys(where).length > 0) {
    const joinQueries = whereQueries({
      schema,
      entity,
      fieldsArr: [],
      where: where,
    });

    for (let field in where) {
      let val;
      if (field.indexOf(".") > -1) {
        const fieldWhere = field.split(".")[0];
        const fieldsArr = field.split(".");
        const query = joinQueries.queries[fieldsArr[0]];
        //TODO: umi pouze jednu uroven createdby.fullname neumi uroven createdby.owner.fullname
        const d = await getData({
          db,
          schema,
          entity: query.entity,
          fieldsArr: query.fieldsArr,
          where: query.where,
        });

        delete where[field];
        where[fieldWhere] = d.map((d) => d.id);
        field = fieldWhere;
      }
      try {
        val = JSON.parse(where[field] as any);
      } catch {
        val = where[field];
      }
      if (Array.isArray(val)) {
        query = query.whereIn(field, val);
      } else {
        query = query.where(field, val);
      }
    }
  }
};
export const getData = async ({
  db,
  schema,
  entity,
  fieldsArr,
  queries,
  where,
  nJoin,
  orderBy,
}: SelectEntityType & {
  db: dbType;
  schema: EntitySchema;
}) => {
  let query: Knex.QueryBuilder;

  // let query: Knex.QueryBuilder<
  //   {},
  //   DeferredKeySelection<
  //     {},
  //     never,
  //     true,
  //     (string | undefined)[],
  //     false,
  //     {},
  //     never
  //   >[]
  // >;
  if (nJoin) {
    // provedu join s vazebni tabulkou

    const fieldsArrJoin = fieldsArr.map((f) => entity + "." + f);
    fieldsArrJoin.push(nJoin + ".source");
    query = db(entity)
      .select(fieldsArrJoin)
      .innerJoin(nJoin, entity + ".id", nJoin + ".target")
      .whereIn(nJoin + ".source", where ? (where.id as any) : [-1]);
  } else {
    query = db(entity).select(fieldsArr);

    if (orderBy) {
      orderBy.map((o) => {
        if (o.indexOf("-") > -1) {
          query.orderBy(o.replace("-", ""), "desc");
        } else {
          query.orderBy(o, "asc");
        }
      });
    }
    // Pridam WHERE
    await addWhere({
      db,
      query,
      entity,
      schema,
      where,
    });
  }

  let data: any[] = await query;

  if (queries && Object.keys(queries).length > 0) {
    for (const field in queries) {
      const query = queries[field];
      const ids = data.map((d) => {
        return query.nJoin ? d.id : d[field];
      });

      const joindata = await getData({
        db,
        schema,
        entity: query.entity,
        fieldsArr: [MAIN_ID, ...query.fieldsArr],
        queries: query.queries,
        where: { id: ids },
        nJoin: query.nJoin,
      });
      if (query.nJoin) {
        data = data.map((d) => {
          const jd = joindata
            .filter((j) => j.source == d.id)
            .map((j) => {
              delete j.source;
              // pokud se nechteji zadana dalsi data posilam jen pole id aby nlink fungoval stejne jako link
              if (query.onlyIds) {
                return j.id;
              }
              return j;
            });
          return {
            ...d,
            [field]: jd.length > 0 ? jd : undefined, //pokud je pole prazdne neposilam ho
          };
        });
      } else {
        const byIds = _.keyBy(joindata, MAIN_ID);
        data = data.map((d) => ({
          ...d,
          [field]: byIds[d[field]],
        }));
      }
    }
  }

  return data;
};
