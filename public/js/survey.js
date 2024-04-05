const showSurveyFormBtn = document.getElementById('showSurveyFormBtn');
const surveyFormContainer = document.getElementById('surveyFormContainer');

let formVisible = false;

showSurveyFormBtn.addEventListener('click', () => {
    formVisible = !formVisible; // Toggle form visibility
    surveyFormContainer.style.display = formVisible ? 'block' : 'none';
    if (formVisible) {
        document.getElementById('survey_date').value = new Date().toISOString().split('T')[0];
    }
});
