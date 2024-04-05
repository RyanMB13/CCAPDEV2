document.addEventListener("DOMContentLoaded", function () {
  const answerBtns = document.querySelectorAll('.answer-btn');

  answerBtns.forEach(answerBtn => {
    let answered = false;
    answerBtn.addEventListener('click', async function () {
      if (!answered) {
        answered = true;
        const surveyId = this.dataset.surveyId;
        try {
          const response = await fetch(`/answerSurvey/${surveyId}`, {
            method: 'POST',
          });
          if (!response.ok) {
            throw new Error('Failed to answer survey');
          }
          const data = await response.json();
          const answerCount = this.querySelector('.answer-count');
          answerCount.textContent = data.answers;
        } catch (error) {
          console.error('Error answering survey:', error);
        }
      }
    });
  });

  const deleteSurveyBtn = document.querySelector('.delete-survey-btn');

  deleteSurveyBtn.addEventListener('click', async function () {
    const surveyId = this.dataset.surveyId;
    try {
      const response = await fetch(`/deleteSurvey/${surveyId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to delete survey');
      }
      window.location.href = '/survey'; 
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  });

  const editSurveyBtn = document.querySelector('.edit-survey-btn');

  editSurveyBtn.addEventListener('click', async function () {
    const surveyId = this.dataset.surveyId;

    console.log('Edit button clicked for survey ID:', surveyId);

    // Retrieve the current survey title and content
    const surveyTitleElement = document.getElementById('survey_title');
    const surveyDescriptionElement = document.getElementById('survey_description');
    const currentSurveyTitle = surveyTitleElement.textContent;
    const currentSurveyDescription = surveyDescriptionElement.textContent;

    console.log('Current survey title:', currentSurveyTitle);
    console.log('Current survey content:', currentSurveyContent);

    // Prompt the user to enter the new Survey title and content
    const newSurveyTitle = prompt('Enter the new survey title:', currentSurveyTitle);
    const newSurveyDescription = prompt('Enter the new survey description:', currentSurveyDescription);

    console.log('New survey title entered by user:', newSurveyTitle);
    console.log('New survey content entered by user:', newSurveyDescription);

    if (newSurveyTitle !== null && newSurveyContent !== null) {
      try {
        // Send a POST request to the server to update the Survey data
        const response = await fetch(`/editSurvey/${surveyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ surveyTitle: newSurveyTitle, surveyDescription: newSurveyDescription })
        });

        if (!response.ok) {
          throw new Error('Failed to edit survey');
        }

        console.log('Survey successfully edited.');

        // Reload the page to reflect the updated survey data
        window.location.reload();
      } catch (error) {
        console.error('Error editing survey:', error);
        alert('Failed to edit survey. Please try again later.');
      }
    } else {
      console.log('User canceled the edit operation.');
    }
  });
});
