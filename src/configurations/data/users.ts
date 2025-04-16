const defaultData = ({ env }) => ({
  users: [
    {
      guid: "9500b584-fa8a-4a3c-8f94-92f2221db78b",
      caption: "admin",
      fullname: "admin",
      email: "admin@admin.cz",
      password: env.DEFAULT_PASSWORD,
      createdby: 1,
      updatedby: 1,
      kind: 1,
    },
    {
      guid: "1500b584-fa8a-4a3c-8fa4-92f2221db78b",
      caption: "user",
      fullname: "user",
      email: "user@user.cz",
      password: env.DEFAULT_PASSWORD,
      createdby: 1,
      updatedby: 1,
      kind: 1,
    },
  ],
});

const updateData = {
  users: [
    {
      guid: "9500b584-fa8a-4a3c-8f94-92f2221db78b",
      roles: ["9500b584-fa8a-4a3c-8f91-92f2221db78b"],
    },
  ],
};

export { updateData };
export default defaultData;
