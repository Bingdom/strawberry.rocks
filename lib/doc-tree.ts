import marked, { Tokens } from "marked";

import { DocsTree, Section } from "~/components/docs-navigation";
import { addHrefPrefix } from "~/helpers/params";
import {
  isBlob,
  isHeading,
  isLink,
  isList,
  isListItemWithTokens,
  isTextWithTokens,
  isTree,
} from "~/helpers/type-guards";

export const getMDLinks = (items: Tokens.ListItem[]): Tokens.Link[] =>
  items.filter(isListItemWithTokens).flatMap((item) =>
    item.tokens
      .filter(isTextWithTokens)
      .flatMap((t) => t.tokens)
      .filter(isLink)
  );

export function getDocTree(text: string, prefix: string) {
  const sections: DocsTree = {};
  const tokens = marked.lexer(text);

  let currentSection = "Docs";

  tokens.forEach((token) => {
    if (isHeading(token) && token.depth === 2) {
      if (isLink(token.tokens[0])) {
        const link: Tokens.Link = token.tokens[0];
        const sectionName = link.text;

        sections[sectionName] = {
          href: addHrefPrefix(link.href, prefix),
          text: link.text,
        };
      }
      currentSection = token.text;
    }

    if (isList(token)) {
      if (typeof sections[currentSection] === "undefined") {
        sections[currentSection] = {
          name: currentSection,
          links: [],
        };
      }

      const links: Tokens.Link[] = getMDLinks(token.items);
      (sections[currentSection] as Section).links = links.map((link) => ({
        href: addHrefPrefix(link.href, prefix),
        text: link.text,
      }));
    }
  });
  return sections;
}

export const getTreeEntries = (
  obj: Record<string, unknown> | null | undefined
) => (isTree(obj) ? obj?.entries : null);

export const getBlobText = (obj: Record<string, unknown> | null | undefined) =>
  isBlob(obj) ? obj.text : null;
