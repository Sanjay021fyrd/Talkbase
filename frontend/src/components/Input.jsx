const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-ink-200 text-sm font-medium mb-1.5"
        >
          {label} {required && <span className="text-brand-400">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-ink-500">{icon}</span>
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 bg-white/5 border rounded-xl text-ink-50 placeholder-ink-500
            focus:outline-none focus:ring-2 focus:ring-brand-400/70 focus:border-brand-400/60
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? "pl-11" : ""}
            ${error ? "border-red-500 focus:ring-red-500" : "border-white/15"}
          `}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
