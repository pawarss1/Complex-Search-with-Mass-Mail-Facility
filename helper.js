({
    sortData: function (component, fieldName, sortDirection) {
        var data = component.get("v.Candidatedata");
        var reverse = sortDirection !== 'asc';
        data.sort(this.sortBy(fieldName, reverse));
        component.set("v.Candidatedata", data);
    },
    sortBy: function (field, reverse, primer) {
        var key = primer ?
            function(x) {return primer(x[field])} :
        function(x) {return x[field]};
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    },
    goToRecord : function(component, row) {
        if(row != undefined){        
            window.open('/' + row.Id,'_blank');
        }        
    },
    viewresume : function(component, row){
        var modalBody;
        $A.createComponent("c:ResumeViewModal", {"resumeLink":row.Resume__c},
                           function(content, status) {
                               if (status === "SUCCESS") {
                                   modalBody = content;
                                   component.find('overlayval').showCustomModal({
                                       header: $A.get("$Label.c.Resume"),
                                       body: modalBody, 
                                       showCloseButton: true,
                                       closeCallback: function() {
                                       }
                                   })
                               }                               
                           });
    },
    SubmitCandidate : function(component, row, helper){
        component.set("v.IsSpinner",true);
        var action = component.get("c.createjobapplication");
        component.set("v.selectedCandidates", row);
        action.setParams({
            "candidate": component.get("v.selectedCandidates"),
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
                helper.displayobject(component, event,component.get("v.masterdata")); 
                component.set("v.typePicklist",outputresponse.typePicklist);
                component.set("v.locationPicklist",outputresponse.LocationPicklist);
                component.set("v.filters",false);
            }  
            component.set("v.IsSpinner",false);
        });
        $A.enqueueAction(action);
    },
    updateselectedrows : function(component, event){
        var allRows = event.getParam('selectedRows');   
        var currentPageNumber = component.get("v.pageNumber");
        var selectrows = component.get("v.selectedCandidates");
        if((selectrows.length-1)>currentPageNumber){
            if(selectrows[currentPageNumber+1].pageNo===currentPageNumber){
                selectrows[currentPageNumber+1].objList = allRows;   
            }else{
                var objwrap = {
                    pageNo : currentPageNumber,
                    objList  : allRows 
                };
                selectrows.push(objwrap);
            }
        }else{
            var objwrap = {
                pageNo : currentPageNumber,
                objList  : allRows 
            };
            selectrows.push(objwrap);
        }
        if(selectrows!=undefined)
            component.set("v.selectedCandidates",selectrows);
        var activerows = [];
        for(var i=0; i<allRows.length; i++){
            activerows.push(allRows[i].Id);
        }
        if(activerows.length>0){
            component.find("candidatetable").set("v.selectedRows",activerows);
        }
    },
    displayselectobjectrows : function(component, event){
        var currentPageNumber = component.get("v.pageNumber");
        var allSelectedRows = component.get("v.selectedCandidates");
        var newrows=[];
        if(allSelectedRows.length>0){
            for(var i=0; i<allSelectedRows.length; i++){
                if(allSelectedRows[i].pageNo==currentPageNumber){
                    newrows = allSelectedRows[i].objList;
                }
            }
        }
        var activerows = [];
        for(var i=0; i<newrows.length; i++){
            activerows.push(newrows[i].Id);
        }
        if(activerows.length>0){
            component.find("candidatetable").set("v.selectedRows",activerows);
        }
    },
    displayobject: function (component, event, listdata) {
        var disp = [];
        if(listdata!=undefined && listdata.length>0){
            var activities = listdata;
            var pageno = component.get("v.pageNumber");
            var pagesizeval = component.get("v.pageSize");
            var initialval = pageno*pagesizeval;
            var finalval = initialval+pagesizeval;
            if(finalval-1>=activities.length){
                component.set("v.isLastPage",true);
                finalval = activities.length;
            }else{
                component.set("v.isLastPage",false);
            }
            
            for(var i=initialval; i<finalval; i++){
                disp.push(activities[i]);
            }
            component.set("v.maxsize",finalval);
            component.set("v.Candidatedata",disp);
        }else{
            component.set("v.Candidatedata",disp);
        }
    },
    openmodal: function (component, event, helper) {
        var cmpTarget = component.find('Modalbox');
        var cmpBack = component.find('Modalbackdrop');
        $A.util.addClass(cmpTarget, 'slds-fade-in-open');
        $A.util.addClass(cmpBack, 'slds-backdrop--open');
    },
    masssendemail : function(component, event, helper, getbody, getSubject){
        component.set("v.IsSpinner",true);
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
                action.setParams({
                    "candidate": selvalues,
                    "jobId" : component.get("v.recordId"),
                    "allcandidates": component.get("v.allcandidatescheck"),
                    "mBody": getbody,
                    "mSubject": getSubject,
                    "fileIdlist": component.get("v.fileIdlist"),
                    "displayCandName": component.get("v.displayCandName")
                });
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if (state === "SUCCESS") 
                    {
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            title : $A.get("$Label.c.Success_Message"),
                            message:$A.get("$Label.c.MassEmailSuccess"), 
                            duration:'5000',
                            key: 'info_alt',
                            type: 'success',
                            mode: 'dismissible'
                        });
                        toastEvent.fire();
                        window.location.reload();
                    }  
                    component.set("v.IsSpinner",false);
                });
                $A.enqueueAction(action);
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
    getEmailTemplateHelper: function (component, event) {
        var action = component.get("c.getEmailTempaltes");
        action.setParams({
            "jobId" : component.get("v.recordId"),
        });
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS" && response.getReturnValue() != null) {
                component.set("v.emailfolderVSTemplateList", response.getReturnValue());
                var emailfolderVSTemplateList = component.get("v.emailfolderVSTemplateList");
                component.set('v.folderId1', emailfolderVSTemplateList[0].folderId);
                component.set("v.emailTemplateList", emailfolderVSTemplateList[0].emailtemplatelist);
                component.set("v.jobRec", emailfolderVSTemplateList[0].jobRecord);
            }
            
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        
        $A.enqueueAction(action);
        
    },
    getLabelValues : function(component, emailBody, emailSubject) {
        var emailBodyLabel = $A.get("$Label.c.MassCandidateEmailBody");
        var emailSalutationLabel = $A.get("$Label.c.MassEmailCandidateSalutation");
        emailBody = emailBody.replace("{!$Label.MassEmailCandidateSalutation}", emailSalutationLabel);
        emailBody = emailBody.replace("{!$Label.MassCandidateEmailBody}", emailBodyLabel);
        component.set("v.emailbody", emailBody);
    }
});
