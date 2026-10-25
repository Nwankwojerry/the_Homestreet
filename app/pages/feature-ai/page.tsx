import { LegacyMain } from "@/components/LegacyMain";
import { DbArticle } from "@/components/DbArticle";
import { getLegacyFeatureAiPage } from "@/lib/legacy-feature-ai";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FeatureAiPage() {
  const legacy = getLegacyFeatureAiPage();
  const prisma = getPrismaClient();
  if (!prisma) return <LegacyMain html={legacy.mainHtml} />;
  try {
    const article = await prisma.article.findUnique({ where: { slug: "feature-ai" }, include: { category: true, media: { orderBy: { sortOrder: "asc" } }, tags: { include: { tag: true } } } });
    return article ? <DbArticle article={article} /> : <LegacyMain html={legacy.mainHtml} />;
  } catch { return <LegacyMain html={legacy.mainHtml} />; }
}
