import React from "react";
import {Input} from "./input";
import {TODO} from "@/types";
import {ChevronUp} from "lucide-react";

const InputNumber: React.FC<{isLoading: boolean; field: TODO; placeholder?: string}> = ({
  isLoading,
  field,
  placeholder,
}) => {
  return (
    <section className="relative flex items-center">
      <Input
        placeholder={placeholder}
        onKeyPress={(event) => {
          if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
          }
        }}
        disabled={isLoading}
        {...field}
        onChange={(e) => {
          field.onChange(+e.target.value);
        }}
      />
      <div className="absolute right-0 h-full">
        <div className="flex flex-col items-center justify-center h-full px-3 bg-white">
          <button
            type="button"
            className=""
            onClick={() => {
              if (field.value === undefined) {
                field.onChange(0);
              } else {
                field.onChange(+field.value + 1);
              }
            }}
          >
            <ChevronUp size={16} color="black" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (field.value === undefined) {
                field.onChange(0);
              } else {
                if (+field.value > 0) {
                  field.onChange(+field.value - 1);
                }
              }
            }}
            className="rotate-180"
          >
            <ChevronUp size={16} color="black" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default InputNumber;

