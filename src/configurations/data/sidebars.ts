const defaultData = ({ env }) => ({
  appConfigurations: [
    {
      guid: "9500b584-fa8a-4a3c-1111-92f2221db78b",
      caption: "Default menu",
      kind: 3,
      definition: [
        {
          label: { cs: "Domů", en: "Home" },
          to: "/",
          icon: "IoMdHome",
        },
        {
          label: { cs: "Úkoly", en: "Tasks" },
          icon: "FaTasks",
          children: [
            {
              label: { cs: "Všechny", en: "All" },
              to: "/tasks",
            },
            {
              label: { cs: "Moje", en: "My tasks" },
              to: "/tasks",
              filter: { assignee: "$user" },
            },
            {
              label: { cs: "Nové úkoly", en: "New tasks" },
              to: "/tasks",
              filter: { status: "New" },
            },
            {
              label: { cs: "K pozornosti", en: "Attention" },
              to: "/tasks",
              filter: { attn: "$user" },
            },
          ],
        },
        {
          label: { cs: "Příklady", en: "Examples" },
          to: "/examples",
          icon: "FaRegFileAlt",
        },
        {
          label: { cs: "Test", en: "Test" },
          to: "/entity/tasks",
          icon: "IoMdHome",
        },
      ],
    },
  ],
});

export default defaultData;
