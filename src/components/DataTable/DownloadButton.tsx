import { FileSpreadsheet } from "lucide-react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

export function DownloadButton(props: Props) {
    return (
        <button {...props} className="flex items-center bg-green-600 px-2 py-1 text-white rounded-lg font-bold font-xs disabled:cursor-not-allowed disabled:opacity-70">
            <FileSpreadsheet strokeWidth={2.5} size={18} className="mr-2" />
            Descargar
        </button>
    )
}
