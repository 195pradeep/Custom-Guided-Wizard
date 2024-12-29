public with sharing class InvoiceGenerateHelper {


    @AuraEnabled(cacheable=true)
    public static List<Invoice_Generator_Setting__mdt> getMetadataRecords(){
        try {
            List<Invoice_Generator_Setting__mdt> metadataRecords = Invoice_Generator_Setting__mdt.getAll().values();
            return metadataRecords;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    //Method to identify sobject type from recordId
    public static String getObjectTypeByString(String recordStringId) {

        try {
            if (recordStringId != null && recordStringId != '') {
                Id recordId = Id.valueOf(recordStringId);
                Schema.SObjectType objectType = recordId.getSObjectType();
                Schema.DescribeSObjectResult objectResule = objectType.getDescribe();
                return objectResule.getName();
            }
        } catch(Exception e) {
            return e.getMessage();
        }
        return null;
    }

    public static string getSubQueryForChild(String childRelation, List<String> childFields) {

        return 'SELECT '+String.join(childFields,',') + ' FROM '+childRelation;

    }

    @AuraEnabled
    public static List<SObject> createDynamicQuery(String recordId, String childRelation, List<String> childFields) {

        String objectName = getObjectTypeByString(recordId);
        String query = 'SELECT ('+getSubQueryForChild(childRelation,childFields) + ') FROM ' + objectName + ' WHERE Id = \''+recordId+'\'';
        System.debug(query);
        return Database.query(query);
    }


}