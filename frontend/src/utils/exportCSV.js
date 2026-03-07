/**
 * Utility to export any array of objects to a CSV file download.
 * @param {Array<Object>} rows - Data rows to export.
 * @param {string} filename - The name of the downloaded file.
 */
export const exportToCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row =>
            headers.map(h => {
                const val = row[h] ?? '';
                // Wrap in quotes if the value contains a comma
                return String(val).includes(',') ? `"${val}"` : val;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
