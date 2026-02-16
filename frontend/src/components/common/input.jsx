import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import "../../css/auth/Input.css";

const Input = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder,
  type,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="input-wrapper">
      <label htmlFor={id}>{label}</label>

      <div className="input-container">
        <input
          id={id}
          name={name}
          type={
            type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="input-field"
        />

        {type === "password" && (
          <button
            type="button"
            className="input-eye-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaRegEye size={22} /> : <FaRegEyeSlash size={22} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;