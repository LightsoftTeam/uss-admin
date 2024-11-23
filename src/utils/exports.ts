interface ExportData {
    [key: string]: string | number | boolean;
}

export class Exports {
    static toExcel(data: ExportData[], fileName: string): void {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(data);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.downloadFile(excelBuffer, `${fileName}.xlsx`);
        });
    }

    static tableToBook(table: HTMLTableElement, fileName: string): void {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.table_to_sheet(table);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
            this.downloadFile(excelBuffer, `${fileName}.xlsx`);
        });
    }

    static downloadFile(buffer: Buffer, fileName: string): void {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}