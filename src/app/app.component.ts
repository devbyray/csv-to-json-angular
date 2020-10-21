import { Component } from '@angular/core';

export class tableItem {
  key: string = null;
  value: string = null;
  type: string = null;

  constructor(data: any) {
    this.key = data.key;
    this.value = data.value;
    this.type = data.type;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public files: any[] = [];

  private originalContent: string | ArrayBuffer = null;
  public fileContent: tableItem[][] = null;
  public filteredFileContent: tableItem[][] = null;
  public cleanedProps: string[] = null;

  public minimalIssues = '1';

  public updateMinimalIssues($event) {
    this.minimalIssues = $event;
  }

  public onFileSelected() {
    const inputNode: any = document.querySelector('#file');

    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.files = inputNode.files;
        this.originalContent = reader.result;
        this.fileContent = this.csvToJson(this.originalContent);
        this.filteredFileContent = this.csvToJson(this.originalContent);
      };

      reader.readAsText(inputNode.files[0]);
    }
  }

  private csvToJson(csvText: string | ArrayBuffer): tableItem[][] {
    const csvString = csvText.toString();
    const textLines = csvString.split('\n');

    const formattedContent = textLines.map((textRow: string) =>
      textRow.split(',')
    );
    const [csvProperties, ...csvContent] = formattedContent;

    this.cleanedProps = csvProperties.map((prop: string) =>
      this.cleanString(prop)
    );

    const json = csvContent.map((textRow: string[]) => {
      const textArr = textRow.map((row: string) => this.cleanString(row));

      const arr: tableItem[] = [];
      textArr.forEach((textItem: string, idx: number) => {

        if(textItem.includes('T00')) {
          console.log(`${textItem}`)
          textItem = new Intl.DateTimeFormat('nl-NL').format(new Date(textItem.substr(0, 10)))
        }

        arr.push(
          new tableItem({
            key: this.cleanedProps[idx],
            value: textItem,
          })
        );
      });

      return arr;
    });

    return json;
  }

  private cleanString(str: string): string {
    return str.split('"').join('');
  }

  public filterOnIssueCount(): void {
    const filteredArr = this.fileContent.map((item: tableItem[]) => {
      let obj = null;
      item.forEach((it: tableItem) => {
        const isIssueCount = it.key === 'Issue count';
        const isNumber = !isNaN(parseInt(it.value));
        const isHigherThanIssueCount =
          parseInt(it.value) >= parseInt(this.minimalIssues);

        if (isIssueCount && isNumber && isHigherThanIssueCount) {
          obj = item;
        }
      });

      return obj;
    });

    this.filteredFileContent = filteredArr;
  }
}
