import { httpRequest } from "@/client/hooks/useDataDetail";
import React, { RefAttributes, useEffect, useState } from "react";
import ReactSelect, { Props as ReactSelectProps } from "react-select";
import AsyncSelect from "react-select/async";

const Select = React.forwardRef(
  (
    props: ReactSelectProps & { entity?: string; labelFields?: string },
    ref
  ) => {
    console.log("Select", props);
    const [options, setOptions] = useState([]);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [value, setValue] = useState(props.value);

    useEffect(() => {
      if (props.value) {
        fetchOptions(props.value as any).then((value: any) => {
          value && setValue(value.data);
        });
      }
    }, [props.value]);

    const fetchOptions = async ({ guid }: { guid?: string[] | string }) => {
      if (menuIsOpen) return;
      const res: any = await httpRequest({
        entity: props.entity,
        method: "GET",
        params: {
          ...(guid ? { guid: guid } : {}),
          __fields: ["guid", props.labelFields || "caption"].join(","),
        },
      });
      setMenuIsOpen(true);
      setOptions([
        ...res.data.map((item) => ({
          value: item.guid,
          label: item[props.labelFields || "caption"],
        })),
      ]);
      return res.data;
    };

    if (props.entity) {
      return (
        <AsyncSelect
          {...props}
          value={value}
          // ref={ref}
          cacheOptions
          onMenuOpen={() => {
            fetchOptions({});
          }}
          defaultOptions={options}
          classNamePrefix="flowbite-select"
          placeholder="Vyberte možnosti"
          onChange={(selectedOptions: any, b) => {
            debugger;
            const values =
              selectedOptions && Array.isArray(selectedOptions)
                ? selectedOptions.map((option) => option.value)
                : selectedOptions?.value;
            props.onChange && props.onChange(values, b);
          }}
          styles={{
            option: (base, props) => ({
              ...base,
              padding: "3px 10px",
            }),
          }}
        />
      );
    } else {
      return (
        <ReactSelect
          {...props}
          // ref={ref}
          // menuIsOpen
          classNamePrefix="flowbite-select"
          placeholder="Vyberte možnosti"
          onChange={(selectedOptions: any, b) => {
            const values =
              selectedOptions && Array.isArray(selectedOptions)
                ? selectedOptions.map((option) => option.value)
                : selectedOptions?.value;
            props.onChange && props.onChange(values, b);
          }}
          styles={{
            option: (base, props) => ({
              ...base,
              padding: "3px 10px",
            }),
          }}
        />
      );
    }
  }
);

export default Select;
