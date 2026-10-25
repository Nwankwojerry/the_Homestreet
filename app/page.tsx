import type { Metadata } from "next";
import { LegacyMain } from "@/components/LegacyMain";
import { getHomePage } from "@/lib/legacy-home";
export function generateMetadata(): Metadata { const page=getHomePage(); return {title:page.title,description:page.description||undefined}; }
export default function HomePage(){return <LegacyMain html={getHomePage().mainHtml}/>}
