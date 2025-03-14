import { MAIN_ID, MAIN_GUID } from "../knex";
import _ from "lodash";
import { EntitySchema, Rule } from "./types";
import { Knex } from "knex";
import { dbType } from "./sql";
import { User } from "../auth";

type SelectEntityType = {
  entity: string;
  fieldsArr: (string | undefined)[];
  where?: Record<string, string | string[] | number | number[] | undefined>;
  queries?: Record<string, SelectEntityType>;
  nJoin?: string;
  nJoinDirection?: boolean;
  onlyIds?: boolean;
  orderBy?: string[];
  user: User;
};

export const whereQueries = ({
  schema,
  entity,
  where,
  user,
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

          //f = f + ".id";
          if (typeof where[f] == "string") {
            const newf = f + ".guid"; // Davam guid protoze pro where je to potreba pokud se pouzije naprikld attn="9500b584-fa8a-4a3c-8f94-92f2221db78b"
            where[newf] = where[f];
            delete where[f];
            f = newf;
          }
          if (exitsOthers == 1) {
            onlyIds = true;
          }
        }
      }

      const isLink =
        f &&
        modelFields.fields &&
        modelFields.fields[f] &&
        modelFields.fields[f].link &&
        !modelFields.fields[f].nlinkTable;

      if (f && f.indexOf(".") == -1 && isLink) {
        const newF = f + ".guid";
        where[newF] = where[f];
        delete where[f];
        f = newF;
      }

      if (f && f.indexOf(".") > -1) {
        let fSplit = f.split(".");
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
            user,
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
  return { entity, fieldsArr: ["id"], where, queries, user };
};

export const getQueries = ({
  schema,
  entity,
  fieldsArr,
  where,
  user,
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
          !!modelFields.fields[f].nlinkTable;
        const isLink =
          f &&
          modelFields.fields &&
          modelFields.fields[f] &&
          modelFields.fields[f].link &&
          !modelFields.fields[f].nlinkTable;
        // pokud to je Nlink a nema tecku budu posilat id
        if (!onlyIds) {
          if (f && f.indexOf(".") == -1 && isNlink) {
            const exitsOthers = fieldsArr.reduce((acc, word) => {
              return acc + (word && word?.indexOf(f || "-1") > -1 ? 1 : 0);
            }, 0);

            f = f + ".guid";
            if (exitsOthers == 1) {
              onlyIds = true;
            }
          }
        }
        if ((f && f.indexOf(".") > -1) || isLink) {
          const fSplit = f && f.indexOf(".") == -1 ? [f, "guid"] : f.split(".");
          const field = fSplit[0];
          const fieldNext = fSplit.shift();
          if (
            fieldNext &&
            modelFields.fields &&
            modelFields.fields[field].link
          ) {
            const isNlink = !!modelFields.fields[field].nlinkTable;
            const relTable = modelFields.fields[field].link;

            var qs = getQueries({
              schema,
              entity: relTable,
              fieldsArr: [fSplit.join(".")],
              user,
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
    return { entity, fieldsArr: fieldsArrSel, where, queries, user };
  } else {
    return { entity, fieldsArr, where, user };
  }
};

export const addWhere = async ({
  db,
  query,
  entity,
  schema,
  where,
  user,
}: {
  db: dbType;
  query: Knex.QueryBuilder;
  entity: string;
  schema: EntitySchema;
  where:
    | Record<string, string | number | string[] | number[] | undefined>
    | undefined;

  user: User;
}) => {
  const mainWhere: Record<string, any> = {};
  if (where && Object.keys(where).length > 0) {
    const joinQueries = whereQueries({
      schema,
      entity,
      fieldsArr: [],
      where: where,
      user,
    });

    for (let field in where) {
      let val;
      // const isLink =
      //   schema[entity].fields[field].link &&
      //   !schema[entity].fields[field].nlinkTable;

      // if (
      //   field.indexOf(".") == -1 &&
      //   isLink &&
      //   typeof where[field] === "string"
      // ) {
      //   debugger;
      //   field = field + ".guid";
      // }
      if (field.indexOf(".") > -1) {
        const fieldWhere = field.split(".")[0];
        const fieldsArr = field.split(".");
        const query = joinQueries.queries[fieldsArr[0]];
        //TODO: umi pouze jednu uroven createdby.fullname neumi uroven createdby.owner.fullname
        let d;
        if (schema[entity].fields[fieldWhere].nlinkTable) {
          const dd = await getData({
            db,
            schema,
            entity: query.entity,
            fieldsArr: query.fieldsArr,
            where: query.where,
            user,
          });

          d = await getData({
            db,
            schema,
            entity: query.entity,
            fieldsArr: query.fieldsArr,
            where: { id: dd.map((d) => d.id) },
            nJoin: query.nJoin,
            nJoinDirection: true,
            user,
          });

          delete where[field];
          where["id"] = d.map((d) => d.source);
          field = "id";
        } else {
          d = await getData({
            db,
            schema,
            entity: query.entity,
            fieldsArr: query.fieldsArr,
            where: query.where,
            user,
          });

          delete where[field];
          where[fieldWhere] = d.map((d) => d.id);
          field = fieldWhere;
        }
      }
      try {
        val = JSON.parse(where[field] as any);
      } catch {
        val = where[field];
      }

      if (where[field] == "$user" && field == "guid") {
        // delete where[field];
        mainWhere["id"] = user.id;
      } else {
        mainWhere[field] = val;
      }

      // if (Array.isArray(val)) {
      //   query = query.whereIn(field, val);
      // } else {
      //   query = query.where(field, val);
      // }
    }
  }

  //
  const permissionsFilters = getPermissionsSelect({
    user: (query as any)._user,
    entity,
    schema,
  });

  if (permissionsFilters.length > 0) {
    const conditions = permissionsFilters.map((pf) => {
      return { ...mainWhere, ...pf };
    });
    addWhereToQuery({ query, conditions });
  } else {
    addWhereToQuery({ query, conditions: [mainWhere] });
  }
};

const addPermissionsFilter = ({ rule, user }: { rule: Rule; user?: User }) => {
  const filter = { ...rule.filter };
  const filterKeys = _.keys(filter);
  if (filterKeys.length == 0) {
    return true;
  } else {
    filterKeys.map((fk: any) => {
      if (filter[fk] == "$user" && user) {
        filter[fk] = user.id;
      }
    });
    return filter;
  }
};

const getPermissionsSelect = ({
  entity,
  user,
  schema,
}: {
  user?: User;
  entity: string;
  schema: EntitySchema;
}) => {
  let permissionsFilters: Record<string, any>[] = [];
  if ((user && user.id !== 1) || !user) {
    if (schema[entity].permissions?.get) {
      const rules = [...(schema[entity].permissions?.get?.rules || [])];

      for (let rule of rules) {
        if (rule.type == "role" && user) {
          if (_.intersection(rule.roles, user.roles).length > 0) {
            const pf = addPermissionsFilter({
              rule,
              user,
            });
            if (pf === true) {
              permissionsFilters = [];
              break;
            }
            permissionsFilters.push(pf);
          }
        }
        if (rule.type == "field") {
          const pf = addPermissionsFilter({
            rule,
            user,
          });
          if (pf === true) {
            permissionsFilters = [];
            break;
          }
          permissionsFilters.push(pf);
        }
      }
      //
    }
  }

  return permissionsFilters;
};

const addWhereToQuery = ({ query, conditions }: any) => {
  // Projdeme každou položku v poli `conditions`
  conditions?.forEach((condition: any, index: number) => {
    // První podmínku přidáme pomocí `where`, aby se započala správná struktura dotazu
    if (index === 0) {
      query.where((builder: any) => {
        // Projdeme všechny klíče a hodnoty v podmínce
        Object.entries(condition).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // Použijeme `whereIn` pro hodnoty typu pole
            builder.whereIn(key, value);
          } else {
            // Použijeme `where` pro jednotlivé hodnoty
            builder.where(key, value);
          }
        });
      });
    } else {
      // Další podmínky přidáme pomocí `orWhere`
      query.orWhere((builder: any) => {
        Object.entries(condition).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            builder.whereIn(key, value);
          } else {
            builder.where(key, value);
          }
        });
      });
    }
  });
};

export const getData = async ({
  db,
  schema,
  entity,
  fieldsArr,
  queries,
  where,
  nJoin,
  nJoinDirection,
  orderBy,
  user,
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

    if (nJoinDirection) {
      query = db(nJoin)
        .select(nJoin + ".source")
        .whereIn(nJoin + ".target", where ? (where.id as any) : [-1]);
    } else {
      const fieldsArrJoin = fieldsArr.map((f) => entity + "." + f);
      fieldsArrJoin.push(nJoin + ".source");
      query = db(entity)
        .select(fieldsArrJoin)
        .innerJoin(nJoin, entity + ".id", nJoin + ".target")
        .whereIn(nJoin + ".source", where ? (where.id as any) : [-1]);
    }
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
      user,
    });
  }

  let data: any[] = await query;

  if (queries && Object.keys(queries).length > 0) {
    for (const field in queries) {
      const query = queries[field];
      const ids = data
        .map((d) => {
          return query.nJoin ? d[MAIN_ID] : d[field];
        })
        .filter((id) => id);

      if (ids.length > 0) {
        const joindata = await getData({
          db,
          schema,
          entity: query.entity,
          fieldsArr: [MAIN_ID, MAIN_GUID, ...query.fieldsArr],
          queries: query.queries,
          where: { id: ids },
          nJoin: query.nJoin,
          user,
        });
        if (query.nJoin) {
          data = data.map((d) => {
            const jd = joindata
              .filter((j) => j.source == d[MAIN_ID])
              .map((j) => {
                delete j.source;
                // pokud se nechteji zadana dalsi data posilam jen pole id aby nlink fungoval stejne jako link
                if (query.onlyIds) {
                  // return j.id;
                  return j[MAIN_GUID];
                }
                delete j[MAIN_ID];
                return j;
              });

            return {
              ...d,
              [field]: jd.length > 0 ? jd : undefined, //pokud je pole prazdne neposilam ho
            };
          });
        } else {
          const byIds = _.keyBy(joindata, MAIN_ID);

          // Odebrání `MAIN_ID` a případný převod na hodnotu, pokud zůstane jen jeden atribut
          const result = _.mapValues(byIds, (obj) => {
            // const newObj = _.omit(obj, MAIN_ID); // Odebere `MAIN_ID`
            delete obj[MAIN_ID];
            return Object.keys(obj).length === 1 ? Object.values(obj)[0] : obj; // Převod na hodnotu, pokud je jen jeden klíč
          });

          data = data.map((d) => ({
            ...d,
            [field]: result[d[field]],
          }));
        }
      }
    }
  }

  return data;
};
