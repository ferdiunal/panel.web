import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import type { FieldData } from "@/types";
import { Loader2, ExternalLink } from "lucide-react";

interface MorphToDetailFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

export function MorphToDetailField({ field, record }: MorphToDetailFieldProps) {
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

    const types = (field.props?.types as Array<{ label: string, value: string, slug: string }>) || [];
    const typeDef = types.find(t => t.value === typeValue || t.slug === typeValue);
    const typeLabel = typeDef?.label || typeValue;
    const slug = typeDef?.slug;

    useEffect(() => {
        if (!typeValue || !idValue || !typeDef) {
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
                const res = await axios.get(`/api/resource/${typeDef.slug}/${idValue}`);
                const item = res.data.data;
                
                const displays = (field.props?.displays as Record<string, string>) || {}
                const preferredField = displays[typeValue] || displays[slug || ""]

                let fetchedLabel = ""
                if (preferredField && item?.[preferredField]) {
                    fetchedLabel = item[preferredField]?.data || item[preferredField]
                }

                if (!fetchedLabel) {
                    fetchedLabel = item?.name?.data || item?.title?.data || item?.label?.data ||
                    item?.name || item?.title || item?.label || `#${idValue}`;
                }
                
                setLabel(fetchedLabel);
            } catch (e) {
                setLabel(`#${idValue}`);
            } finally {
                setLoading(false);
            }
        };
        fetchTitle();
    }, [typeValue, idValue, typeDef, field.key, record]);

    if (!typeValue || !idValue) {
        return <span className="text-muted-foreground">-</span>;
    }

    const displayLabel = label || `#${idValue}`;

    return (
        <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-normal">
                {typeLabel}
            </Badge>

            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : slug ? (
                <Link
                    to={`/resources/${slug}/${idValue}`}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                >
                    {displayLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                </Link>
            ) : (
                <span className="font-medium">{displayLabel}</span>
            )}
        </div>
    );
}
