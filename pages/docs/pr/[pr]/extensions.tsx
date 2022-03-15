import matter from "gray-matter";

import { GetStaticPaths, GetStaticProps } from "next";

import ExtensionsPage, { ExtensionsPageProps } from "~/components/extensions";
import { createExtensionSearchString } from "~/helpers/extensions";
import { urlToSlugs } from "~/helpers/params";
import { extensionDataIsComplete } from "~/helpers/type-guards";
import { fetchExtensions, fetchPullRequest } from "~/lib/api";
import { getBlobText } from "~/lib/doc-tree";

export const getStaticPaths: GetStaticPaths = async () => {
  /**
   * We want to render tag pages on demand and not at build time.
   * So paths is an empty array.
   */
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<ExtensionsPageProps> = async ({
  params,
}) => {
  const pr = params?.pr;

  if (pr == null || Array.isArray(pr) || !pr.length) {
    /**
     * Redirect if no tag string.
     */
    return { redirect: { destination: "/docs", permanent: true } };
  }

  const pullNumber = parseInt(pr, 10);
  if (isNaN(pullNumber)) {
    /**
     * 404 if provided pull request number is not valid. Saves a query.
     */
    return { notFound: true };
  }

  try {
    const { branch, owner, repo, pull_number, html_url } =
      await fetchPullRequest({ pull_number: pullNumber });

    /**
     * Get extensions
     */
    const { extensions, tableContent: docsToc } = await fetchExtensions({
      prefix: `/docs/pr/${pull_number}/`,
      owner,
      repo,
      ref: branch,
    });

    const extensionData = [];

    for (const extensionPage of extensions) {
      const text = getBlobText(extensionPage.object);
      if (text == null) {
        continue;
      }

      if (extensionPage.name.startsWith("_")) {
        continue;
      }

      const { data } = matter(text);

      if (!extensionDataIsComplete(data)) {
        continue;
      }

      extensionData.push({
        href: `/docs/pr/${pull_number}/extensions/${urlToSlugs(
          extensionPage.name
        )}`,
        searchString: createExtensionSearchString(data),
        data,
      });
    }

    return {
      props: {
        docsToc,
        extensions: extensionData,
        version: `PR ${pull_number}`,
        versionHref: html_url,
      },
      revalidate: 5,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getStaticProps:", error);
    return { notFound: true, revalidate: 5 };
  }
};

export default ExtensionsPage;
