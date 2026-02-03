import { useEffect } from "react";
import { useMatches, useLocation, useParams } from "react-router-dom";

type HandleType = {
    title?: string | ((params: any) => string);
};

export function usePageTitle() {
    const matches = useMatches();
    const location = useLocation();
    const params = useParams();

    useEffect(() => {
        let title = "Panel"; // Default title

        // Iterate over matches to find the last defined title
        for (const match of matches) {
            const handle = match.handle as HandleType;
            if (handle?.title) {
                if (typeof handle.title === "function") {
                    title = handle.title(params);
                } else {
                    title = handle.title;
                }
            }
        }

        document.title = title;
    }, [matches, location, params]);
}
