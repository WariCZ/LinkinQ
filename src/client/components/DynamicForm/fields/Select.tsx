import { httpRequest } from "../../../services/httpBase";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import ReactSelect, { Props as ReactSelectProps } from "react-select";
import AsyncSelect from "react-select/async";

const Select = React.forwardRef(
  (
    props: ReactSelectProps & {
      entity?: string;
      labelFields?: string;
      readOnly?: boolean;
    },
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
          isDisabled={props.readOnly}
          // ref={ref}
          // menuIsOpen
          cacheOptions
          onMenuOpen={() => {
            fetchOptions({});
          }}
          defaultOptions={
            props.required ? options : [{ value: null, label: " " }, ...options]
          }
          className="w-full min-w-fit"
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
          isDisabled={props.readOnly}
          className="w-full min-w-fit"
          classNamePrefix="flowbite-select"
          placeholder="Vyberte možnosti"
          menuPortalTarget={document.body}
          onChange={(selectedOptions: any, b) => {
            const values =
              selectedOptions && Array.isArray(selectedOptions)
                ? selectedOptions.map((option) => option.value)
                : selectedOptions?.value;
            props.onChange && props.onChange(values, b);
          }}
          styles={{
            option: (base) => ({
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
