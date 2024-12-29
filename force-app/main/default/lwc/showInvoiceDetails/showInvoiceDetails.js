import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import createDynamicQuery from '@salesforce/apex/InvoiceGenerateHelper.createDynamicQuery';
import getMetadataRecords from '@salesforce/apex/InvoiceGenerateHelper.getMetadataRecords';
import createInvoiceLineItemRecords from '@salesforce/apex/InvoiceGenerateHelper.createInvoiceLineItemRecords';
import { createRecord } from "lightning/uiRecordApi";


export default class ShowInvoiceDetails extends NavigationMixin(LightningElement) {

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
    newinvoiceLineItemMap = {};
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
                    this.newinvoiceLineItemMap[record.URL_Param__c] = record.Invoice_Line_Item_Field__c;
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

    // Method to generate JSON Data
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
            this.newchildFields.forEach((urlField) =>
                childrecord[this.newinvoiceLineItemMap[urlField]] = record[this.urlData[urlField]]
            );
            this.invoice.lineItems.push(childrecord);
        });

        this.jsonData = JSON.stringify(this.invoice, null, 2); 

    }

    // Method to crearte Invoice and Invoice Line item Records
    async handleInvoiceCreation() {
        const invoiceCopy = {...this.invoice};

        const invoiceDate = invoiceCopy.Invoice_Date__c;
        const [day, month, year] = invoiceDate.split('/');
        invoiceCopy.Invoice_Date__c = `${year}-${month}-${day}`;

        const invoiceDueDate = invoiceCopy.Due_Date__c;
        const [day2, month2, year2] = invoiceDueDate.split('/');
        invoiceCopy.Due_Date__c = `${year2}-${month2}-${day2}`;
        
        var lineItems = invoiceCopy.lineItems;
        delete invoiceCopy.lineItems;

        const recordInput = { apiName: 'Invoice__c', fields : invoiceCopy };
        // creating Invoice record here
        createRecord(recordInput).then((record) => {
            
            console.log(record);
            // Populating Invoice Id on Line item records before insertion
            const invoiceLineItems = lineItems.map((lineItem) => {
                return { ...lineItem, Invoice__c: record.id };
            });
            // Creating Invoice Line Item records
            createInvoiceLineItemRecords({ lineItems: invoiceLineItems })
            .then(() => {
                console.log('Records inserted successfully');
                // Navigation to Invoice record Page
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: record.id,
                        objectApiName: 'Invoice__c',
                        actionName: 'view',
                    },
                });
            })
            .catch((error) => {
                console.error('Error inserting records:', error);
            });
        }).catch(error => {
            console.log(error);
        });

      }

}