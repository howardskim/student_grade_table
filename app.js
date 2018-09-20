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
    $('#saveChanges').on('click', function () {
        $('#editModal').modal('hide');
    })
}

function handleAddClicked() {
    if ($('#studentName').val() === '' && $('#course').val() === '' && $('#studentGrade').val() === '') {
        return;
    }
    addStudent();
}

function addStudent() {
    var eachStudentObject = {};
    var eachStudentName = $('#studentName').val();
    var eachStudentCourse = $('#course').val();
    var eachStudentGrade = $('#studentGrade').val();
    eachStudentObject.name = eachStudentName;
    eachStudentObject.course_name = eachStudentCourse;
    eachStudentObject.grade = eachStudentGrade;
    student_array.push(eachStudentObject);
    clearAddStudentFormInputs();
    sendDataToServer(eachStudentObject);
    getDataFromServer();
    updateStudentList();

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
        text: 'Delete'
    });
    var editButton = $('<button>', {
        class: 'btn btn-warning editButton',
        id: eachStudentObject.id,
        text: 'Edit'
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
        console.log(this);
        var studentID = $(this).attr('id');
        $('#idHolder').text(studentID);
        $('#saveChanges').on('click', handleSavedUpdate);
    })
    tableButton.append(deleteButton);
    editButtonTD.append(editButton)
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
    var buttonID = $('#idHolder').text();
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
            $('#editName').val('');
            $('#editCourse').val('');
            $('#editGrade').val('');
            $('tbody').empty();
            getDataFromServer();
            updateStudentList();
        },
        error: function () {
            $('#errorModal').modal('show');
        }
    }
    $.ajax(ajaxOptions);
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