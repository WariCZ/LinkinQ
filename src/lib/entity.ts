import express, { Request, Response } from "express";
import axios from "axios";
import { db, MAIN_ID } from "./knex";
import { apiError } from "./logger";
import _ from "lodash";

const router = express.Router();

type SelectEntityType = {
  entity: string;
  fieldsArr: (string | undefined)[];
  where?: Record<string, string | string[] | number | number[] | undefined>;
  queries?: Record<string, SelectEntityType>;
  nJoin?: string;
  onlyIds?: boolean;
};

const whereQueries = ({ entity, where }: SelectEntityType) => {
  const modelFields = global.prodigi.entityModel[entity];
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

const getQueries = ({ entity, fieldsArr, where }: SelectEntityType) => {
  if (fieldsArr[0] !== "*") {
    const modelFields: any = global.prodigi.entityModel[entity];
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

const getData = async ({
  entity,
  fieldsArr,
  queries,
  where,
  nJoin,
}: SelectEntityType) => {
  let query;
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

    // Pridam WHERE
    if (where && Object.keys(where).length > 0) {
      const joinQueries = whereQueries({
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
  }

  let data = await query;

  if (queries && Object.keys(queries).length > 0) {
    for (const field in queries) {
      const query = queries[field];
      const ids = data.map((d) => {
        return query.nJoin ? d.id : d[field];
      });

      const joindata = await getData({
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

router.get("/:entity", async (req: Request, res: Response) => {
  try {
    if (req.user) {
      var entity = req.params.entity;
      if (entity) {
        if (await db.schema.hasTable(entity)) {
          try {
            // res.json({
            //   message: "This is a protected route sdawdwa",
            //   user: req.user,
            //   entity: req.params.entity,
            //   query: req.query,
            // });
            const fields = (req.query.__fields || "*") as string;

            console.log("fieldsArr", fields.split(","));
            console.log(
              "where",
              _.omit(req.query as any, ["entity", "__fields"])
            );
            const queries = getQueries({
              entity,
              fieldsArr: fields.split(","),
              where: _.omit(req.query as any, ["entity", "__fields"]),
            });
            console.log("queries", queries);
            const data = await getData(queries);

            console.log("data", data);
            return res.json(data);
          } catch (e: any) {
            console.error(e);
            //TODO: Stalo by za uvahu nejakym zpusobem chybu omezit aby se neposilala chyba takto detailne
            return apiError({ res, error: e.message });
          }
        } else {
          apiError({ res, error: `Entity ${entity} not exists` });
        }
      } else {
        apiError({ res, error: `Entity not found` });
      }
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    res.status(500).send("Error fetching data from external API");
  }
});

export default router;
