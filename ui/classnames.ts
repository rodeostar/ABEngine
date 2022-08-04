export default function classNames(
  ...args: (string | Record<string, boolean>)[]
) {
  return args
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object") {
        return Object.entries(item)
          .map(([cls, cond]) => (cond ? cls : ""))
          .join(" ");
      }

      return "";
    })
    .join(" ")
    .trim();
}
