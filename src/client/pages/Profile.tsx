import { Button, Spinner } from "flowbite-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Form from "../components/Form/Form";
import { useTranslation } from "react-i18next";

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="p-3">
      {/* <p>{t("home.description")}</p> */}
      <span>
        <button onClick={() => changeLanguage("en")}>English</button>
        {" | "}
        <button onClick={() => changeLanguage("cs")}>Čeština</button>
      </span>

      {/* <p>This page is accessible by anyone.</p>
      <Spinner aria-label="Default status example" />
      <WordTagInput />
      <Button className="">
        <Link to="/public">Dvojka home</Link>
      </Button> */}
      {/* <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-blue-500 p-4">Item 1 (2 columns)</div>
        <div className="col-span-1 bg-red-500 p-4">Item 2 (1 column)</div>
        <div className="col-span-1 bg-green-500 p-4">Item 3 (1 column)</div>
      </div> */}
      {/* <Form
        entity="tasks"
        formFields={[
          { field: "caption" },
          {
            type: "Section",
            columns: 2,
            fields: [
              { label: "Nazev", field: "caption" },
              { field: "description" },
            ],
          },
          { field: "description" },
        ]}
        onSubmit={({ data }) => {
          console.log("form 1", data);
        }}
      /> */}
      {/* <div>-----------------------------</div> */}
      {/* <Form
        entity="tasks"
        columns={2}
        formFields={["caption", "description"]}
        onSubmit={({ data }) => {
          console.log("form 1", data);
        }}
      />
      <div>-----------------------------</div> */}
      {/* <Form
        columns={2}
        formFields={[
          {
            type: "text",
            field: "text",
            label: "Text k",
            id: "kuk",
            // color: "success",
            // required: true,
            colSpan: 1,
            // rules: [
            //   {
            //     type: "required",
            //     conditions: [
            //       {
            //         field: "select",
            //         value: 1,
            //       },
            //     ],
            //   },
            // ],
          },
          {
            type: "text",
            field: "text2",
            label: "Text2",
            id: "kuk2",
            color: "success",
            colSpan: 1,
          },
          {
            type: "Section",
            label: "Jméno2",
            fields: [
              {
                type: "text",
                label: "Ulice",
                field: "street",
                colSpan: 1,
              },
              {
                type: "text",
                label: "Číslo",
                field: "street",
                colSpan: 1,
              },
            ],
          },
          {
            field: "users",
            label: "Users",
            type: "select",
            entity: "users",
          },
          {
            field: "select2",
            label: "Select2",
            type: "select",
            required: true,
            options: [
              { label: "test 12", value: 1 },
              { label: "test 22", value: 2 },
            ],
            rules: [
              {
                type: "show",
                conditions: [
                  {
                    select: 1,
                  },
                ],
              },
            ],
          },
          {
            field: "select",
            label: "Select",
            type: "select",
            options: [
              { label: "test 1", value: 1 },
              { label: "test 2", value: 2 },
            ],
          },
        ]}
        onSubmit={({ data }) => {
          console.log("kuk", data);
        }}
        data={formData}
      >
        <Button type="submit">SEND</Button>
      </Form> */}
      {/* <Button onClick={() => setFormData(undefined)}>resert</Button> */}
      {/* <div>------------</div> */}
      {/* <Select entity="users" /> */}
      {/* <div>------------</div> */}
    </div>
  );
};

export default Profile;
