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

  public sortDisciplines<T extends { name: string }>(disciplines: T[]): T[] {
    return disciplines.sort((a, b) => a.name.localeCompare(b.name));
  }

  public readCSVFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read CSV file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading CSV file'));
      };

      reader.readAsText(file);
    });
  }
}

export default new UtilsService();
