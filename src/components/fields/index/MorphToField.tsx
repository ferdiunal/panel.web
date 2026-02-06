import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import type { FieldData } from "@/types";

interface MorphToIndexFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

export function MorphToIndexField({ field, record }: MorphToIndexFieldProps) {
    const [displayLabel, setDisplayLabel] = useState<string>("");

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
      } catch (e) {
        setDisplayLabel(`#${idValue}`)
      }
    }
    fetchLabel();
  }, [typeValue, idValue, typeDef, record, field.key]);

    if (!typeValue || !idValue) {
        return <span className="text-muted-foreground">-</span>;
    }

    const finalLabel = displayLabel || `#${idValue}`;

    return (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal text-xs">
                {typeLabel}
            </Badge>
            {slug ? (
                <Link
                    to={`/resources/${slug}/${idValue}`}
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {finalLabel}
                </Link>
            ) : (
                <span className="text-sm font-medium">{finalLabel}</span>
            )}
        </div>
    );
}
