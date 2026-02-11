import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import type { FieldData } from "@/types";
import { RelationshipHoverCard } from "../RelationshipHoverCard";
import { FieldLayout } from "../FieldLayout";

interface MorphToIndexFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

export function MorphToIndexField({ field, record }: MorphToIndexFieldProps) {
    const [displayLabel, setDisplayLabel] = useState<string>("");
    const [relatedData, setRelatedData] = useState<Record<string, any> | null>(null);

    // Try to get type and id from various sources
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

    // Fallback: Check if it's a nested object (e.g. eager loaded)
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

    const types = (field.props?.types as Array<{ label: string, value: string, slug: string }>) || [];
    const typeDef = types.find(t => t.value === typeValue || t.slug === typeValue);
    const typeLabel = typeDef?.label || typeValue;
    const slug = typeDef?.slug;

    // Hover card config'ini al
    const hoverCardConfig = field.props?.hover_card as any;

    // Fetch display name for the related resource
    useEffect(() => {
        if (!typeValue || !idValue || !typeDef) {
            setDisplayLabel("");
            return;
        }

        // Check if name is already in record
        const nested = record[field.key];
        if (nested?.name?.data || nested?.name || nested?.title?.data || nested?.title) {
            setDisplayLabel(nested.name?.data || nested.name || nested.title?.data || nested.title);
            return;
        }

    // Fetch from API
    const fetchLabel = async () => {
      try {
        const res = await axios.get(`/api/resource/${typeDef.slug}/${idValue}`)
        const item = res.data.data

        const displays = (field.props?.displays as Record<string, string>) || {}
        const preferredField = displays[typeValue] || displays[slug || ""]

        let label = ""
        if (preferredField && item?.[preferredField]) {
             label = item[preferredField]?.data || item[preferredField]
        }

        if (!label) {
             label = item?.name?.data || item?.title?.data || item?.label?.data ||
                item?.name || item?.title || item?.label || `#${idValue}`
        }

        setDisplayLabel(label)
        setRelatedData(item); // Hover card için veriyi sakla
      } catch (e) {
        setDisplayLabel(`#${idValue}`)
        setRelatedData(null);
      }
    }
    fetchLabel();
  }, [typeValue, idValue, typeDef, record, field.key]);

    const finalLabel = displayLabel || (idValue ? `#${idValue}` : '');

    // Link element'i oluştur
    const linkElement = typeValue && idValue && slug ? (
        <Link
            to={`/resources/${slug}/${idValue}`}
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
        >
            {finalLabel}
        </Link>
    ) : typeValue && idValue ? (
        <span className="text-sm font-medium">{finalLabel}</span>
    ) : (
        <span className="text-muted-foreground">—</span>
    );

    // Hover card ile wrap et (eğer aktifse ve veri varsa)
    const linkContent = hoverCardConfig && hoverCardConfig.enabled && relatedData ? (
        <RelationshipHoverCard config={hoverCardConfig} data={relatedData}>
            {linkElement}
        </RelationshipHoverCard>
    ) : (
        linkElement
    );

    const content = typeValue || idValue ? (
        <div className="flex items-center gap-2">
            {typeValue && (
                <Badge variant="outline" className="font-normal text-xs">
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
            label={field.name || field.label}
            helpText={field.help_text}
            hideLabel={true}
        >
            {content}
        </FieldLayout>
    );
}
