import { httpRequest } from "@/client/hooks/useDataDetail";
import _ from "lodash";
import React, { RefAttributes, useEffect, useState } from "react";
import ReactSelect, { Props as ReactSelectProps } from "react-select";
import AsyncSelect from "react-select/async";

const Select = React.forwardRef(
  (
    props: ReactSelectProps & { entity?: string; labelFields?: string },
    ref
  ) => {
    const [options, setOptions] = useState([]);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [value, setValue] = useState(props.value);

    useEffect(() => {
      if (props.value) {
        if (props.entity) {
          if (
            !props.value ||
            (Array.isArray(props.value) && props.value.length == 0)
          ) {
            setValue([]);
          } else {
            fetchOptions({ guid: props.value as any }).then((value: any) => {
              console.log("value", props, value);
              value &&
                setValue([
                  ...value.map((item) => ({
                    value: item.guid,
                    label: item[props.labelFields || "caption"],
                  })),
                ]);
            });
          }
        } else {
          if (Array.isArray(props.value)) {
            setValue(props.value);
          } else {
            const opt = _.find(props.options, { value: props.value });
            setValue(opt);
          }
        }
      } else {
        setValue(null);
      }
    }, [props.value]);

    const fetchOptions = async ({ guid }: { guid?: string[] | string }) => {
      // if (!guid) return;
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
          menuPortalTarget={document.body} // Přesměrování dropdownu mimo modal
          onChange={(selectedOptions: any, b) => {
            const values =
              selectedOptions && Array.isArray(selectedOptions)
                ? selectedOptions.map((option) => option.value)
                : selectedOptions?.value;
            props.onChange && props.onChange(values, b);
            setMenuIsOpen(false);
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
          value={value}
          // ref={ref}
          // menuIsOpen
          classNamePrefix="flowbite-select"
          placeholder="Vyberte možnosti"
          menuPortalTarget={document.body} // Přesměrování dropdownu mimo modal
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