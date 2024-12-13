import React, {useEffect, useState} from "react";
import {Input} from "./ui/input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  value: string;
  disabled?: boolean;
}

const InputDecimal = React.forwardRef<HTMLInputElement, Props>(({className, ...props}, ref) => {
  const [value, setValue] = useState("0");

  const addCommas = (num: string) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const removeNonNumeric = (num: string) => num.toString().replace(/[^0-9]/g, "");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(addCommas(removeNonNumeric(event.target.value.replace(/^0+/, ""))));
  };

  useEffect(() => {
    if (props.value) {
      setValue(addCommas(removeNonNumeric(props.value.replace(/^0+/, ""))));
    }
  }, [props.value]);

  return (
    <Input
      ref={ref}
      placeholder={props.placeholder}
      type="text"
      className={className}
      disabled={props.disabled}
      onChange={(ev) => {
        handleChange(ev);
        if (props.onChange) {
          ev.target.value = ev.target.value.replace(/,/g, "");
          props.onChange(ev);
        }
      }}
      value={value || 0}
    />
  );
});

export default InputDecimal;

