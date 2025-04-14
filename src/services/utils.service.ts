class UtilsService {

  public downloadCsv(content: string, filename: string = 'download.csv'): void {
    // Create a Blob with the CSV content
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Set attributes for the anchor
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Append the anchor to the document
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default new UtilsService();
