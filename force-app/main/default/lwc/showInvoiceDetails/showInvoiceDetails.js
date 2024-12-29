import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import createDynamicQuery from '@salesforce/apex/InvoiceGenerateHelper.createDynamicQuery';
import getMetadataRecords from '@salesforce/apex/InvoiceGenerateHelper.getMetadataRecords';

export default class ShowInvoiceDetails extends LightningElement {

    urlData;
    @track tableData = [];
    @track jsonData = null;
    @track recordWithChild;
    @track invoice = {};
    
    newinvoiceFields = [];
    childRelation = 'c__child_relationship_name';
    newchildFields = [];
    childRelationship = '';
    newinvoiceFieldMap = {};
    isDataAvailable = true;
    columns = [
        { label : 'key', fieldName: 'key', type: 'text'},
        { label : 'value', fieldName: 'value', type: 'text'}
    ];

    @wire(getMetadataRecords,{})
    getMetadata({data,error}) {
        
        if(data) {
            data.forEach((record) => {
                if(record.Invoice_Field__c != null) {
                    this.newinvoiceFieldMap[record.URL_Param__c] = record.Invoice_Field__c;
                    this.newinvoiceFields.push(record.URL_Param__c);
                } else if (record.Invoice_Line_Item_Field__c != null) {
                    
                    this.newchildFields.push(record.URL_Param__c);
                }
            })

        } else if (error) {
            console.log(error);
        }

    }

    @wire(CurrentPageReference)
    getPageReference(currentPageReference) {
        if (currentPageReference) {
            const urlParams = currentPageReference.state;
            this.urlData = {...urlParams};
            this.tableData = Object.keys(urlParams).map((key) => ({
                key : key.substring(3),
                value: urlParams[key],
            }));
            if(this.tableData.length == 0) {
                this.isDataAvailable = false;
            } 
            
            this.childRelationship = urlParams[this.childRelation];
            
        } else {
            this.isDataAvailable = false;
        }
        
    }


      async handleShowJson() {
        
        let childFieldsList = [];
        this.newchildFields.forEach((urlField) => {
            childFieldsList.push(this.urlData[urlField]);
        });

        this.newinvoiceFields.forEach(field => {
            this.invoice[this.newinvoiceFieldMap[field]] = this.urlData[field];
        });
        this.recordWithChild = await createDynamicQuery({ recordId: this.urlData['c__origin_record'], childRelation : this.urlData['c__child_relationship_name'], childFields : childFieldsList });
        let childRecords = this.recordWithChild[0][this.childRelationship];

        this.invoice.lineItems = [];
        childRecords.forEach(record => {
            let childrecord = {}
            childFieldsList.forEach((value) =>
                childrecord[value] = record[value]
            );
            this.invoice.lineItems.push(childrecord);
        });

        this.jsonData = JSON.stringify(this.invoice, null, 2); 

    }

}