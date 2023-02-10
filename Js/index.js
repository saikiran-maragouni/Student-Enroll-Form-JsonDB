

let jpdbBaseURL = 'http://api.login2explore.com:5577';
let jpdbIRL = '/api/irl';
let jpbdIML = '/api/iml';
let studentDatabaseName = 'SCHOOL-DB';
let studentRelationName = 'STUDENT-REL';
let connectionToken = '90938715|-31949270473330113|90955019';

$('#Rollno').focus();

//Function to check validity of Enrollment Number
function validateEnrollmentDate() {
    var inputBirthDate = $('#DOB').val();
    var inputEnrollmentDate = $('#enrollmentDate').val();
    inputBirthDate = new Date(inputBirthDate);
    inputEnrollmentDate = new Date(inputEnrollmentDate);
    
    //Enrollment date should be greater than Birth date
    return inputBirthDate.getTime() < inputEnrollmentDate.getTime();

}

//Function for return alter HTML code according to status of response
function alertHandlerHTML(status, message) {
    // 1--> Success , 0--> Warning
    
    if (status === 1) {
        return `<div class="alert  alert-primary d-flex align-items-center alert-dismissible " role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
                <div>
                  <strong>Success!</strong> ${message}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>`;
    } else {
        return `<div class="alert  alert-warning d-flex align-items-center alert-dismissible" role="alert">
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>
        <div>
          <strong>Warning!</strong> ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    }

}

function alertHandler(status, message) {
    var alterHTML = alertHandlerHTML(status, message);
    let alertDiv = document.createElement('div');
    alertDiv.innerHTML = alterHTML;
    $('#disposalAlertContainer').append(alertDiv);
}

function disableAllFeildExceptRollno() {
    $('#fullName').prop('disabled', true);
    $('#class').prop('disabled', true);
    $('#birthDate').prop('disabled', true);
    $('#inputAddress').prop('disabled', true);
    $('#enrollmentDate').prop('disabled', true);
    $('#resetBtn').prop('disabled', true);
    $('#saveBtn').prop('disabled', true);
    $('#updateBtn').prop('disabled', true);
}

function validateData() {
    let rollNo, name, className, birthDate, address, enrollmentData;
    rollNo = $('#Rollno').val();
    name = $('#Studname').val();
    className = $('#class').val();
    birthDate = $('#DOB').val();
    address = $('#Address').val();
    enrollmentData = $('#enrollmentDate').val();

    if (rollNo === '') {
        alertHandler(0, 'Roll NO Missing');
        $('#Rollno').focus();
        return "";
    }

    if (rollNo <= 0) {
        alertHandler(0, 'Invalid Roll-No');
        $('#Rollno').focus();
        return "";
    }

    if (className === '') {
        alertHandler(0, 'Class Name is Missing');
        $('#class').focus();
        return "";
    }
    if (className <= 0 && className > 12) {
        alertHandler(0, 'Invalid Class Name');
        $('#class').focus();
        return "";
    }
    if (birthDate === '') {
        alertHandler(0, 'Birth Date Is Missing');
        $('#DOB').focus();
        return "";
    }
    if (address === '') {
        alertHandler(0, 'Address Is Missing');
        $('#Address').focus();
        return "";
    }
    if (enrollmentData === '') {
        alertHandler(0, 'Enrollment Data Is Missing');
        $('#enrollmentDate').focus();
        return "";
    }

    if (!validateEnrollmentDate()) {
        alertHandler(0, 'Invalid Enrollment Date(i.e Enrollment Date should be greater than Birth Date)');
        $('#enrollmentData').focus();
        return "";
    }

    // if data is valid then create a JSON object otherwise return empty string( which denote that data is not valid )
    let jsonStrObj = {
        id: rollNo,
        name: name,
        className: className,
        birthDate: birthDate,
        address: address,
        enrollmentData: enrollmentData
    };

    //Convert JSON object into string 
    return JSON.stringify(jsonStrObj);
}

function getStudentRollnoAsJsonObj() {
    var rollNO = $('#Rollno').val();
    var jsonStr = {
        id: rollNO
    };
    return JSON.stringify(jsonStr);
}

// Function for save record number into localstorage
function saveRecNoToLocalStorage(jsonObject) {
    var lvData = JSON.parse(jsonObject.data);
    localStorage.setItem('recordNo', lvData.rec_no);
}

function fillData(jsonObject) {
    if (jsonObject === "") {
        $('#Studname').val("");
        $('#class').val("");
        $('#DOB').val("");
        $('#inputAddress').val("");
        $('#Address').val("");
    } else {
        // student record number saved to localstorage
        saveRecNoToLocalStorage(jsonObject);

        // parse json object into JSON
        var data = JSON.parse(jsonObject.data).record;

        $('#Studname').val(data.name);
        $('#class').val(data.className);
        $('#DOB').val(data.birthDate);
        $('#Address').val(data.address);
        $('#enrollmentDate').val(data.enrollmentData);
    }
}
function getStudentRollnoAsJsonObj() {
    var rollNO = $('#Rollno').val();
    var jsonStr = {
        id: rollNO
    };
    return JSON.stringify(jsonStr);
}

function getStudData() {



    if ($('#Rollno').val() === "") { // if roll number is not given then disable all feild
        disableAllFeildExceptRollno();
    } else if ($('#Rollno').val() < 1) { // if roll number is not valid (i.e roll-no <1)
        disableAllFeildExceptRollno();
        alertHandler(0, 'Invalid Roll-No');
        $('#Rollno').focus();
    } else { // if roll number is valid
        let studentRollnoJsonObj = getStudentRollnoAsJsonObj();
        // create GET Request object
        let getRequest = createGET_BY_KEYRequest(connectionToken, studentDatabaseName, studentRelationName, studentRollnoJsonObj);
        jQuery.ajaxSetup({ async: false });
        // make GET request
        var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
        jQuery.ajaxSetup({ async: true });
        // Enable all feild
        $('#Rollno').prop('disabled', false);
        $('#Studname').prop('disabled', false);
        $('#class').prop('disabled', false);
        $('#DOB').prop('disabled', false);
        $('#Address').prop('disabled', false);
        $('#enrollmentDate').prop('disabled', false);
        

        if (resJsonObj.status === 400) { // if student is not exist already with same roll number then enable save and reset btn
            $('#resetBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', true);
            fillData("");
            $('#Studname').focus();
        } else if (resJsonObj.status === 200) {// if student is exist already with same roll number then enable update and reset btn
            $('#Rollno').prop('disabled', true);
            fillData(resJsonObj);
            $('#resetBtn').prop('disabled', false);
            $('#updateBtn').prop('disabled', false);
            $('#saveBtn').prop('disabled', true);
            $('#Rollno').focus();
        }
    }
}




function saveData() {
    let jsonStrObj = validateData();
    if (jsonStrObj === "") {
        return "";
    }
    let putRequest = createPUTRequest(connectionToken, jsonStrObj, studentDatabaseName, studentRelationName);
    jQuery.ajaxSetup({ async: false });

    var resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 400) {// If data is not saved
        alertHandler(0, 'Data Is Not Saved ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alertHandler(1, 'Data Saved successfully');
    }
    console.log("Data saved");
    //After saving to databse resent from data 
    resetForm();

    $('#Rollno').focus();
}


function resetForm() {
    $('#Rollno').val("");
    $('#Studname').val("");
    $('#class').val("");
    $('#DOB').val("");
    $('#Address').val("");
    $('#enrollmentDate').val("");
    $('#Rollno').prop("disabled", false);
    $('#saveBtn').prop("disabled", true);
    $('#updateBtn').prop("disabled", true);
    $('#resetBtn').prop("disabled", true);
    $('#Rollno').focus();
}

function changeData() {
    $('#updateBtn').prop('disabled', true);
    var jsonChg = validateData(); // Before making UPDATE Request validate form data

    // Create UPDATE Request object
    var updateRequest = createUPDATERecordRequest(connectionToken, jsonChg, studentDatabaseName, studentRelationName, localStorage.getItem("recordNo"));
    jQuery.ajaxSetup({ async: false });

    //Make UPDATE Request
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpbdIML);
    jQuery.ajaxSetup({ async: true });
    console.log(resJsonObj);
    if (resJsonObj.status === 400) {// If data is not saved
        alertHandler(0, 'Data Is Not Update ( Message: ' + resJsonObj.message + " )");
    } else if (resJsonObj.status === 200) {// If data is successfully saved
        alertHandler(1, 'Data Update successfully');
    }

    //After updating to databse resent from data
    resetForm();
    $('#Rollno').focus();
}
