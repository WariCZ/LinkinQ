import * as readline from "readline";

const cl = readline.createInterface(process.stdin, process.stdout);
const question = function (q: any) {
  return new Promise((res, rej) => {
    cl.question(q, (answer) => {
      res(answer);
    });
  });
};
async function delay(time: any, result: any) {
  console.log("delaying ... " + time);
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log("delayed is done.");
      resolve(result);
    }, time);
  });
}

var seq = 0;
class AppServices {
  appDelegate;
  constructor(delegate: any) {
    this.appDelegate = delegate;
  }
  async echo(input: any, context: any) {
    console.log("service echo - input", input);
    context.item.data["echo"] = input;
    return input;
  }
  /**
   * Sample Code for Leave Application
   * to demonstrate how to access DB and return results into scripts
   * This is called as such:
   *  	assignee	#(appServices.getSupervisorUser(this.data.requester))
   *
   * @param userName
   * @param context
   * @returns
   */
  async getSupervisorUser(userName: any, context: any) {
    console.log("getSupervisorUser for:", userName);

    let ds = this.appDelegate.server.dataStore;
    const dburl = ds.dbConfiguration.db; // process.env.MONGO_DB_URL;

    const db = ds.dataStore.db;

    // collection structure: {employee,manager}

    let list = await db.find(dburl, "usersManager", { employee: userName });
    let manager;
    if (list.length > 0) manager = list[0]["manager"];

    return manager;
  }
  async promptUser(input: any, context: any) {
    console.log("executing prompt user");

    var result = await question("continue?");
    console.log("result:", result);
    return null;
  }
  async serviceTask(input: any, context: any) {
    let item = context.item;
    console.log(" Hi this is the serviceTask from appDelegate");
    console.log(item.elementId);
    await delay(5000, "test");
    console.log(" Hi this is the serviceTask from appDelegate says bye");
  }
  async simulateCrash(input: any, context: any) {
    let item = context.item;
    let data = item.token.data;
    if (data["crash"] == "Yes") {
      data["crash"] = "No";
      await item.token.execution.save();
      console.log("Will Crash now", item.token.data);
      process.exit(100);
    } else console.log("no crash");
  }
  async add({ v1, v2 }: any) {
    console.log("Add Service", v1, v2);

    return Number(v1) + Number(v2);
  }
  async service99() {
    console.log(">>>>>>>>>>appDelegate service99");
  }
  async notifyhead() {
    console.log(">>>>>>>>>>appDelegate notifyhead");
  }
  async service1(input: any, context: any) {
    let item = context.item;
    let wait = 5000;
    if (input.wait) wait = input.wait;
    item.vars = input;
    seq++;
    await delay(wait, "test");
    item.token.log(
      "SERVICE 1: input: " +
        JSON.stringify(input) +
        item.token.currentNode.id +
        " current seq: " +
        seq
    );

    console.log(
      "appDelegate service1 is now complete input:",
      input,
      "output:",
      seq,
      "item.data",
      item.data
    );
    return { seq, text: "test" };
  }
  async DummyService1(input: any, context: any) {
    context.item.data.service1Result = "Service1Exec";
  }

  async DummyService2(input: any, context: any) {
    await delay(126000, "2.1mins"); // Wait for 2.1 mins
    context.item.data.service2Result = "Service2Exec";
  }
  async raiseBPMNError(input: any, context: any) {
    return { bpmnError: " Something went wrong" };
  }
}
export { AppServices };