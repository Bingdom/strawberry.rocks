import { Root, toString } from "hast-util-to-string";
import { h } from "hastscript";
import { Plugin } from "unified";

export const FaqPlugin: Plugin = () => {
  return (tree) => {
    const rootChildren = (tree as Root).children;

    const elements = [];

    let currentDetail = null;

    for (const element of rootChildren) {
      if (element.type === "element" && element.tagName === "h2") {
        const heading = element.children[0];

        currentDetail = h("FaqDetails", {}, [
          h(
            "summary",
            { className: "list-none" },
            h("h2", { className: "cursor-pointer" }, "↳ " + toString(heading))
          ),
        ]);
        // h converts the name to lowercase
        currentDetail.tagName = "FaqDetails";

        elements.push(currentDetail);
      } else if (currentDetail) {
        // @ts-ignore
        currentDetail.children.push(element);
      }
    }

    tree.children = elements;
  };
};
