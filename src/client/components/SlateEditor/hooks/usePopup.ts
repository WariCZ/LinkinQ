import { useState, useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';

function usePopup(popupRef: MutableRefObject<HTMLDivElement | null>): [boolean, Dispatch<SetStateAction<boolean>>] {
    const [showPopup, setShowPopup] = useState<boolean>(false);
    
    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            const clickedComponent = e.target as Node;
            if (popupRef.current && !popupRef.current.contains(clickedComponent)) {
                setShowPopup(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [popupRef]);

    return [showPopup, setShowPopup];
}

export default usePopup;
