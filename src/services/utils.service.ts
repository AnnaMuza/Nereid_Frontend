import { UsersApi } from "@/types/api";

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

  public getFromSessionStorage<T>(key: string): T | null {
    const val = sessionStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }

  public removeFromFromSessionStorage(key: string): void {
    sessionStorage.removeItem(key);
  }

  public saveToSessionStorage(key: string, data: any): void {
    sessionStorage.setItem(key, JSON.stringify(data));
  }
}

export default new UtilsService();
