import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { RelationshipHoverCard } from "../RelationshipHoverCard";
import { FieldLayout } from "../FieldLayout";
import type { DetailFieldProps } from "@/types"; // DetailFieldProps kullan

type MorphTypeOption = {
    label?: string;
    value?: string;
    slug?: string;
}

function normalizeMorphIdentifier(value?: string): string {
    if (!value) return ""
    const normalized = value
        .trim()
        .toLowerCase()
        .replace(/\\/g, "/")
        .split("/")
        .filter(Boolean)
        .pop()
    if (!normalized) return ""
    return normalized.replace(/\s+/g, "_")
}

function buildMorphIdentifierCandidates(value?: string): Set<string> {
    const candidates = new Set<string>()
    const normalized = normalizeMorphIdentifier(value)
    if (!normalized) return candidates

    candidates.add(normalized)
    candidates.add(normalized.replace(/-/g, "_"))
    candidates.add(normalized.replace(/_/g, "-"))
    if (normalized.endsWith("s")) {
        candidates.add(normalized.slice(0, -1))
    } else {
        candidates.add(`${normalized}s`)
    }
    return candidates
}

function normalizeTypes(rawTypes: unknown): MorphTypeOption[] {
    if (Array.isArray(rawTypes)) {
        return rawTypes
            .filter((entry) => typeof entry === "object" && entry !== null)
            .map((entry) => {
                const record = entry as Record<string, unknown>
                return {
                    label: typeof record.label === "string" ? record.label : undefined,
                    value: typeof record.value === "string" ? record.value : undefined,
                    slug: typeof record.slug === "string" ? record.slug : undefined,
                }
            })
    }

    if (typeof rawTypes === "object" && rawTypes !== null) {
        return Object.entries(rawTypes as Record<string, unknown>).map(([valueKey, slugValue]) => ({
            value: valueKey,
            slug: typeof slugValue === "string" ? slugValue : undefined,
            label: typeof slugValue === "string" ? slugValue : undefined,
        }))
    }

    return []
}

function resolveTypeDef(options: MorphTypeOption[], typeValue?: string): MorphTypeOption | undefined {
    if (!typeValue || options.length === 0) return undefined
    const typeCandidates = buildMorphIdentifierCandidates(typeValue)
    if (typeCandidates.size === 0) return undefined

    return options.find((option) => {
        const optionCandidates = new Set<string>()
        for (const candidate of [option.value, option.slug, option.label]) {
            for (const normalized of buildMorphIdentifierCandidates(candidate)) {
                optionCandidates.add(normalized)
            }
        }

        for (const candidate of typeCandidates) {
            if (optionCandidates.has(candidate)) {
                return true
            }
        }

        return false
    })
}

export function MorphToDetailField({ field, record, onResourceClick }: DetailFieldProps) {
    const typeKey = `${field.key}_type`;
    const idKey = `${field.key}_id`;

    // Check multiple possible locations for the data
    let typeValue = record[typeKey]?.data || record[typeKey];
    let idValue = record[idKey]?.data || record[idKey];

    // Check attributes if available (JSON:API style)
    if (!typeValue && !idValue && record.attributes) {
        typeValue = record.attributes[typeKey];
        idValue = record.attributes[idKey];
    }

    // Fallback: Check if it's a nested object
    if (!typeValue && !idValue && record[field.key]) {
        const nested = record[field.key];
        if (typeof nested === 'object') {
            typeValue = nested.type?.data || nested.type || nested.commentable_type || nested.morph_type;
            idValue = nested.id?.data || nested.id || nested.commentable_id || nested.morph_id;
        }
    }

    // Also check the field's data directly
    if (!typeValue && !idValue && field.data) {
        const fieldData = field.data;
        if (typeof fieldData === 'object') {
            typeValue = fieldData.type || fieldData.morphToType;
            idValue = fieldData.id || fieldData.morphToId;
        }
    }

    const [label, setLabel] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [relatedData, setRelatedData] = useState<Record<string, any> | null>(null);

    const typeOptions = normalizeTypes(field.props?.types);
    const typeDef = resolveTypeDef(typeOptions, typeValue);
    const typeLabel = typeDef?.label || typeValue;
    const resourceFromRecord =
        record[`${field.key}_resource`]?.data ||
        record[`${field.key}_resource`] ||
        record.attributes?.[`${field.key}_resource`] ||
        record[field.key]?.resource_slug ||
        record[field.key]?.resource ||
        record[field.key]?.slug ||
        (typeof field.data === "object" && field.data !== null
            ? (field.data as Record<string, unknown>).resource_slug ||
              (field.data as Record<string, unknown>).resource ||
              (field.data as Record<string, unknown>).slug
            : undefined);
    const slug =
        typeDef?.slug ||
        (typeof resourceFromRecord === "string" ? resourceFromRecord : undefined) ||
        (typeof typeValue === "string" && normalizeMorphIdentifier(typeValue).endsWith("s")
            ? normalizeMorphIdentifier(typeValue)
            : undefined);

    // Hover card config'ini al
    const hoverCardConfig = field.props?.hover_card as any;

    useEffect(() => {
        if (!typeValue || !idValue || !slug) {
            setLabel("");
            return;
        }

        // Check if name is already available
        const nested = record[field.key];
        if (nested?.attributes?.name || nested?.name?.data || nested?.name) {
            setLabel(nested.attributes?.name || nested.name?.data || nested.name);
            return;
        }

        const fetchTitle = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/resource/${slug}/${idValue}`);
                const item = res.data.data;

                const displays = (field.props?.displays as Record<string, string>) || {}
                const normalizedTypeValue = typeof typeValue === "string" ? typeValue : String(typeValue)
                const preferredField = displays[normalizedTypeValue] || displays[slug]

                let fetchedLabel = ""
                if (preferredField && item?.[preferredField]) {
                    fetchedLabel = item[preferredField]?.data || item[preferredField]
                }

                if (!fetchedLabel) {
                    fetchedLabel = item?.name?.data || item?.title?.data || item?.label?.data ||
                    item?.name || item?.title || item?.label || `#${idValue}`;
                }

                setLabel(fetchedLabel);
                setRelatedData(item); // Hover card için veriyi sakla
            } catch (e) {
                setLabel(`#${idValue}`);
                setRelatedData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchTitle();
    }, [typeValue, idValue, slug, field.key, record, field.props?.displays]);

    const displayLabel = label || (idValue ? `#${idValue}` : '');

    // Link element'i oluştur
    const linkElement = loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    ) : typeValue && idValue && slug ? (
        onResourceClick ? (
            <button
                type="button"
                onClick={() => onResourceClick(slug, idValue)}
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium bg-transparent border-0 p-0 cursor-pointer"
            >
                {displayLabel}
                <ExternalLink className="h-3.5 w-3.5" />
            </button>
        ) : (
            <Link
                to={`/resource/${slug}/${idValue}/show`}
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
                {displayLabel}
                <ExternalLink className="h-3.5 w-3.5" />
            </Link>
        )
    ) : typeValue && idValue ? (
        <span className="font-medium">{displayLabel}</span>
    ) : (
        <span className="text-muted-foreground">—</span>
    );

    // Hover card ile wrap et (eğer aktifse ve veri varsa)
    const linkContent = hoverCardConfig && hoverCardConfig.enabled && relatedData && !loading ? (
        <RelationshipHoverCard config={hoverCardConfig} data={relatedData}>
            {linkElement}
        </RelationshipHoverCard>
    ) : (
        linkElement
    );

    const content = typeValue || idValue ? (
        <div className="flex items-center gap-3">
            {typeValue && (
                <Badge variant="secondary" className="font-normal">
                    {typeLabel}
                </Badge>
            )}
            {linkContent}
        </div>
    ) : (
        <span className="text-muted-foreground">—</span>
    );

    return (
        <FieldLayout
            name={field.key}
            label={field.label || field.name}
            helpText={field.help_text}
        >
            {content}
        </FieldLayout>
    );
}
