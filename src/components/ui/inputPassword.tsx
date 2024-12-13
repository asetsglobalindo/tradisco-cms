import React, {useState} from "react";
import {Input} from "./input";
import {TODO} from "@/types";
import {Eye, EyeOff} from "lucide-react";

const InputPassword: React.FC<{isLoading: boolean; field: TODO; placeholder?: string}> = ({
  isLoading,
  field,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="relative flex items-center">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder ? placeholder : "Enter your Password"}
        disabled={isLoading}
        className="pr-14"
        {...field}
      />

      <button type="button" className="absolute right-4" onClick={() => setShowPassword((prev) => !prev)}>
        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </section>
  );
};

export default InputPassword;

