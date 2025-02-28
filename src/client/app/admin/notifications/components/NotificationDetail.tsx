import Form from "@/client/components/DynamicForm";
import useDataDetail from "@/client/hooks/useDataDetail";

export const NotificationDetail = (props: any) => {
    const entity = "notifications";

    const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
        {
            entity: entity,
            guid: props?.data?.guid,
            fields: [
                "caption",
                "active",
                "entity",
                "method",
                "filter",
                // "adapters",
                "subject",
                "text",
            ],
        },
        {} as any
    );

    //if (loading) return "loading";
    return (
        <Form
            onSubmit={({ data }) => {
                setRecord(data);
                props.closeModal && props.closeModal();
            }}
            {...props}
            data={data}
            entity={entity}
            formFields={[
                "caption",
                "active",
                "entity",
                "method",
                "filter",
                // "adapters",
                "subject",
                "text",
            ]}
        />
    );
};