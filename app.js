$(document).ready(initializeApp);
var student_array = [];

function initializeApp() {
    addClickHandlersToElements();
    getDataFromServer();
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
    eachStudentObject.name = eachStudentName;
    eachStudentObject.course = eachStudentCourse;
    eachStudentObject.grade = eachStudentGrade;
    student_array.push(eachStudentObject);
    clearAddStudentFormInputs();
    updateStudentList();
    console.log(student_array)
}

function clearAddStudentFormInputs() {
    $('#studentName').val('');
    $('#course').val('');
    $('#studentGrade').val('');
}

function updateStudentList() {
    renderStudentOnDom(student_array[student_array.length-1]);
    var avgGrade = calculateGradeAverage(student_array);
    $('.avgGrade').text(avgGrade)
}

function calculateGradeAverage(array) {
    var total = 0;
    for (var i = 0; i < array.length; i++) {
        total += parseInt(array[i].grade);
    }
    var averageGrade = parseInt(total / array.length);
    if(isNaN(averageGrade)){
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
        var tableButton = $('<td>')
        var deleteButton = $('<button>', {
            class: 'btn btn-danger dButton',
            id: eachStudentObject.id,
            text: 'Delete'
        });
        deleteButton.on('click', function() {
            this.closest('tr').remove();
            handleDeleteButton(eachStudentObject);
        })
        tableButton.append(deleteButton)
        tableName.text(eachStudentObject.name);
        tableCourse.text(eachStudentObject.course);
        tableGrade.text(eachStudentObject.grade);
        tableRow.append(tableName, tableCourse, tableGrade, tableButton);
        $('tbody').append(tableRow);
}

function handleDeleteButton(currentStudent) {
    student_array.splice(currentStudent, 1)
    var avgGrade = calculateGradeAverage(student_array);
    $('.avgGrade').text(avgGrade)

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
            student_array = responseArray;
            for(var i = 0; i < responseArray.length; i++){
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