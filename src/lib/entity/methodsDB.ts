import { MAIN_ID, MAIN_GUID, MAIN_TABLE_ALIAS } from "../knex";
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
  groupBy?: string[];
  user: User;
  limit?: number;
  offset?: number;
  structure?: "topdown";
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

      // remove operators
      f = f.replace(/\$(\w+);(\w+)/gm, "$2");

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
        !modelFields.fields[f].nlinkTable &&
        !modelFields.fields[f].lov;

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
        if ((f && f.indexOf(".") > -1) || (isLink && f !== "kind")) {
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
  knex,
  query,
  entity,
  schema,
  where,
  user,
}: {
  db: dbType;
  knex: Knex;
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

      if (field.indexOf(".") > -1) {
        const fieldWhere = field.split(".")[0];
        const fieldsArr = field.split(".");
        const query = joinQueries.queries[fieldsArr[0]];
        //TODO: umi pouze jednu uroven createdby.fullname neumi uroven createdby.owner.fullname
        let d;
        if (schema[entity].fields[fieldWhere].nlinkTable) {
          const dd = await getData({
            db,
            knex,
            schema,
            entity: query.entity,
            fieldsArr: query.fieldsArr,
            where: query.where,
            user,
          });

          d = await getData({
            db,
            knex,
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
            knex,
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

const addWhereCondition = ({ condition, builder }) => {
  Object.entries(condition).forEach(([key, value]) => {
    let operator;
    if (key.match(/(\$\w+;)(\w+)/gm)) {
      operator = key.replace(/(\$\w+;)(\w+)/gm, "$1");
      key = key.replace(/(\$\w+;)(\w+)/gm, "$2");
    }

    if (operator) {
      if (operator == "$neq;") {
        if (Array.isArray(value)) {
          builder.whereNotIn(`${MAIN_TABLE_ALIAS}.${key}`, value);
        } else {
          builder.whereNot(`${MAIN_TABLE_ALIAS}.${key}`, value);
        }
      } else if (operator == "$lk;") {
        if (Array.isArray(value)) {
          throw `${operator} is not supported for array`;
        } else {
          builder.where(`${MAIN_TABLE_ALIAS}.${key}`, "like", `%${value}%`);
        }
      } else if (operator == "$gt;") {
        if (Array.isArray(value)) {
          throw `${operator} is not supported for array`;
        } else {
          builder.where(`${MAIN_TABLE_ALIAS}.${key}`, ">", value);
        }
      } else if (operator == "$gte;") {
        if (Array.isArray(value)) {
          throw `${operator} is not supported for array`;
        } else {
          builder.where(`${MAIN_TABLE_ALIAS}.${key}`, ">=", value);
        }
      } else if (operator == "$lt;") {
        if (Array.isArray(value)) {
          throw `${operator} is not supported for array`;
        } else {
          builder.where(`${MAIN_TABLE_ALIAS}.${key}`, "<", value);
        }
      } else if (operator == "$lte;") {
        if (Array.isArray(value)) {
          throw `${operator} is not supported for array`;
        } else {
          builder.where(`${MAIN_TABLE_ALIAS}.${key}`, "<=", value);
        }
      } else if (operator == "$eq;") {
        if (Array.isArray(value)) {
          builder.whereIn(`${MAIN_TABLE_ALIAS}.${key}`, value);
        } else {
          builder.where(`${MAIN_TABLE_ALIAS}.${key}`, value);
        }
      } else {
        throw `${operator} is not supported`;
      }
    } else {
      if (Array.isArray(value)) {
        builder.whereIn(`${MAIN_TABLE_ALIAS}.${key}`, value);
      } else {
        builder.where(`${MAIN_TABLE_ALIAS}.${key}`, value);
      }
    }
  });
};
const addWhereToQuery = ({ query, conditions }: any) => {
  conditions?.forEach((condition: any, index: number) => {
    if (index === 0) {
      query.where((builder: any) => {
        addWhereCondition({ builder, condition });
      });
    } else {
      query.orWhere((builder: any) => {
        addWhereCondition({ builder, condition });
      });
    }
  });
};

const getOrder = ({
  schema,
  query,
  orderField,
  entity,
  i,
}: {
  schema: EntitySchema;
  query: Knex.QueryBuilder<any, any>;
  orderField: string;
  entity: string;
  i: number;
}) => {
  let isDesc = false;
  if (orderField.indexOf("-") > -1) {
    isDesc = true;
    orderField = orderField.replace("-", "");
  }

  if (orderField.indexOf(".") > -1) {
    const modelFields = schema[entity];
    let oSplit = orderField.split(".");
    const field = oSplit[0];
    oSplit.shift();

    const isNlink =
      field &&
      modelFields.fields &&
      modelFields.fields[field] &&
      modelFields.fields[field].type &&
      modelFields.fields[field].type.indexOf("nlink(") > -1;
    if (isNlink) {
      throw "orderby with type nlink is not supported";
    }
    const fieldType = modelFields.fields[field];

    const alias = `order_${orderField.replace(/\./g, "_")}_${i}`;

    // query.join(`users as order`, `t.createdby`, `order.id`);
    // query.orderBy("u.fullname", isDesc ? "desc" : "asc");

    query.join(
      `${fieldType.link} as ${alias}`,
      `${MAIN_TABLE_ALIAS}.${field}`,
      `${alias}.id`
    );

    if (oSplit.length > 1) {
      getOrder({
        schema,
        query,
        entity: fieldType.link,
        orderField: oSplit.join("."),
        i,
      });
    } else {
      query.orderBy(`${alias}.${oSplit[0]}`, isDesc ? "desc" : "asc");
    }
  } else {
    query.orderBy(`${MAIN_TABLE_ALIAS}.${orderField}`, isDesc ? "desc" : "asc");
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
  nJoinDirection,
  orderBy,
  groupBy,
  user,
  limit,
  offset,
  structure,
  knex,
}: SelectEntityType & { knex: Knex; db: dbType; schema: EntitySchema }) => {
  let query: Knex.QueryBuilder;

  //
  if (nJoin) {
    // provedu join s vazebni tabulkou
    if (nJoinDirection) {
      query = db(nJoin)
        .select(nJoin + ".source")
        .whereIn(nJoin + ".target", where ? (where.id as any) : [-1]);
    } else {
      const fieldsArrJoin = fieldsArr.map((f) => MAIN_TABLE_ALIAS + "." + f);
      fieldsArrJoin.push(nJoin + ".source");
      query = db(entity)
        .select(fieldsArrJoin)
        .innerJoin(nJoin, MAIN_TABLE_ALIAS + ".id", nJoin + ".target")
        .whereIn(nJoin + ".source", where ? (where.id as any) : [-1]);
    }
  } else {
    query = db(entity).select(fieldsArr.map((f) => `${MAIN_TABLE_ALIAS}.${f}`));

    if (orderBy) {
      orderBy.map((o, i) => {
        getOrder({
          entity,
          orderField: o,
          query,
          schema,
          i,
        });
      });
    }

    if (groupBy) {
      groupBy.map((o, i) => {
        getOrder({
          entity,
          orderField: o,
          query,
          schema,
          i,
        });
      });
      // query.select(groupFields);
    }

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    // Pridam WHERE
    await addWhere({
      db,
      knex,
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
          knex,
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

  if (groupBy) {
    const groupedData = buildGroupBy(data, groupBy);
    return groupedData;
  }

  if (structure) {
    const ids = data.map((d) => d.id);

    const treeList = await knex
      .setUser({ id: 1 })
      .withRecursive("alias_tree", (cte) => {
        // ROOT: najdi všechny tasky bez parenta, ale v daném projektu
        cte
          .setUser({ id: 1 })
          .select("id", "parent", knex.raw("1 as depth").setUser({ id: 1 }))
          .from("tasks")
          .whereIn("id", ids)
          .whereNull("parent")

          // REKURZE: najdi childy k uzlům ze stromu
          .unionAll(function () {
            this.select(
              "t.id",
              "t.parent",
              knex.raw("alias_tree.depth + 1").setUser({ id: 1 })
            )
              .from("tasks as t")
              .join("alias_tree", "t.parent", "alias_tree.id");
          });
      })
      .select("*")
      .from("alias_tree")
      .orderBy("depth", "asc");

    const treeData = buildTree(treeList, data);

    return treeData;
  }

  return data;
};

function buildTree(tree, fullData) {
  const idToDataMap = new Map(fullData.map((item) => [item.id, item]));
  const idToNode = new Map();

  const roots = [];

  for (const { id, parent } of tree) {
    const data: any = idToDataMap.get(id);

    if (!data) continue; // ochrana: pokud chybí fullData, přeskočíme

    const node = {
      ...data,
      childrenLength: 0,
      children: [],
    };

    idToNode.set(id, node);

    if (parent) {
      const parentData = idToNode.get(parent);
      if (parentData) {
        parentData.children.push(node);
        parentData.childrenLength += 1;
      } else {
        // fallback: orphan – uložíme ho později, nebo logujeme
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function buildGroupBy(data, groupFields) {
  const map = new Map();

  for (const item of data) {
    const key = groupFields
      .map((k) => {
        if (k.indexOf(".") > -1) {
          return _.get(item, k);
        } else {
          return item[k];
        }
      })
      .join("|");

    if (!map.has(key)) {
      const group = {
        key,
        children: [],
        count: 0,
      };

      // přidej jednotlivé klíče jako vlastní pole (např. name, id)
      for (const k of groupFields) {
        group[k] = item[k];
      }

      map.set(key, group);
    }

    const group = map.get(key);
    group.children.push(item);
    group.count += 1;
  }

  return Array.from(map.values());
}
