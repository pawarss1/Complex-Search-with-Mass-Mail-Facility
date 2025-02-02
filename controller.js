({
    doinit : function(component, event, helper)
    {
        component.set("v.IsSpinner",true);
        var PaginationSize = $A.get("$Label.c.PaginationSize");
        component.set("v.pageSize", parseInt(PaginationSize));
        var actions = [{variant:'bare', label:"View", title:"View Candidate", name: 'View', iconName: 'utility:preview'}];
        actions.push({variant:'bare', label:"Add Candidate", title:"Add Candidate", name: 'AddCandidate', iconName: 'utility:adduser'});
        //actions.push({variant:'bare', label:"Submit Candidate", title:"Submit Candidate", name: 'SubmitCandidate', iconName: 'utility:privately_shared'});
        component.set("v.selectedCandidates", "[]");
        component.set('v.columns', [
            {label: 'Name', fieldName: 'Name', type: 'text', sortable : true},
            {label: 'Email ID', fieldName: 'Email__c', type: 'email', sortable : true},
            {label: 'Phone Number', fieldName: 'Primary_Phone__c', type: 'phone', sortable : true},
            {label: 'Location', fieldName: 'Current_Location__c', type: 'text', sortable : true},
            {label: 'Status', fieldName: 'Candidate_Status__c', type: 'text', sortable : true},
            {label: 'Experience', fieldName: 'Total_Experience__c', type: 'number', sortable : true},
            {label: 'Resume', type: 'button-icon', typeAttributes: {iconPosition:"left", variant:'bare', title:"Resume", name: 'Resume', iconName: 'utility:description', disabled: { fieldName: 'IsResumeAvailable__c'}}},
            {type: 'action', typeAttributes: {rowActions: actions}},
            /*{type: 'button-icon', typeAttributes: {variant:'bare', title:"Submit Candidate", name: 'SubmitCandidate', iconName: 'utility:adduser'}}*/
        ]);
            var minexpval = [];
                      minexpval.push('--None--');
        for(var i=0; i<21; i++){
            minexpval.push(i);
        }
        component.set("v.minexp",minexpval);
        var maxexpval = [];
        maxexpval.push('--None--');
        for(var i=1; i<51; i++){
            maxexpval.push(i);
        }
        component.set("v.maxexp",maxexpval);
        var action = component.get("c.getskilledCandidate");
        action.setParams({
            "recordidval": component.get("v.recordId")
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            var outputresponse = response.getReturnValue();
            if (state === "SUCCESS" && outputresponse!=null) 
            {   
                component.set("v.masscandidates",outputresponse.massEmailCompleted);
                component.set("v.masterdata",outputresponse.candidatelist);
                component.set("v.fulldata",outputresponse.candidatelist);
                helper.displayobject(component, event, component.get("v.masterdata"));
                component.set("v.typePicklist",outputresponse.typePicklist);
                component.set("v.locationPicklist",outputresponse.LocationPicklist);               
            }  
            component.set("v.IsSpinner",false);
        });
        $A.enqueueAction(action);
    },
    handleKeyUp: function (component, event, helper) {
        var isEnterKey = event.which === 13;
        if (isEnterKey)
        {
            component.set("v.issearching",true);
            var queryTerm = component.find('enter-search').get('v.value');
            if(queryTerm!=undefined && queryTerm!=''){
                var action = component.get("c.resultCandidate");
                action.setParams({
                    "searchkey": queryTerm
                });
                action.setCallback(this, function(response){
                    var state = response.getState();
                    var outputresponse = response.getReturnValue();
                    if (state === "SUCCESS") 
                    {
                        component.set("v.masterdata",outputresponse.candidatelist);
                        component.set("v.fulldata",outputresponse.candidatelist);
                        component.set("v.pageNumber",0);
                        helper.displayobject(component, event, component.get("v.masterdata")); 
                        component.set("v.selectedCandidates","[]");
                        component.set("v.typePicklist",outputresponse.typePicklist);
                        component.set("v.locationPicklist",outputresponse.LocationPicklist);
                        component.set("v.issearching",false);
                        component.set("v.filters",true);
                    }  
                });
                $A.enqueueAction(action);   
            }else{
                var action = component.get("c.getskilledCandidate");
                action.setParams({
                    "recordidval": component.get("v.recordId")
                });
                action.setCallback(this, function(response){
                    var state = response.getState();
                    var outputresponse = response.getReturnValue();
                    if (state === "SUCCESS") 
                    {
                        component.set("v.masterdata",outputresponse.candidatelist);
                        component.set("v.fulldata",outputresponse.candidatelist);
                        component.set("v.pageNumber",0);
                        helper.displayobject(component, event, component.get("v.masterdata")); 
                        component.set("v.typePicklist",outputresponse.typePicklist);
                        component.set("v.locationPicklist",outputresponse.LocationPicklist);
                        component.set("v.issearching",false);
                        component.set("v.filters",false);
                    }  
                });
                $A.enqueueAction(action);
            }
        }
        
    },
    onChangeVal:function (component, event, helper) 
    {
        var action = component.get("c.filterdata");
        var candidlist = [];
        var candlistval = component.get("v.fulldata");
        
        for(var i=0; i<candlistval.length; i++){
            candidlist.push(candlistval[i].Id);
        }
        
        var maxvalue;
        if(component.get("v.maxexpvalue")!='--None--')
            maxvalue = component.get("v.maxexpvalue");
        var minvalue;
        if(component.get("v.minexpvalue")!='--None--')
            minvalue = component.get("v.minexpvalue");
        var location='';
        if(component.get("v.locationValue")!='--None--')
            location = component.get("v.locationValue");
        var typevalnew='';
        if(component.get("v.typeValue")!='--None--')
            typevalnew = component.get("v.typeValue");
        component.set("v.IsSpinner",true);
        action.setParams({
            "candIdList": candidlist,
            "minval": minvalue,
            "maxval": maxvalue,
            "loc" : location,
            "typeval":typevalnew
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            var outputresponse = response.getReturnValue();
            if (state === "SUCCESS") 
            {
                component.set("v.masterdata",outputresponse.candidatelist);
                component.set("v.pageNumber",0);
                helper.displayobject(component, event, component.get("v.masterdata"));
                component.set("v.IsSpinner",false);
            }  
        });
        $A.enqueueAction(action);
    },
    selectallcandidates : function (component, event, helper) {
        if(!component.get("v.allcandidates"))
            component.set("v.allcandidatescheck",true);
        else
            component.set("v.allcandidatescheck",false);
    },
    handleColumnSorting: function (component, event, helper) {
        var fieldName = event.getParam('fieldName');
        var sortDirection = event.getParam('sortDirection');
        component.set("v.sortBy", fieldName);
        component.set("v.sortDirection", sortDirection);
        helper.sortData(component, fieldName, sortDirection);
    },
    handleRowAction: function (component, event, helper) {
        var action = event.getParam('action');
        var row = event.getParam('row');  
        switch (action.name) {
            case 'View':
                helper.goToRecord(component, row)
                break;
            case 'Resume':
                helper.viewresume(component, row)
                break;
            case 'AddCandidate':
                helper.SubmitCandidate(component, row, helper)
                break;
        }
    },
    selectcandidatemethod : function (component, event, helper) {
        if(!component.get("v.Pagechange")){
            helper.updateselectedrows(component, event);
        }else{
            component.set("v.Pagechange",false);
        }
    },
    submittedcandidate : function (component, event, helper){
        component.set("v.IsSpinner",true);
        var selectedlistval = component.get("v.selectedCandidates");
        if(selectedlistval!=undefined){
            var selvalues=[];
            for(var i=0; i<selectedlistval.length; i++){
                selvalues.push.apply(selvalues, selectedlistval[i].objList);
            }
            
            if(selvalues.length<=0){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title : $A.get("$Label.c.Error_Message"),
                    message:$A.get("$Label.c.JobApplicationValidation"), 
                    duration:'5000',
                    key: 'info_alt',
                    type: 'error',
                    mode: 'dismissible'
                });
                toastEvent.fire();
                component.set("v.IsSpinner",false);
            }else{
                var action = component.get("c.createjobapplication");
                console.log(JSON.stringify(selvalues));
                action.setParams({
                    "candidate": selvalues,
                    "jobId" : component.get("v.recordId"),
                    "operationType" : $A.get("$Label.c.Add_Candidate")
                });
                action.setCallback(this, function(response){
                    var state = response.getState();
                    var outputresponse = response.getReturnValue();
                    if (state === "SUCCESS" && outputresponse!=undefined) 
                    {
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            title : $A.get("$Label.c.Success_Message"),
                            message:$A.get("$Label.c.JobApplicationSuccess"), 
                            duration:'5000',
                            key: 'info_alt',
                            type: 'success',
                            mode: 'dismissible'
                        });
                        toastEvent.fire();
                        component.set("v.masterdata",outputresponse.candidatelist);
                        component.set("v.fulldata",outputresponse.candidatelist);
                        component.set("v.pageNumber",0);
                        helper.displayobject(component, event, component.get("v.masterdata")); 
                        component.set("v.typePicklist",outputresponse.typePicklist);
                        component.set("v.locationPicklist",outputresponse.LocationPicklist);
                        component.set("v.filters",false);
                    }  
                    component.set("v.IsSpinner",false);
                });
                $A.enqueueAction(action);
            }
        }else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title : $A.get("$Label.c.Error_Message"),
                message:$A.get("$Label.c.JobApplicationValidation"), 
                duration:'5000',
                key: 'info_alt',
                type: 'error',
                mode: 'dismissible'
            });
            toastEvent.fire();
            component.set("v.IsSpinner",false);
        }
    },
    massemail : function (component, event, helper){
        if(component.get("v.masscandidates")){
            if (confirm($A.get("$Label.c.MassCandidateConfirmation"))){
                var getSubject = component.get("v.subject");
                var getbody = component.get("v.emailbody");
                helper.masssendemail(component, event, helper, getbody, getSubject);
            }
        }else{
            if(confirm($A.get("$Label.c.MassCandidateConfirmationnew"))){
                var getSubject = component.get("v.subject");
                var getbody = component.get("v.emailbody");
                helper.masssendemail(component, event, helper, getbody, getSubject);
            }
        }
    },
    massemailFlagMethod : function (component, event, helper){
        var flag = component.get("v.massCandidateFlag");
        flag = !flag;
        component.set("v.massCandidateFlag", flag);
        component.set("v.addCandidateFlag", false);
        var selectedlistval = component.get("v.selectedCandidates");
        if(selectedlistval!=undefined || component.get("v.allcandidatescheck")){
            var selvalues=[]
            for(var i=0; i<selectedlistval.length; i++){
                selvalues.push.apply(selvalues, selectedlistval[i].objList);
            }
            if(selvalues.length>0 || component.get("v.allcandidatescheck")){
                var action = component.get("c.sendmassemail");
                if(component.get("v.allcandidatescheck"))
                    selvalues = component.get("v.masterdata");
            }
            component.set("v.massEmailCandidates", selvalues);
            component.set("v.email", selvalues.length);
            helper.getEmailTemplateHelper(component, event);
            helper.openmodal(component, event, helper);
        }
        else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title : $A.get("$Label.c.Error_Message"),
                message:$A.get("Please select atleast one candidate"), 
                duration:'5000',
                key: 'info_alt',
                type: 'error',
                mode: 'dismissible'
            });
            toastEvent.fire();
        }
    },
    handleNext : function (component, event, helper) {
        if(component.get("v.masterdata")!=undefined && component.get("v.masterdata").length>0){
            var pageNumber = component.get("v.pageNumber");
            component.set("v.pageNumber", pageNumber+1);
            if(component.get("v.selectedCandidates").length>0){
                component.set("v.Pagechange",true);
            }
            helper.displayobject(component, event, component.get("v.masterdata"));
            helper.displayselectobjectrows(component, event);
        }
    },
    
    handlePrev : function(component, event, helper) {  
        if(component.get("v.masterdata")!=undefined && component.get("v.masterdata").length>0){
            var pageNumber = component.get("v.pageNumber");
            component.set("v.pageNumber", pageNumber-1);
            if(component.get("v.selectedCandidates").length>0){
                component.set("v.Pagechange",true);
            }
            helper.displayobject(component, event, component.get("v.masterdata"));
            helper.displayselectobjectrows(component, event);
        }
    },
    closeModal: function (component, event, helper) {
        $A.get('e.force:refreshView').fire();
    },
    
    closeMessage: function (component, event, helper) {
        component.set("v.mailStatus", false);
        component.set("v.massCandidateFlag", false);
        component.set("v.email", null);
        component.set("v.subject", null);
        component.set("v.emailbody", null);
        component.set("v.addCandidateFlag", true);
        $A.get('e.force:refreshView').fire();
    },
    
    onSelectEmailTemplate: function (component, event, helper) {
        var emailTempId = event.target.value; 
        var emailbody = '';
        var emailSubject = '';
        var jobRec;
        component.set("v.templateIDs", emailTempId);
        if (emailTempId != null && emailTempId != '' && emailTempId != 'undefined') {
            var emailTemplateList = component.get("v.emailTemplateList");
            emailTemplateList.forEach(function (element) {
                if (element.emailTemplateId == emailTempId && element.emailbody != null) {
                    emailbody = element.emailbody;
                    emailSubject = element.emailSubject;
                }
            });
        }
        var jobRec = component.get("v.selectedRecordWithAllDetails");
        var displayCandList = component.get("v.massEmailCandidates");
        
        helper.getLabelValues(component, emailbody, emailSubject);
        var jobDesc = jobRec.Job_Description__c;
        emailbody = component.get("v.emailbody");
        if(displayCandList.length > 0){
        	emailbody = emailbody.replace("{!relatedTo.Name},", displayCandList[0].Name+',');
            component.set("v.displayCandName", displayCandList[0].Name);
        }
        else{
            emailbody = emailbody.replace("{!relatedTo.Name},", "Candidate Name,");
        }
        emailbody = emailbody.replace("@jobname@.", jobRec.Name+'.');
        if(jobDesc != null && jobDesc != '' && jobDesc != 'undefined'){
            emailbody = emailbody.replace("@jobdesc@", jobRec.Job_Description__c);
        }
        else{
            emailbody = emailbody.replace("@jobdesc@", jobRec.Name);
        }
        
        emailSubject = emailSubject.replace("@jobname@", jobRec.Name);
        component.set("v.subject", emailSubject);
        component.set("v.emailbody", emailbody);
    },
    handleUploadFinished : function(component, event, helper) {
        var uploadedFiles = event.getParam("files");
        var filesval = [];
        var fileIdset = [];
        for(var i=0; i<uploadedFiles.length; i++){
            filesval.push({'Id' : uploadedFiles[i].documentId,
                           'Title': uploadedFiles[i].name});
            fileIdset.push(uploadedFiles[i].documentId);
        }
        component.set("v.filelist",filesval);
        component.set("v.fileIdlist",fileIdset);
        //Show success message – with no of files uploaded
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Success!",
            "type" : "success",
            "message": uploadedFiles.length+" files has been attached successfully!"
        });
        toastEvent.fire();
    },
    handleRemove : function(component, event, helper) {
        var contentfile = event.getSource().get("v.name");
        var filenewlist = component.get("v.filelist");
        var data = [];
        var dataval = [];
        var dataId = [];
        for(var i=0; i<filenewlist.length; i++){
            if(filenewlist[i].Id==contentfile){
                data.push(filenewlist[i].Id);
            }else{
                dataval.push(filenewlist[i]);
                dataId.push(filenewlist[i].Id);
            }
        }
        component.set("v.filelist",dataval);
        component.set("v.fileIdlist",dataId);
        var action = component.get("c.removeAttachments");
        action.setParams({
            "documentList": data
        })
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "type" : "success",
                    "message": "File has been removed successfully!"
                });
                toastEvent.fire();
            }
        });     
        $A.enqueueAction(action);
    },
     handleComponentEvent : function(component, event, helper) {
        // get the selected Account record from the COMPONETN event 	 
        var selectedAccountGetFromEvent = event.getParam("recordByEvent");
        component.set("v.selectedRecord" , selectedAccountGetFromEvent);
        var action = component.get("c.fetchJobRec");
        action.setParams({
            "jobId": selectedAccountGetFromEvent.Id
        })
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === "SUCCESS"){
                var outputresponse = response.getReturnValue();
                component.set("v.selectedRecordWithAllDetails", outputresponse);
            }
            else{
                alert("Error in the server call");
            }
    	});
         $A.enqueueAction(action);
     }
  
})
