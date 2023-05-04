import {Component, Input, OnInit} from '@angular/core';
import {parseString} from "xml2js";
import {NgxCsvParser, NgxCSVParserError} from "ngx-csv-parser";
import * as XLSX from "xlsx";


type FileMetaData = {
  fileUrl : string,
  fileExtension : string

}

@Component({
  selector: 'app-file-parsers',
  templateUrl: './file-parsers.component.html',
  styleUrls: ['./file-parsers.component.scss']
})
export class FileParsersComponent  implements OnInit {

  arrayBuffer:any;
  xmlJsonSet! : Set<any>
  xmlSting! : string
  xlsxJson! : any[]
  csvJson! : any[]

  @Input('file') file? : File

  @Input('fileMetaData') fileMetaData? : FileMetaData;


  constructor(private ngxCsvParser: NgxCsvParser) {
  }

  ngOnInit(): void {
    this.xmlJsonSet = new Set<any>();
    console.log(this.fileMetaData?.fileUrl);
    if(this.fileMetaData?.fileUrl)
      this.getFileFromUrl()?.then(res => res.blob()) // Gets the response and returns it as a blob
        .then(blob => {
          console.log(blob);
          this.file = new File([blob], blob.name);
          this.parseFile(this.fileMetaData?.fileExtension || '');
        });

    this.parseFile(this.file?.type || '');
  }


  parseCsv(csvFile : File) {
    this.ngxCsvParser.parse(csvFile, {header: true, delimiter:',', encoding: 'utf8'})
      .pipe().subscribe({
      next: (result): void => {
        console.log('Result', result);
        this.csvJson = result as any[];
      },
      error: (error: NgxCSVParserError): void => {
        console.log('Error', error);
      }
    });
  }
  parseXml(xmlFile : File) {

    let fileReader = new FileReader();


    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;

      this.xmlSting = new TextDecoder().decode(this.arrayBuffer);

      parseString(this.xmlSting,{explicitArray: false}, (err, result)=>{
        this.xmlJsonSet = this.iterate(result,new Set<any>)
        console.log(this.xmlJsonSet);
        if(err)
          console.log(err);
      })
    }
    fileReader.readAsArrayBuffer(xmlFile);
  }

  parseXlsx(xlsxFile : File) {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      let data = new Uint8Array(this.arrayBuffer);
      let arr = [];
      for(let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      let bstr = arr.join("");
      let workbook = XLSX.read(bstr, {type:"binary"});
      let first_sheet_name = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[first_sheet_name];
      this.xlsxJson = XLSX.utils.sheet_to_json(worksheet,{raw:true});
    }
    fileReader.readAsArrayBuffer(xlsxFile);
  }

   iterate = (obj : any, set : Set<any>) => {
    Object.keys(obj).forEach(key => {


      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.iterate(obj[key], set)
      }
      else
        set.add(obj)
    })
     return set;
  }

  parseFile(fileType : string){
    if(this.file) {
      console.log(this.file)
      console.log(fileType);
      switch (fileType) {
        case 'csv':
          this.parseCsv(this.file);
          break;
        case 'xlsx':
          this.parseXlsx(this.file);
          break;
        case 'xml':
          this.parseXml(this.file);
          break;
      }
      return;
    }
  }

  extractColumns(arr : {}[] ) {
    if(arr)
    return arr.length ?Object.keys(arr[0]):[]
    return []
  }

  toArray(set : Set<any>){
    return Array.from(set)
  }

  getObjectValues(object : {}){
    return Object.values(object);
  }

  getFileFromUrl(){
    if(this.fileMetaData?.fileUrl)
      return fetch(this.fileMetaData?.fileUrl)
    return null;
  }

}
