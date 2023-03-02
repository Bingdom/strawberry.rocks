import { GetStaticPaths, GetStaticProps } from "next";

import DocsPage, { DocsPageProps } from "~/components/doc";
import { serializePage } from "~/helpers/mdx";
import {
  fetchDocPage,
  fetchLatestRelease,
  fetchTableOfContentsPaths,
  fetchExtensionsPaths,
  OWNER,
  REF,
  REPO,
  DocPageNotFound,
} from "~/lib/api";

export const getStaticPaths: GetStaticPaths = async () => {
  const ref = REF;
  const [pagePaths, extensionPaths] = await Promise.all([
    fetchTableOfContentsPaths({ ref }),
    fetchExtensionsPaths({ ref }),
  ]);
  const paths = pagePaths.concat(extensionPaths);

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps<DocsPageProps> = async ({
  params,
}) => {
  const slugs: string[] =
    params != null && Array.isArray(params.slug) && params.slug.length > 0
      ? params.slug
      : ["index"];

  /**
   * Get table of contents navigation data.
   */
  const ref = REF;
  const owner = OWNER;
  const repo = REPO;

  const version = await fetchLatestRelease();

  try {
    /**
     * Get doc content from markdown file.
     */
    const filename: string = slugs.join("/") + ".md";

    const { page, tableContent: docsToc } = await fetchDocPage({
      prefix: "/docs/",
      filename: `docs/${filename}`,
      owner,
      repo,
      ref,
    });

    const { source, data } = await serializePage({
      page,
      filename,
      ref,
      repo,
      owner,
    });

    const editPath = `https://github.com/${owner}/${repo}/edit/${REF}/docs/${filename}`;
    return {
      props: { source, data, editPath, docsToc, version },
      revalidate: 5 * 60,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getStaticProps:", error);
    if (error instanceof DocPageNotFound) {
      return { notFound: true, revalidate: 60 };
    }

    throw error;
  }
};

export default DocsPage;
