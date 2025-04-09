<<<<<<< HEAD
import React from "react";

export default function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      className={`fill-current ${className}`}
      width={size.toString() + "px"}
      height={size.toString() + "px"}
    >
      <use xlinkHref={`/icons/solid.svg#${name}`} />
    </svg>
  );
}
=======
import React from "react";

export default function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      className={`fill-current ${className}`}
      width={size.toString() + "px"}
      height={size.toString() + "px"}
    >
      <use xlinkHref={`/icons/solid.svg#${name}`} />
    </svg>
  );
}
>>>>>>> f03ffe64262cf8aa084f61c72300f7f334c594b5
