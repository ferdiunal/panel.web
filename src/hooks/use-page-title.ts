import { useEffect } from "react";
import { useMatches, useLocation, useParams } from "react-router-dom";
import { useAppStore } from "@/stores/app";

type HandleType = {
    title?: string | ((params: any) => string);
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
    if (typeof value === "object" && value !== null) {
        return value as Record<string, unknown>;
    }
    return undefined;
}

function asTitle(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
    }
    return undefined;
}

function extractTitleFromLoaderData(data: unknown): string | undefined {
    const dataRecord = asRecord(data);
    if (!dataRecord) return undefined;

    const directTitle = asTitle(dataRecord.title);
    if (directTitle) return directTitle;

    const directMetaTitle = asTitle(asRecord(dataRecord.meta)?.title);
    if (directMetaTitle) return directMetaTitle;

    const nestedData = asRecord(dataRecord.data);
    if (!nestedData) return undefined;

    const nestedTitle = asTitle(nestedData.title);
    if (nestedTitle) return nestedTitle;

    return asTitle(asRecord(nestedData.meta)?.title);
}

function withSiteName(title: string, siteName: string): string {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return siteName;

    if (normalizedTitle === siteName || normalizedTitle.endsWith(`| ${siteName}`)) {
        return normalizedTitle;
    }

    return `${normalizedTitle} | ${siteName}`;
}

export function usePageTitle() {
    const matches = useMatches();
    const location = useLocation();
    const params = useParams();
    const siteName = useAppStore((state) => state.settings?.site_name || "Panel");

    useEffect(() => {
        let handleTitle = "";
        let loaderTitle = "";

        // Prefer loader data title (resource/page API response) over static route handle title.
        for (const match of matches) {
            const dataTitle = extractTitleFromLoaderData(match.data);
            if (dataTitle) {
                loaderTitle = dataTitle;
            }

            const handle = match.handle as HandleType;
            if (handle?.title) {
                if (typeof handle.title === "function") {
                    handleTitle = handle.title(params);
                } else {
                    handleTitle = handle.title;
                }
            }
        }

        const fallbackTitle = handleTitle || siteName;
        const resolvedTitle = loaderTitle || fallbackTitle;

        document.title = withSiteName(resolvedTitle, siteName);
    }, [matches, location, params, siteName]);
}
