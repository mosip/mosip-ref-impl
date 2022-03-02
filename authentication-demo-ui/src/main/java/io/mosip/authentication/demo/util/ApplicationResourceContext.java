package io.mosip.authentication.demo.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.ResourceBundle;

public class ApplicationResourceContext {

    String applicatioLanguage;
    ResourceBundle labelBundle;

    private static ApplicationResourceContext context;
    private ApplicationResourceContext() {

    }

    private void loadResource(){
        Locale applicationPrimaryLanguageLocale = new Locale(applicatioLanguage != null ? applicatioLanguage.substring(0, 2) : "en");
        labelBundle = ResourceBundle.getBundle("labels", applicationPrimaryLanguageLocale);
    }
    public static ApplicationResourceContext getInstance() {
        if(context == null) {
            context = new ApplicationResourceContext();
            return context;
        } else {
            return context;
        }
    }

    public ResourceBundle getLabelBundle() {
        return labelBundle;
    }

    public void setApplicatioLanguage(String applicatioLanguage) {
        this.applicatioLanguage = applicatioLanguage;
        loadResource();
    }
}
