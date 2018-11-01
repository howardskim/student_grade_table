$(document).ready(initializeApp);
var student_array = [];

function initializeApp() {
    getDataFromServer();
    addClickHandlersToElements();
    $('#errorModal').modal('hide');
    $(document).ajaxStart(function () {
        $('.fa-spin').show();
    })
    $(document).ajaxComplete(function () {
        $('.fa-spin').hide();
    })
}

function addClickHandlersToElements() {
    $('.addButton').on('click', handleAddClicked)
    $('.cancelButton').on('click', handleCancelClick)
    $('.getDataFromServerButton').on('click', getDataFromServer);
    $('#cancelChanges').on('click', function(){
        $('#editModal').modal('hide');
    })
    $('#studentName').on('click', function(){
        $(this).parent().removeClass('has-error')
    })
    $('#studentGrade').on('click', function () {
        $(this).parent().removeClass('has-error')
    })
    $('#course').on('click', function () {
        $(this).parent().removeClass('has-error')
    })
}
function validateInputs(input){
    let inputArray = input.split('')
    let capitalized = inputArray[0].toUpperCase();
    inputArray[0] = capitalized;
    return inputArray.join(''); 
}

function handleAddClicked() {
    let studentName = $('#studentName').val();
    let courseName = $('#course').val();
    let studentGrade = $('#studentGrade').val();
    let studentNameResult = /^[a-zA-Z ]+$/.test(studentName);
    if (studentName === '' && courseName === '' && studentGrade === '') {
        return;
    } 
    if(isNaN(studentGrade) || studentGrade === ""){
        $('#studentGrade').parent().addClass('has-error')
        $('#validationModal').modal('show');
        $('#validateText').text('Please Enter A Numeric Grade')
        return;
    }
    if(!isNaN(courseName) || courseName === "" || courseName.length < 3){
        $('#course').parent().addClass('has-error')
        $('#validationModal').modal('show');
        $('#validateText').text('Please Enter Valid Course Name With At Least 3 Characters')
        return  
    }
    if(!studentNameResult || studentName.length < 2){
        $('#studentName').parent().addClass('has-error')
        $('#validationModal').modal('show');
        $('#validateText').text('Please Enter Valid Student Name');
        return
    }
    addStudent();
}

function addStudent() {
    var eachStudentObject = {};
    var eachStudentName = validateInputs($('#studentName').val());
    var eachStudentCourse = validateInputs($('#course').val());
    var eachStudentGrade = $('#studentGrade').val();
    eachStudentObject.name = eachStudentName;
    eachStudentObject.course_name = eachStudentCourse;
    eachStudentObject.grade = eachStudentGrade;
    student_array.push(eachStudentObject);
    sendDataToServer(eachStudentObject);
    clearAddStudentFormInputs();
    console.log(student_array)

}

function clearAddStudentFormInputs() {
    $('#studentName').val('');
    $('#course').val('');
    $('#studentGrade').val('');
}

function updateStudentList() {
    renderStudentOnDom(student_array[student_array.length - 1]);
    var avgGrade = calculateGradeAverage(student_array);
    $('.avgGrade').text(avgGrade + '%')
}

function calculateGradeAverage(array) {
    var total = 0;
    for (var i = 0; i < array.length; i++) {
        total += parseInt(array[i].grade);
    }
    var averageGrade = parseInt(total / array.length);
    if (isNaN(averageGrade)) {
        averageGrade = 0;
    }
    return averageGrade;
}

function handleCancelClick() {
    clearAddStudentFormInputs();
}

function renderStudentOnDom(eachStudentObject) {
    var tableRow = $('<tr>');
    var tableName = $('<td>');
    var tableCourse = $('<td>');
    var tableGrade = $('<td>');
    var tableButton = $('<td>');
    var editButtonTD = $('<td>')
    var deleteButton = $('<button>', {
        class: 'btn btn-danger dButton',
        id: eachStudentObject.id,
        style: 'margin-top: 1%; margin-left: 3%',
        text: 'Delete'
    });
    var editButton = $('<button>', {
        class: 'btn btn-warning editButton',
        id: eachStudentObject.id,
        text: 'Update',
        style: 'margin-top: 1%'
    })
    deleteButton.on('click', function () {
        $('#confirmDeleteModal').modal({
            show: true
        });
        
        function confirmDelete() {
            $(closestRow).remove();
            //this is the main function to delete the student object that was clicked
            handleDeleteButton(eachStudentObject);

            //this is the function that deletes the data from the server
            deleteStudentFromDatabase(eachStudentObject);
            $('#confirmDeleteModal').modal('hide')
        }

        var closestRow = this.closest('tr');
        $('.confirmh5').text(`Are you sure you want to delete ${eachStudentObject.name}?`);
        $('.confirmDeleteButton').off();
        $('.confirmDeleteButton').on('click', confirmDelete);
    });
    editButton.on('click',  function() {
        $('#editModal').modal({
            show: true
        })
        $('#editModalHeader').text(`Student: ${eachStudentObject.name}`)
        var studentID = $(this).attr('id');
        $('#idHolder').text(`ID: ${studentID}`);
        $('#saveChanges').off();
        $('#saveChanges').on('click', handleSavedUpdate);
        $('#editName').val(eachStudentObject.name)
        $('#editCourse').val(eachStudentObject.course_name)
        $('#editGrade').val(eachStudentObject.grade)

    })
    tableButton.append(deleteButton);
    editButtonTD.append(editButton, deleteButton)
    tableName.text(eachStudentObject.name);
    tableCourse.text(eachStudentObject.course_name);
    tableGrade.text(eachStudentObject.grade);
    tableRow.append(tableName, tableCourse, tableGrade, editButtonTD, tableButton);
    $('tbody').append(tableRow);
}

function handleSavedUpdate(){
    var editedName = $('#editName').val();
    var editedCourse = $('#editCourse').val();
    var editedGrade = $('#editGrade').val();
    var buttonID = parseInt($('#idHolder').text().slice(3));
    let editedNameResult = /^[a-zA-Z ]+$/.test(editedName);
    let editedCourseResult = /^[a-zA-Z ]+$/.test(editedCourse);
    if (editedName === '' && editedCourse === '' && editedGrade === '') {
        return;
    }

    if (isNaN(editedGrade) || editedGrade === "") {
        $('#editModalText').text('Please Enter A Numeric Grade')
        return;
    }
    if (!isNaN(editedCourse) || editedCourse === "" || editedCourse.length < 3 || !editedCourseResult) {
        $('#editModalText').text('Please Enter Valid Course Name With At Least 3 Characters')
        return;
    }
    if (!editedName || editedName.length < 2) {
        $('#editModalText').text('Please Enter Valid Student Name');
        return;
    }

    var the_data = {
        editedName,
        editedCourse,
        editedGrade,
        buttonID,
        action: 'update'
    }
    var ajaxOptions = {
        dataType: 'json',
        data: the_data,
        method: 'GET',
        url: 'data.php',
        success: function (response) {
            $('tbody').empty();            
            $('#editName').val('');
            $('#editCourse').val('');
            $('#editGrade').val('');
            getDataFromServer();
            updateStudentList();
        },
        error: function () {
            $('#errorModal').modal('show');
        }
    }
    $.ajax(ajaxOptions);
    $('#editModal').modal('hide');
    $('#editModalText').text('')
}

function handleDeleteButton(currentStudent) {
    console.log('current student', currentStudent, 'student array:', student_array);
    var deletePosition = student_array.indexOf(currentStudent);
    student_array.splice(deletePosition, 1);
    currentStudent = null;
    var avgGrade = calculateGradeAverage(student_array);
    $('.avgGrade').text(avgGrade + '%');
}

function getDataFromServer() {
    var the_data = {
        action: 'readAll'
    }
    var ajaxOptions = {
        dataType: 'json',
        data: the_data,
        method: 'GET',
        url: 'data.php',
        success: function (response) {
            $('tbody').empty();
            var responseArray = response.data;
            if (responseArray) {
                for (let i = 0; i < responseArray.length; i++) {
                    student_array = responseArray;
                    renderStudentOnDom(responseArray[i]);
                }
                var avgGrade = calculateGradeAverage(responseArray);
                $('.avgGrade').text(avgGrade + '%');
            }
        },
        error: function () {
            console.log('error')
        }
    }
    $.ajax(ajaxOptions);
}

function sendDataToServer(eachStudentObject) {
    var the_data = {
        action: 'insert',
        name: eachStudentObject.name,
        grade: eachStudentObject.grade,
        course: eachStudentObject.course_name,
    }
    var ajaxOptions = {
        dataType: 'json',
        data: the_data,
        method: 'GET',
        url: 'data.php',
        success: function (response) {
            eachStudentObject.id = response.insertID;
            getDataFromServer();
            updateStudentList();
        },
        error: function () {
            $('#errorModal').modal('show');
        }
    }
    $.ajax(ajaxOptions);
}

function deleteStudentFromDatabase(eachStudentObject) {
    var the_data = {
        action: 'delete',
        student_id: parseInt(eachStudentObject.id)
    }
    var ajaxOptions = {
        dataType: 'json',
        data: the_data,
        method: 'GET',
        url: 'data.php',
        success: function (response) {

        },
        error: function () {
            $('#errorModal').modal('show');
        }
    }
    $.ajax(ajaxOptions);
}