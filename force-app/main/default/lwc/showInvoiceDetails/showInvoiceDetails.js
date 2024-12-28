import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class ShowInvoiceDetails extends LightningElement {

    
    @track tableData = [];
    
    isDataAvailable = true;
    columns = [
        { label : 'key', fieldName: 'key', type: 'text'},
        { label : 'value', fieldName: 'value', type: 'text'}
    ];

    @wire(CurrentPageReference)
    getPageReference(currentPageReference) {
        if (currentPageReference) {
            const urlParams = currentPageReference.state;
            this.tableData = Object.keys(urlParams).map((key) => ({
                key : key.substring(3),
                value: urlParams[key],
            }));
            if(this.tableData.length == 0) {
                this.isDataAvailable = false;
            }
        } else {
            this.isDataAvailable = false;
        }
        
    }

    /*

    @wire(CurrentPageReference)
    setValues(currentPageReference) {
        if (currentPageReference.state.c__accountId) {
            this.origin_record = currentPageReference.state.c__origin_record;
            this.accountId = currentPageReference.state.c__accountId;
            this.invoice_date = currentPageReference.state.c__invoice_date;
            this.invoicde_due_date = currentPageReference.state.c__invoicde_due_date;
            this.child_relationship_name = currentPageReference.state.c__child_relationship_name;
            this.line_item_description = currentPageReference.state.c__line_item_description;
            this.line_item_quantity = currentPageReference.state.c__line_item_quantity;
            this.line_item_unit_price = currentPageReference.state.c__line_item_unit_price;

            //c__origin_record=006NS00000PqQZVYA3&c__accountId=001NS00000rMhpOYAS&c__invoice_date=CloseDate&c__invoicde_due_date=CloseDate&c__child_relationship_name=OpportunityLineItems&c__line_item_description=Testing&c__line_item_quantity=10&c__line_item_unit_price=100


            console.log('origin_record - ',this.origin_record);
            console.log('accountId - ',this.accountId);
            console.log('invoice_date - ',this.invoice_date);
            console.log('invoicde_due_date - ',this.invoicde_due_date);
            console.log('child_relationship_name - ',this.child_relationship_name);
            console.log('line_item_description - ',this.line_item_description);
            console.log('line_item_quantity - ',this.line_item_quantity);
            console.log('line_item_unit_price - ',this.line_item_unit_price);

            
        }
    };*/
}