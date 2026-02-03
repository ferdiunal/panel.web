export interface FieldData {
    data: any;
    disabled: boolean;
    filterable: boolean;
    help_text: string;
    key: string;
    label: string;
    name: string;
    nullable: boolean;
    placeholder: string;
    props: Record<string, any>;
    read_only: boolean;
    required: boolean;
    sortable: boolean;
    stacked: boolean;
    text_align: string;
    type: string;
    view: string;
}

export interface ResourcePolicy {
    view: boolean;
    update: boolean;
    delete: boolean;
}

export interface ResourceItem {
    policy?: ResourcePolicy;
    [key: string]: FieldData | ResourcePolicy | undefined;
}

export interface ResourceResponse {
    data: ResourceItem[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        title: string;
        headers: FieldData[];
        dialog_type: "dialog" | "sheet" | "drawer";
        create_fields?: FieldData[];
        update_fields?: FieldData[];
        policy: {
            create: boolean;
            view_any: boolean;
            update: boolean;
            delete: boolean;
        };
    };
};

export interface Card {
    component: string;
    title: string;
    width: string;
    data: any;
}
