Two new custom object : 
1. Invoice
2. Invoice Line Item


Phase 1 : 
- One Lightning App page is created named as Invoice Generator
- The page has been added in Sale App
- One new custom field has been created on Opportunity Object.
    - Invoice Due Date
- One LWC component has been used on Invoice Generator page.
- On Opportunity object one button is created with the URL format given in requirement.
- The button name is "Show Invoices"



Phase 2 :
- Added one button 'SHOW JSON' on component.
- Added one more card on component to show JSON data for which invoice will be created.
- Created one Custom Metadata to store URL params field mapping with Invoice & Invoice Line Item object
- Added one Apex Class - InvoiceGenerateHelper, which is querying the data by creating dynamic Query and also responsible for returning  custom metadata records.



Phase 3 :
- Used uiRecordApi to create Invoice Record 
- Then created a method in InvoiceGenerateHelper to insert invoice line item records
- Used the method to pass inovice line item records with it's parent it
- After successfull insertion User is being redirected to newly created invoice record page