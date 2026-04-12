import { useEffect, useRef } from "react";

declare global {
    interface Window {
        $3Dmol: any;
    }
}

export function MoleculeViewer({ molBlock }: { molBlock: string }) {
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!viewerRef.current || !molBlock) return;

        // 1. 清空旧的内容
        viewerRef.current.innerHTML = "";

        // 2. 创建 viewer
        const viewer = window.$3Dmol.createViewer(viewerRef.current, {
            backgroundColor: "white",
        });

        viewer.addModel(molBlock, "mol");
        viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
        viewer.zoomTo();
        viewer.render();

        return () => {
            viewer.clear();
        };
    }, [molBlock]);

    return (
        <div
            ref={viewerRef}
            className="relative w-full h-[400px] rounded-lg overflow-hidden border border-gray-200"
        />
    );
}
