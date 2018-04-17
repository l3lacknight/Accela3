function isTaskStatus(wfstr,wfstat,capId) {
   var workflowResult = aa.workflow.getTasks(capId);
   if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { 
        ELPLogging.notify(errorPrefix + ": Failed to get workflow object: " + s_capResult.getErrorMessage()); 
        return false; 
    }
    
    for (i in wfObj)
    {
        fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()))
        {
            if (fTask.getDisposition()!=null)
            {
                if (fTask.getDisposition().toUpperCase().equals(wfstat.toUpperCase()))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
    }
    return false;
}