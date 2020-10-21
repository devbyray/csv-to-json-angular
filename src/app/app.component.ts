import { Component } from '@angular/core';

export class tableItem {
  key: string = null
  value: string = null
  type: string = null

  constructor(data: any) {
    this.key = data.key
    this.value = data.value
    this.type = data.type
  }

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rabobank-issues';
  srcResult: any = null
  files: any[] = []
  originalContent: string | ArrayBuffer = null;
  fileContent: tableItem[][] = null
  filteredFileContent: tableItem[][] = null
  cleanedProps: string[] = null


  onFileSelected() {
    const inputNode: any = document.querySelector('#file');
  
    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        this.srcResult = e.target.result;
        this.files = inputNode.files
        this.originalContent = reader.result
        this.fileContent = this.csvToJson(this.originalContent);
        this.filteredFileContent = this.csvToJson(this.originalContent);
      };

      reader.readAsText(inputNode.files[0])
    }
  }

  private csvToJson(csvText: string | ArrayBuffer) : tableItem[][] {
    const csvString = csvText.toString()
    const textLines = csvString.split("\n");

    const formattedContent = textLines.map((textRow: string) => textRow.split(","))
    const [csvProperties, ...csvContent] = formattedContent
    
    this.cleanedProps = csvProperties.map((prop: string) => this.cleanString(prop))

    const json = csvContent.map((textRow: string[]) => {
      const textArr = textRow.map((row: string) => this.cleanString(row))
      
      const arr : tableItem[] = []
      textArr.forEach((textItem: string, idx: number) => {
        const valueType = this.getValueType(textItem)
        let formattedValue : string | number = textItem
        console.log('DATTTEE: ', Date.parse(textItem))
        if(valueType === 'date' && !isNaN(Date.parse(textItem))) {
          console.log('date: ', textItem)
          formattedValue = this.formatDate(textItem)
          console.log('date: ', formattedValue)
        } else if(valueType === 'number') {
          formattedValue = parseFloat(textItem)
        }

        arr.push(new tableItem({key: this.cleanedProps[idx], value: formattedValue, type: this.getValueType(textItem)}))
      })
      
      console.log('arr: ', arr)
      return arr
    })

    return json
  }

  cleanString(str: string) : string {
    return str.split('"').join('')
  }

  private getValueType(value: string) : string | number | Date {
    let valueType = null
    if(isNaN(value)) {
      if(typeof Date.parse(value) === 'number') {
        valueType = 'date'
      } else {
        valueType = 'string'
      }
    } else if(!isNaN(parseInt(value))) {
      valueType = 'number'
    }
    return valueType
  }

  private formatDate(date: string) : string {
    return new Intl.DateTimeFormat('nl-NL').format(new Date(date)) || date.toString()
  }

  public filterOnIssueCount() : void {
    const issueCount: any = document.querySelector('#minimalIssues');


    this.filteredFileContent = this.fileContent.filter((item: tableItem[]) => {
      const arr = []
      item.forEach((it: tableItem) => {
        if(it.key === 'Issue count' && !isNaN(parseInt(it.value)) && parseInt(it.value) >= issueCount) {
           arr.push(it)
        }
      }) 
      console.log('arr: ', arr)
      return arr
    })

    console.log('filteredFileContent: ', this.filteredFileContent)
  }
}
