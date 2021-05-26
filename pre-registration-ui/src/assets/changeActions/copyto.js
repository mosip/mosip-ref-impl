const copyto = async (context, args, uiField) => {
  console.log("copyto called: " + uiField.id);
  if (args.length == 3) {
    let control1 = args[0],
      control2 = args[1],
      checkboxId = args[2];
    let checkboxVal = context.userForm.controls[`${checkboxId}`].value;
    if (checkboxVal == true) {
      let filteredList1 = context.uiFields.filter(
        (uiField) => uiField.id == control1
      );
      let filteredList2 = context.uiFields.filter(
        (uiField) => uiField.id == control2
      );
      if (filteredList1.length > 0 && filteredList2.length > 0) {
        let uiField1 = filteredList1[0];
        let uiField2 = filteredList2[0];
        if (
          context.isControlInMultiLang(uiField1) &&
          context.isControlInMultiLang(uiField2)
        ) {
          context.dataCaptureLanguages.forEach((language, i) => {
            const fromId = uiField1.id + "_" + language;
            const fromFieldValue = context.userForm.controls[fromId].value;
            const toId = uiField2.id + "_" + language;
            context.userForm.controls[toId].setValue(fromFieldValue);
          });
        } else {
          if (
            !context.isControlInMultiLang(uiField1) &&
            !context.isControlInMultiLang(uiField2)
          ) {
            const fromFieldValue = context.userForm.controls[uiField1.id].value;
            if (
              uiField2.controlType == "dropdown" ||
              uiField2.controlType == "button"
            ) {
              //context.dropdownApiCall(uiField2.id);
              //context.userForm.controls[uiField2.id].setValue(fromFieldValue);
              let promisesResolved = [];
              if (context.isThisFieldInLocationHeirarchies(uiField2.id)) {
                const locationIndex = context.getIndexInLocationHeirarchy(
                  uiField2.id
                );
                const parentLocationName = context.getLocationNameFromIndex(
                  uiField2.id,
                  locationIndex - 1
                );
                if (parentLocationName) {
                  let locationCode = context.userForm.controls[parentLocationName].value;
                  if (locationCode) {
                    context.selectOptionsDataArray[uiField2.id] = [];
                    promisesResolved.push(context.loadLocationData(locationCode, uiField2.id));
                  }
                }
                await Promise.all(promisesResolved).then((values) => {
                  context.userForm.controls[uiField2.id].setValue(fromFieldValue);
                  console.log(context.userForm.controls[uiField2.id].value);
                  return;
                });
              }
            } else {
              context.userForm.controls[uiField2.id].setValue(fromFieldValue);
            }
          }
        }
      }
    }
  } else {
    console.log("Invalid number of argumments sent to 'copyto' changeAction.");
  }
};
export default copyto;
