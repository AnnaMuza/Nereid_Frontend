class UtilsService {
  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  public downloadCsv(content: string, filename: string = 'report'): void {
    // Create a Blob with the CSV content
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Set attributes for the anchor
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    // Append the anchor to the document
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public downloadExcel(content: string, filename: string = 'report'): void {
    // Parse the CSV string into rows and columns
    const rows = content.split('\n').map(row =>
      row.split(',').map(cell =>
        cell.replace(/^"(.*)"$/, '$1') // Remove surrounding double quotes
      )
    );

    // Create a new workbook
    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();

    // Convert the rows array to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel file as an array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob with the Excel content
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Set attributes for the anchor
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xlsx`);
    link.style.visibility = 'hidden';

    // Append the anchor to the document
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public isURL(string?: string | null): boolean {
    if (!string) {
      return false;
    }

    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  public isEmail(string: string): boolean {
    return this.emailRegex.test(string);
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
