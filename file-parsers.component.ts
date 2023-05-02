import { Component } from '@angular/core';
import {parseString} from "xml2js";
import {NgxCsvParser, NgxCSVParserError} from "ngx-csv-parser";
import * as XLSX from "xlsx";
@Component({
  selector: 'app-file-parsers',
  templateUrl: './file-parsers.component.html',
  styleUrls: ['./file-parsers.component.scss']
})
export class FileParsersComponent {

  arrayBuffer:any;


  constructor(private ngxCsvParser: NgxCsvParser) {
  }

  parseCsv(e : any) {
    const csvFile = e.target['files'][0];
    console.log(csvFile);
    this.ngxCsvParser.parse(csvFile, {header: true, delimiter:',', encoding: 'utf8'})
      .pipe().subscribe({
      next: (result): void => {
        console.log('Result', result);
      },
      error: (error: NgxCSVParserError): void => {
        console.log('Error', error);
      }
    });
  }
  parseXml(e : any) {
    const xmlStr = `
 <?xml version="1.0" encoding="UTF-8"?>
<excel_data>
  <row>
    <السنة>2015.0</السنة>
    <اسم_الدورة>مدير طاقة معتمد </اسم_الدورة>
    <اسم_المختصر_للدورة>CEM </اسم_المختصر_للدورة>
    <عدد_المعتمدين>17.0</عدد_المعتمدين>
  </row>
  </excel_data>

`
    let fileReader = new FileReader();

    const xmlFile = e.target['files'][0];
    console.log(xmlFile);

    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;

      let str = new TextDecoder().decode(this.arrayBuffer);

      parseString(str, (err, result)=>{
        console.log(result);
        if(err)
          console.log(err);
      })
    }
    fileReader.readAsArrayBuffer(xmlFile);
  }

  parseXlsx(e : any) {
    let fileReader = new FileReader();
    const XlsxFile = e.target['files'][0]
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      let data = new Uint8Array(this.arrayBuffer);
      let arr = [];
      for(let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      let bstr = arr.join("");
      let workbook = XLSX.read(bstr, {type:"binary"});
      let first_sheet_name = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[first_sheet_name];
      console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
    }
    fileReader.readAsArrayBuffer(XlsxFile);
  }
}
