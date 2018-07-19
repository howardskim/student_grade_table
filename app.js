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
    var eachStudentId = student_array[student_array.length - 1].id + 1;
    eachStudentObject.id = eachStudentId;
    eachStudentObject.name = eachStudentName;
    eachStudentObject.course = eachStudentCourse;
    eachStudentObject.grade = eachStudentGrade;
    student_array.push(eachStudentObject);
    clearAddStudentFormInputs();
    updateStudentList();
    sendDataToServer(eachStudentObject)
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
    $('.avgGrade').text(avgGrade)
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
        id: 'editEntry',
        text: 'Update'
    })
    deleteButton.on('click', function () {
        $('#confirmDeleteModal').modal({
            show: true
        });
        var closestRow = this.closest('tr');
        $('.confirmh5').text(`Are you sure you want to delete ${eachStudentObject.name}?`);
        $('.confirmDeleteButton').on('click', function () {
            $(closestRow).remove();
            handleDeleteButton(eachStudentObject);
            deleteStudentFromDatabase(eachStudentObject);
            $('#confirmDeleteModal').modal('hide')
        })
    });
    editButton.on('click', function () {
        $('#editModal').modal({
            show: true
        })
        console.log($(this))
        handleEditButton();

    })
    tableButton.append(deleteButton);
    editButtonTD.append(editButton)
    tableName.text(eachStudentObject.name);
    tableCourse.text(eachStudentObject.course);
    tableGrade.text(eachStudentObject.grade);
    tableRow.append(tableName, tableCourse, tableGrade, editButtonTD, tableButton);
    $('tbody').append(tableRow);
}

function handleEditButton() {

}

function handleDeleteButton(currentStudent) {
    // debugger;
    student_array.splice(currentStudent, 1);
    var avgGrade = calculateGradeAverage(student_array);
    $('.avgGrade').text(avgGrade);
    $('#confirmDeleteModal').modal({
        show: false
    });


}

function getDataFromServer() {
    var the_data = {
        api_key: '7Rc7NsB569'
    }
    var ajaxOptions = {
        dataType: 'json',
        data: the_data,
        method: 'POST',
        url: 'https://s-apis.learningfuze.com/sgt/get',
        success: function (response) {
            var responseArray = response.data;
            console.log(responseArray);
            for (var i = 0; i < responseArray.length; i++) {
                student_array = responseArray;
                renderStudentOnDom(responseArray[i]);
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
        api_key: '7Rc7NsB569',
        name: eachStudentObject.name,
        grade: eachStudentObject.grade,
        course: eachStudentObject.course,
        student_id: parseInt(eachStudentObject.id)
    }
    var ajaxOptions = {
        dataType: 'json',
        data: the_data,
        method: 'POST',
        url: 'https://s-apis.learningfuze.com/sgt/create',
        success: function () {
            console.log('success');
            console.log(student_array)
        },
        error: function () {
            $('#errorModal').modal('show');
        }
    }
    $.ajax(ajaxOptions);

}

function deleteStudentFromDatabase(eachStudentObject) {
    var the_data = {
        api_key: '7Rc7NsB569',
        student_id: parseInt(eachStudentObject.id)
    }
    var ajaxOptions = {
        dataType: 'json',
        data: the_data,
        method: 'POST',
        url: 'https://s-apis.learningfuze.com/sgt/delete',
        success: function () {
            console.log(eachStudentObject)
        },
        error: function () {
            $('#errorModal').modal('show');
        }
    }
    $.ajax(ajaxOptions);
}